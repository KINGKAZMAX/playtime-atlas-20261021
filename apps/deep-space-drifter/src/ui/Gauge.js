/**
 * Secondary round CRT — a compass / slip / vertical-speed repeater.
 * Drawn onto a 256×256 canvas that is mapped onto the round instrument.
 */
export class Gauge {
  constructor(size = 256) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx = this.canvas.getContext('2d');
    this._accum = 0;
  }

  update(dt, state, hz = 12) {
    this._accum += dt;
    if (this._accum < 1 / hz) return;
    this._accum = 0;
    this.draw(state);
  }

  draw(s) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = W * 0.44;

    ctx.fillStyle = '#0b0805';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(233,169,61,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R - 3, 0, Math.PI * 2);
    ctx.stroke();

    // Compass rose
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-s.heading);
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const major = i % 9 === 0;
      const len = major ? 20 : (i % 3 === 0 ? 12 : 7);
      ctx.strokeStyle = major ? 'rgba(243,231,210,0.9)' : 'rgba(233,169,61,0.42)';
      ctx.lineWidth = major ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(Math.sin(a) * (R - 12), -Math.cos(a) * (R - 12));
      ctx.lineTo(Math.sin(a) * (R - 12 - len), -Math.cos(a) * (R - 12 - len));
      ctx.stroke();
    }
    // Cardinal marks
    ctx.font = 'bold 15px "Menlo", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cards = [['N', 0], ['E', 90], ['S', 180], ['W', 270]];
    for (const [ch, deg] of cards) {
      const a = (deg - 90) * Math.PI / 180;
      ctx.fillStyle = ch === 'N' ? '#E9A93D' : 'rgba(243,231,210,0.72)';
      ctx.fillText(ch, Math.cos(a) * (R - 34), Math.sin(a) * (R - 34));
    }
    ctx.restore();

    // Fixed lubber line
    ctx.strokeStyle = '#F3E7D2';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - R + 14);
    ctx.lineTo(cx, cy - R + 34);
    ctx.stroke();

    // Ship symbol
    ctx.strokeStyle = '#F3E7D2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 13, cy); ctx.lineTo(cx - 5, cy); ctx.lineTo(cx, cy + 6);
    ctx.lineTo(cx + 5, cy); ctx.lineTo(cx + 13, cy);
    ctx.stroke();

    // Slip indicator (ball) at the bottom
    const slip = Math.max(-1, Math.min(1, s.slip));
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 52, 42, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(233,169,61,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#E9A93D';
    ctx.beginPath();
    ctx.arc(cx + slip * 36, cy + 52, 6, 0, Math.PI * 2);
    ctx.fill();

    // Vertical speed tape on the left edge
    ctx.font = '9px "Menlo", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(233,169,61,0.7)';
    ctx.fillText('V/S', 8, 20);
    ctx.fillStyle = '#F3E7D2';
    ctx.font = 'bold 13px "Menlo", monospace';
    ctx.fillText(`${Math.round(s.verticalSpeed * 100)}`, 8, 36);

    // Altitude on the right edge
    ctx.font = '9px "Menlo", monospace';
    ctx.fillStyle = 'rgba(233,169,61,0.7)';
    ctx.fillText('ALT', W - 34, 20);
    ctx.fillStyle = '#F3E7D2';
    ctx.font = 'bold 13px "Menlo", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${(s.altitudeKm).toFixed(1)}`, W - 8, 36);
  }
}
