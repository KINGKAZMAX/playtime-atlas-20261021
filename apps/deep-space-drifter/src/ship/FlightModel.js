import * as THREE from 'three';
import { SHIP, SPAWN } from '../world/Config.js';

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _q = new THREE.Quaternion();

/**
 * Six-degree-of-freedom rigid body for the ship.
 *
 * - Attitude is stored as a quaternion and integrated with the body-frame
 *   angular velocity, so pitch/yaw/roll never interfere with one another.
 * - Translation is Newtonian: thrust only accelerates, nothing slows you
 *   down except the brake or optional flight assist.
 * - All integration happens at a fixed timestep supplied by the caller,
 *   which makes the motion completely frame-rate independent.
 */
export class FlightModel {
  constructor(settings) {
    this.settings = settings;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();

    /** Body-frame angular velocity (rad/s): x=pitch, y=yaw, z=roll */
    this.angularVelocity = new THREE.Vector3();
    this._mouseOmega = new THREE.Vector3();
    this._keyOmega = new THREE.Vector3();

    this.fuel = SHIP.fuelCapacity;
    this.hull = SHIP.hullMax;
    this.throttle = 0;         // 0..1 forward thrust demand
    this.lateral = 0;
    this.vertical = 0;
    this.boosting = false;
    this.braking = false;
    this.burning = false;      // inside atmosphere
    this.heat = 0;
    this.assist = true;

    this.forward = new THREE.Vector3(0, 0, -1);
    this.right = new THREE.Vector3(1, 0, 0);
    this.up = new THREE.Vector3(0, 1, 0);

    this.distanceTravelled = 0;
    this.reset();
  }

  reset() {
    this.position.copy(SPAWN.position);
    this.velocity.copy(SPAWN.velocity);
    this._lookAt(SPAWN.lookAt);
    this.angularVelocity.set(0, 0, 0);
    this._mouseOmega.set(0, 0, 0);
    this._keyOmega.set(0, 0, 0);
    this.throttle = 0;
    this.lateral = 0;
    this.vertical = 0;
    this.boosting = false;
    this.braking = false;
    this.heat = 0;
    this.fuel = SHIP.fuelCapacity;
    this.hull = SHIP.hullMax;
    this._syncBasis();
  }

  _lookAt(target) {
    const dir = _v.copy(target).sub(this.position).normalize();
    this.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir);
  }

  _syncBasis() {
    this.forward.set(0, 0, -1).applyQuaternion(this.quaternion);
    this.right.set(1, 0, 0).applyQuaternion(this.quaternion);
    this.up.set(0, 1, 0).applyQuaternion(this.quaternion);
  }

  get speed() {
    return this.velocity.length();
  }

  /** Mouse delta in pixels → body-frame angular impulse. */
  applyMouseDelta(dx, dy) {
    const gain = SHIP.mouseGain * (this.settings ? this.settings.get('sensitivity') : 1);
    const invert = this.settings ? this.settings.get('invertY') : false;
    const pitchSign = invert ? 1 : -1;
    this._mouseOmega.x += pitchSign * dy * gain;
    this._mouseOmega.y += -dx * gain;
    this._mouseOmega.z += 0;
  }

  /**
   * Integrate one fixed step.
   * @param {number} dt fixed timestep in seconds
   * @param {object} cmd  { forward, back, left, right, up, down, rollLeft, rollRight, boost, brake }
   */
  step(dt, cmd) {
    const damping = Math.exp(-SHIP.rateDamp * dt);

    // --- Angular ----------------------------------------------------
    this._keyOmega.set(0, 0, 0);
    if (cmd.keyPitchUp) this._keyOmega.x += SHIP.keyRate;
    if (cmd.keyPitchDown) this._keyOmega.x -= SHIP.keyRate;
    if (cmd.keyYawLeft) this._keyOmega.y += SHIP.keyRate;
    if (cmd.keyYawRight) this._keyOmega.y -= SHIP.keyRate;
    if (cmd.rollLeft) this._keyOmega.z += SHIP.rollRate;
    if (cmd.rollRight) this._keyOmega.z -= SHIP.rollRate;

    this._mouseOmega.multiplyScalar(damping);
    this.angularVelocity.copy(this._mouseOmega).add(this._keyOmega);

    const omega = this.angularVelocity;
    const half = 0.5 * dt;
    _q.set(omega.x * half, omega.y * half, omega.z * half, 1).normalize();
    this.quaternion.multiply(_q).normalize();
    this._syncBasis();

    // --- Linear -----------------------------------------------------
    let fx = 0, fy = 0, fz = 0;
    this.throttle = cmd.forward ? 1 : (cmd.back ? -1 : 0);
    this.lateral = (cmd.right ? 1 : 0) - (cmd.left ? 1 : 0);
    this.vertical = (cmd.up ? 1 : 0) - (cmd.down ? 1 : 0);

    const boostAvailable = cmd.boost && this.fuel > 0;
    this.boosting = Boolean(boostAvailable);
    const boostMul = boostAvailable ? SHIP.boostMultiplier : 1;

    if (cmd.forward) fz -= SHIP.thrustAccel * boostMul;
    if (cmd.back) fz += SHIP.thrustAccel * 0.75;
    if (cmd.right) fx += SHIP.lateralAccel * (boostAvailable ? 1.8 : 1);
    if (cmd.left) fx -= SHIP.lateralAccel * (boostAvailable ? 1.8 : 1);
    if (cmd.up) fy += SHIP.verticalAccel * (boostAvailable ? 1.8 : 1);
    if (cmd.down) fy -= SHIP.verticalAccel * (boostAvailable ? 1.8 : 1);

    // Local → world
    _v.set(fx, fy, fz).applyQuaternion(this.quaternion);
    this.velocity.addScaledVector(_v, dt);

    // Brake: counter-thrust against current motion
    this.braking = Boolean(cmd.brake);
    if (this.braking) {
      const sp = this.velocity.length();
      if (sp > 0.0001) {
        this.velocity.addScaledVector(_v2.copy(this.velocity).normalize(), -SHIP.brakeAccel * dt);
      }
    }

    // Flight assist: light drag when the pilot is not on the throttle.
    this.assist = this.settings ? this.settings.get('flightAssist') : true;
    if (this.assist) {
      const idle = !cmd.forward && !cmd.back && !cmd.left && !cmd.right && !cmd.up && !cmd.down;
      const k = idle ? SHIP.assistDamping : SHIP.assistDamping * 0.25;
      this.velocity.multiplyScalar(Math.exp(-k * dt));
    }

    // Atmosphere drag / heat
    if (this.burning) {
      this.velocity.multiplyScalar(Math.exp(-0.55 * dt));
      this.heat = Math.min(1, this.heat + dt * 0.55);
    } else {
      this.heat = Math.max(0, this.heat - dt * 0.4);
    }

    // Hard speed cap
    const sp = this.velocity.length();
    if (sp > SHIP.maxSpeed) {
      this.velocity.multiplyScalar(SHIP.maxSpeed / sp);
    }

    // Fuel burn from afterburner
    if (this.boosting) {
      this.fuel = Math.max(0, this.fuel - SHIP.boostFuelPerSecond * dt);
    }

    // Integrate position
    const step = this.velocity.length() * dt;
    this.position.addScaledVector(this.velocity, dt);
    this.distanceTravelled += step;
  }

  /** Apply an instantaneous collision response (normal + restitution). */
  applyCollision(normal, penetration, damage = 0, restitution = 0.25) {
    this.position.addScaledVector(normal, penetration);
    const vn = this.velocity.dot(normal);
    if (vn < 0) {
      this.velocity.addScaledVector(normal, -vn * (1 + restitution));
    }
    if (damage > 0) {
      this.hull = Math.max(0, this.hull - damage);
    }
  }

  setPose(position, quaternion) {
    this.position.copy(position);
    this.quaternion.copy(quaternion);
    this.velocity.set(0, 0, 0);
    this.angularVelocity.set(0, 0, 0);
    this._mouseOmega.set(0, 0, 0);
    this._keyOmega.set(0, 0, 0);
    this._syncBasis();
  }
}
