/**
 * 回响电玩馆 — 6 件原创硬件展品的几何构建器
 * 供 build-models.mjs（GLB）与 build-tech-svg.mjs（技术插画降级图）共用。
 */

import {
  box, roundedBox, cylinder, sphere, torus, plane, tube, dpad,
  place, mergeMeshes, bounds, emptyMesh,
} from './geometry.mjs';

const p = (name, mesh, material) => ({ name, mesh, material });

/* ================================================================== *
 * 1. 星港立式机柜 — 1970s 街机
 * ================================================================== */
function cabinet01() {
  const parts = [];
  const W = 0.72, D = 0.85, H = 1.78;
  const fz = D / 2;

  parts.push(p('底座底墩', place(box(W, 0.07, D), [0, 0.035, 0]), 'shell-deep'));
  parts.push(p('机身主体', place(box(0.66, 1.30, 0.78), [0, 0.72, 0]), 'shell-dark'));
  parts.push(p('顶部压条', place(box(0.68, 0.045, 0.80), [0, 1.392, 0]), 'shell-mid'));

  /* 灯箱 */
  parts.push(p('灯箱外壳', place(box(0.66, 0.30, 0.10), [0, 1.615, fz - 0.05]), 'shell-deep'));
  parts.push(p('灯箱灯面', place(box(0.58, 0.22, 0.012), [0, 1.615, fz + 0.006]), 'accent-lit'));
  /* 灯箱上的抽象原创标记：三条斜杠 */
  for (let i = 0; i < 3; i++) {
    parts.push(
      p(
        `灯箱标记${i + 1}`,
        place(box(0.035, 0.17, 0.006), [(-0.09 + i * 0.09), 1.615, fz + 0.013], [0, 0, 22]),
        'shell-deep',
      ),
    );
  }

  /* 屏幕 */
  parts.push(p('屏幕边框', place(box(0.60, 0.50, 0.08), [0, 1.17, fz - 0.04]), 'shell-deep'));
  parts.push(p('屏幕玻璃', place(box(0.50, 0.40, 0.014), [0, 1.17, fz + 0.004]), 'screen-glass'));
  parts.push(p('屏幕辉光', place(box(0.455, 0.355, 0.006), [0, 1.17, fz + 0.014]), 'screen-glow'));

  /* 控制台（斜面） */
  const deck = place(box(0.62, 0.085, 0.30), [0, 0.905, fz + 0.10], [-22, 0, 0]);
  parts.push(p('操作台', deck, 'shell-mid'));
  parts.push(
    p('操作台面板', place(box(0.54, 0.012, 0.24), [0, 0.945, fz + 0.095], [-22, 0, 0]), 'cream'),
  );
  /* 摇杆 */
  parts.push(p('摇杆底座', place(cylinder(0.030, 0.032, 0.012, 20), [-0.15, 0.968, fz + 0.055], [-22, 0, 0]), 'shell-deep'));
  parts.push(p('摇杆杆', place(cylinder(0.006, 0.007, 0.055, 12), [-0.15, 0.995, fz + 0.062], [-22, 0, 0]), 'metal-dark'));
  parts.push(p('摇杆球头', place(sphere(0.015, 18, 12), [-0.15, 1.022, fz + 0.068]), 'accent'));
  /* 按键 */
  parts.push(p('按键A', place(cylinder(0.012, 0.012, 0.009, 18), [0.09, 0.958, fz + 0.085], [-22, 0, 0]), 'cream'));
  parts.push(p('按键B', place(cylinder(0.012, 0.012, 0.009, 18), [0.15, 0.958, fz + 0.075], [-22, 0, 0]), 'accent'));

  /* 投币门 */
  parts.push(p('投币门', place(box(0.20, 0.28, 0.026), [0, 0.50, fz + 0.005]), 'shell-deep'));
  parts.push(p('投币口上', place(box(0.10, 0.012, 0.010), [0, 0.575, fz + 0.020]), 'metal'));
  parts.push(p('投币口下', place(box(0.10, 0.012, 0.010), [0, 0.525, fz + 0.020]), 'metal'));
  parts.push(p('退币口', place(box(0.07, 0.030, 0.010), [0, 0.435, fz + 0.020]), 'metal-dark'));

  /* 侧板与斜纹 */
  for (const side of [-1, 1]) {
    parts.push(
      p(`侧板${side < 0 ? '左' : '右'}`, place(box(0.010, 1.18, 0.70), [side * 0.335, 0.72, 0]), 'shell-mid'),
    );
    for (let i = 0; i < 3; i++) {
      parts.push(
        p(
          `侧板斜纹${side < 0 ? '左' : '右'}-${i + 1}`,
          place(box(0.006, 0.60, 0.035), [side * 0.343, 0.70, -0.12 + i * 0.11], [0, 0, 26]),
          'accent',
        ),
      );
    }
  }

  /* 散热百叶 */
  for (let i = 0; i < 5; i++) {
    parts.push(
      p(`散热百叶${i + 1}`, place(box(0.40, 0.012, 0.010), [0, 1.30 - i * 0.045, -D / 2 + 0.01]), 'shell-deep'),
    );
  }
  /* 前面框条 */
  parts.push(p('正面框条', place(box(0.68, 0.018, 0.012), [0, 0.90, fz + 0.012]), 'accent'));

  return { id: 'cabinet-01', parts };
}

/* ================================================================== *
 * 2. 小行星卡带机 — 1980s 八位家用主机
 * ================================================================== */
function console02() {
  const parts = [];
  const W = 0.22, D = 0.16;

  parts.push(p('主机本体', place(roundedBox(W, 0.055, D, 0.008, 4), [0, 0.0275, 0]), 'shell-mid'));
  parts.push(p('顶盖面板', place(roundedBox(0.20, 0.010, 0.142, 0.005, 3), [0, 0.056, 0]), 'cream'));
  parts.push(p('卡槽', place(box(0.10, 0.008, 0.030), [0, 0.056, -0.018]), 'shell-deep'));
  parts.push(p('卡带', place(box(0.094, 0.048, 0.052), [0, 0.070, -0.018]), 'cream-dim'));
  parts.push(p('卡带标签', place(box(0.070, 0.022, 0.004), [0, 0.082, 0.0085]), 'accent'));
  parts.push(p('前面板', place(box(0.218, 0.020, 0.006), [0, 0.026, D / 2 + 0.002]), 'shell-deep'));
  parts.push(p('电源灯', place(cylinder(0.0035, 0.0035, 0.004, 12), [0.086, 0.026, D / 2 + 0.006], [90, 0, 0]), 'accent-lit'));
  parts.push(p('手柄口左', place(box(0.018, 0.010, 0.005), [-0.055, 0.026, D / 2 + 0.006]), 'metal-dark'));
  parts.push(p('手柄口右', place(box(0.018, 0.010, 0.005), [0.055, 0.026, D / 2 + 0.006]), 'metal-dark'));
  for (let i = 0; i < 6; i++) {
    parts.push(
      p(`散热槽${i + 1}`, place(box(0.085, 0.006, 0.004), [0, 0.060, 0.045 + i * 0.008]), 'shell-deep'),
    );
  }
  for (const [i, x] of [[0, -0.085], [1, 0.085]]) {
    for (const z of [-0.055, 0.055]) {
      parts.push(p(`脚垫${i}-${z > 0 ? '前' : '后'}`, place(cylinder(0.008, 0.009, 0.004, 12), [x, 0.002, z]), 'shell-deep'));
    }
  }

  /* 两只手柄 */
  for (const side of [-1, 1]) {
    const tag = side < 0 ? '左' : '右';
    const cx = side * 0.17;
    parts.push(p(`手柄${tag}外壳`, place(roundedBox(0.046, 0.017, 0.092, 0.007, 4), [cx, 0.0085, 0.135]), 'shell-light'));
    parts.push(p(`手柄${tag}握把`, place(roundedBox(0.030, 0.013, 0.030, 0.006, 3), [cx, 0.0065, 0.185]), 'shell-light'));
    parts.push(p(`手柄${tag}十字键`, place(dpad(0.026, 0.005, 0.34), [cx - 0.001, 0.018, 0.113]), 'shell-deep'));
    parts.push(p(`手柄${tag}按键A`, place(cylinder(0.0055, 0.0055, 0.005, 14), [cx + 0.014, 0.0185, 0.110]), 'accent'));
    parts.push(p(`手柄${tag}按键B`, place(cylinder(0.0055, 0.0055, 0.005, 14), [cx + 0.014, 0.0185, 0.123]), 'cream'));
    parts.push(p(`手柄${tag}启动键`, place(box(0.010, 0.004, 0.005), [cx, 0.0175, 0.150]), 'cream-dim'));
    parts.push(
      p(
        `手柄${tag}线缆`,
        tube(
          [
            [cx - side * 0.02, 0.006, 0.092],
            [cx - side * 0.05, 0.004, 0.055],
            [side * 0.075, 0.004, 0.030],
            [side * 0.055, 0.020, D / 2 + 0.008],
          ],
          0.0022,
          6,
        ),
        'shell-deep',
      ),
    );
  }

  return { id: 'console-02', parts };
}

/* ================================================================== *
 * 3. 子午线光盘机 — 1990s 16 位光盘主机
 * ================================================================== */
function console03() {
  const parts = [];
  const W = 0.32, D = 0.24;

  parts.push(p('机身', place(roundedBox(W, 0.085, D, 0.024, 5), [0, 0.0425, 0]), 'shell-mid'));
  parts.push(p('顶盖', place(roundedBox(0.30, 0.016, 0.222, 0.012, 4), [0, 0.088, 0]), 'shell-light'));
  parts.push(p('光盘托槽', place(box(0.165, 0.006, 0.132), [0, 0.092, 0.004]), 'shell-deep'));
  parts.push(p('光盘', place(cylinder(0.058, 0.058, 0.0035, 40), [0, 0.099, 0.004], [-16, 0, 0]), 'metal'));
  parts.push(p('光盘内圈', place(cylinder(0.020, 0.020, 0.0042, 28), [0, 0.0995, 0.004], [-16, 0, 0]), 'cream'));
  parts.push(p('光盘托盘唇', place(box(0.170, 0.010, 0.012), [0, 0.094, 0.068]), 'shell-deep'));
  parts.push(p('前面板', place(box(0.318, 0.032, 0.006), [0, 0.026, D / 2 + 0.002]), 'shell-deep'));
  parts.push(p('状态灯条', place(box(0.052, 0.0042, 0.004), [0.118, 0.026, D / 2 + 0.006]), 'accent-lit'));
  parts.push(p('电源键', place(cylinder(0.008, 0.008, 0.004, 16), [-0.128, 0.026, D / 2 + 0.006], [90, 0, 0]), 'accent'));
  parts.push(p('手柄口左', place(box(0.020, 0.011, 0.005), [-0.045, 0.026, D / 2 + 0.006]), 'metal-dark'));
  parts.push(p('手柄口右', place(box(0.020, 0.011, 0.005), [0.045, 0.026, D / 2 + 0.006]), 'metal-dark'));
  for (let i = 0; i < 8; i++) {
    parts.push(
      p(`侧面散热槽${i + 1}`, place(box(0.004, 0.036, 0.008), [W / 2 + 0.001, 0.045, -0.06 + i * 0.017]), 'shell-deep'),
    );
  }

  /* 手柄 */
  const cx = 0.0, cz = 0.22;
  parts.push(p('手柄外壳', place(roundedBox(0.058, 0.020, 0.108, 0.010, 4), [cx, 0.010, cz]), 'shell-light'));
  parts.push(p('手柄左握把', place(roundedBox(0.024, 0.015, 0.034, 0.007, 3), [cx - 0.026, 0.0075, cz + 0.042], [0, 0, 12]), 'shell-light'));
  parts.push(p('手柄右握把', place(roundedBox(0.024, 0.015, 0.034, 0.007, 3), [cx + 0.026, 0.0075, cz + 0.042], [0, 0, -12]), 'shell-light'));
  parts.push(p('左摇杆座', place(cylinder(0.012, 0.014, 0.008, 18), [cx - 0.017, 0.023, cz - 0.018]), 'shell-deep'));
  parts.push(p('左摇杆帽', place(sphere(0.0095, 16, 10), [cx - 0.017, 0.030, cz - 0.018]), 'shell-deep'));
  parts.push(p('右摇杆座', place(cylinder(0.012, 0.014, 0.008, 18), [cx + 0.017, 0.023, cz + 0.020]), 'shell-deep'));
  parts.push(p('右摇杆帽', place(sphere(0.0095, 16, 10), [cx + 0.017, 0.030, cz + 0.020]), 'shell-deep'));
  const btnPos = [[0.019, -0.026], [0.028, -0.017], [0.010, -0.036], [0.019, -0.015]];
  btnPos.forEach(([bx, bz], i) => {
    parts.push(
      p(
        `面键${i + 1}`,
        place(cylinder(0.0048, 0.0048, 0.005, 14), [cx + bx, 0.0225, cz + bz]),
        i === 0 ? 'accent' : 'cream',
      ),
    );
  });
  parts.push(p('手柄十字键', place(dpad(0.020, 0.005, 0.34), [cx - 0.017, 0.0215, cz + 0.020]), 'shell-deep'));
  parts.push(
    p(
      '手柄线缆',
      tube(
        [
          [cx, 0.006, cz - 0.056],
          [cx - 0.03, 0.004, cz - 0.105],
          [cx - 0.10, 0.004, cz - 0.12],
          [0.045, 0.020, D / 2 + 0.010],
        ],
        0.0026,
        6,
      ),
      'shell-deep',
    ),
  );

  return { id: 'console-03', parts };
}

/* ================================================================== *
 * 4. 余烬掌机 — 2000s 双屏翻盖掌机
 * ================================================================== */
function handheld04() {
  const parts = [];
  const W = 0.14;

  parts.push(p('下机身', place(roundedBox(W, 0.060, 0.028, 0.006, 4), [0, 0.030, 0.008]), 'shell-mid'));
  parts.push(p('上机身', place(roundedBox(W, 0.060, 0.026, 0.006, 4), [0, 0.093, 0.026], [-24, 0, 0]), 'shell-mid'));
  parts.push(p('转轴', place(cylinder(0.0075, 0.0075, W, 18), [0, 0.060, -0.005], [0, 0, 90]), 'metal-dark'));
  parts.push(p('下屏边框', place(box(0.070, 0.044, 0.003), [0, 0.036, 0.0225]), 'shell-deep'));
  parts.push(p('下屏玻璃', place(box(0.064, 0.038, 0.002), [0, 0.036, 0.0245]), 'screen-glass'));
  parts.push(p('下屏辉光', place(box(0.059, 0.033, 0.001), [0, 0.036, 0.0258]), 'screen-glow'));
  parts.push(p('上屏边框', place(box(0.070, 0.042, 0.003), [0, 0.092, 0.038], [-24, 0, 0]), 'shell-deep'));
  parts.push(p('上屏玻璃', place(box(0.064, 0.036, 0.002), [0, 0.092, 0.040], [-24, 0, 0]), 'screen-glass'));
  parts.push(p('上屏辉光', place(box(0.059, 0.031, 0.001), [0, 0.092, 0.0414], [-24, 0, 0]), 'screen-glow'));
  parts.push(p('十字键', place(dpad(0.026, 0.005, 0.34), [-0.043, 0.035, 0.016]), 'shell-deep'));
  parts.push(p('按键A', place(cylinder(0.0058, 0.0058, 0.005, 14), [0.043, 0.0345, 0.014]), 'accent'));
  parts.push(p('按键B', place(cylinder(0.0058, 0.0058, 0.005, 14), [0.030, 0.0345, 0.028]), 'cream'));
  parts.push(p('开始键', place(box(0.011, 0.003, 0.004), [-0.012, 0.0325, 0.022]), 'cream-dim'));
  parts.push(p('选择键', place(box(0.011, 0.003, 0.004), [0.014, 0.0325, 0.022]), 'cream-dim'));
  parts.push(p('肩键左', place(box(0.026, 0.006, 0.012), [-0.040, 0.062, 0.006], [-24, 0, 0]), 'shell-light'));
  parts.push(p('肩键右', place(box(0.026, 0.006, 0.012), [0.040, 0.062, 0.006], [-24, 0, 0]), 'shell-light'));
  parts.push(p('扬声器格栅', place(box(0.030, 0.004, 0.004), [0.0, 0.050, 0.020], [0, 0, 0]), 'shell-deep'));
  parts.push(p('状态灯', place(box(0.012, 0.003, 0.002), [0.055, 0.052, 0.006], [-24, 0, 0]), 'accent-lit'));
  parts.push(p('正面饰条', place(box(0.120, 0.004, 0.002), [0, 0.011, 0.023]), 'accent'));

  return { id: 'handheld-04', parts };
}

/* ================================================================== *
 * 5. 光环平板 — 2010s 平板混合主机
 * ================================================================== */
function hybrid05() {
  const parts = [];
  const W = 0.24, D = 0.17;

  parts.push(p('平板本体', place(roundedBox(W, 0.0075, D, 0.004, 4), [0, 0.004, 0]), 'shell-deep'));
  parts.push(p('平板边框', place(roundedBox(W - 0.004, 0.0055, D - 0.004, 0.003, 3), [0, 0.0068, 0]), 'shell-mid'));
  parts.push(p('平板屏幕', place(box(0.216, 0.0016, 0.146), [0, 0.0098, 0]), 'screen-glass'));
  parts.push(p('平板屏幕辉光', place(box(0.210, 0.0010, 0.140), [0, 0.0108, 0]), 'screen-glow'));
  parts.push(p('摄像头', place(cylinder(0.0022, 0.0022, 0.002, 12), [0, 0.0082, D / 2 - 0.006]), 'metal-dark'));
  parts.push(p('支撑脚', place(box(0.090, 0.0025, 0.072), [0, 0.030, -0.060], [-26, 0, 0]), 'shell-light'));
  parts.push(p('侧轨左', place(box(0.005, 0.006, 0.150), [-0.117, 0.009, 0]), 'metal'));
  parts.push(p('侧轨右', place(box(0.005, 0.006, 0.150), [0.117, 0.009, 0]), 'metal'));
  parts.push(p('后盖散热', place(box(0.070, 0.0015, 0.048), [0, 0.0082, -0.040]), 'shell-deep'));

  for (const side of [-1, 1]) {
    const tag = side < 0 ? '左' : '右';
    const cx = side * 0.163;
    parts.push(p(`手柄${tag}外壳`, place(roundedBox(0.042, 0.018, 0.092, 0.008, 4), [cx, 0.009, 0.012]), 'shell-light'));
    parts.push(p(`手柄${tag}连接臂`, place(box(0.048, 0.010, 0.020), [side * 0.139, 0.009, 0.012]), 'shell-mid'));
    parts.push(p(`手柄${tag}摇杆座`, place(cylinder(0.011, 0.013, 0.007, 16), [cx + side * 0.008, 0.0215, -0.014]), 'shell-deep'));
    parts.push(p(`手柄${tag}摇杆帽`, place(sphere(0.0090, 16, 10), [cx + side * 0.008, 0.028, -0.014]), 'shell-deep'));
    parts.push(p(`手柄${tag}十字键`, place(dpad(0.018, 0.004, 0.34), [cx - side * 0.009, 0.0205, -0.014]), 'shell-deep'));
    parts.push(p(`手柄${tag}按键A`, place(cylinder(0.0044, 0.0044, 0.004, 12), [cx + side * 0.009, 0.0205, 0.030]), 'accent'));
    parts.push(p(`手柄${tag}按键B`, place(cylinder(0.0044, 0.0044, 0.004, 12), [cx + side * 0.009, 0.0205, 0.041]), 'cream'));
    parts.push(p(`手柄${tag}按键C`, place(cylinder(0.0044, 0.0044, 0.004, 12), [cx - side * 0.010, 0.0205, 0.030]), 'cream-dim'));
  }

  return { id: 'hybrid-05', parts };
}

/* ================================================================== *
 * 6. 矢量节点 — 2020s 立式模块化主机
 * ================================================================== */
function modern06() {
  const parts = [];
  const W = 0.168, H = 0.30;

  parts.push(p('底座', place(roundedBox(0.190, 0.018, 0.190, 0.005, 3), [0, 0.009, 0]), 'shell-deep'));
  parts.push(p('机箱', place(roundedBox(W, H, W, 0.007, 4), [0, 0.018 + H / 2, 0]), 'shell-mid'));
  parts.push(p('顶盖', place(roundedBox(W - 0.006, 0.012, W - 0.006, 0.004, 3), [0, 0.018 + H + 0.005, 0.004], [-7, 0, 0]), 'shell-light'));
  parts.push(p('顶盖饰条', place(box(0.120, 0.003, 0.010), [0, 0.018 + H + 0.010, 0.026], [-7, 0, 0]), 'accent'));

  /* 前面板散热格栅 */
  for (let i = 0; i < 15; i++) {
    parts.push(
      p(`散热格栅${i + 1}`, place(box(0.112, 0.0055, 0.006), [0, 0.062 + i * 0.0155, W / 2 + 0.001]), 'shell-deep'),
    );
  }
  parts.push(p('前面板饰框', place(box(0.128, 0.250, 0.005), [0, 0.018 + H / 2, W / 2 - 0.004]), 'shell-deep'));

  /* 指示灯 */
  parts.push(p('状态指示灯', place(box(0.024, 0.005, 0.005), [0, 0.018 + H - 0.020, W / 2 + 0.004]), 'accent-lit'));
  parts.push(p('指示灯槽', place(box(0.036, 0.012, 0.004), [0, 0.018 + H - 0.020, W / 2 + 0.002]), 'shell-deep'));

  /* 可拆侧板 */
  parts.push(p('可拆侧板', place(roundedBox(0.006, 0.248, 0.140, 0.003, 3), [W / 2 + 0.004, 0.018 + H / 2, 0]), 'shell-light'));
  parts.push(p('侧板接缝', place(box(0.002, 0.252, 0.146), [W / 2 + 0.0005, 0.018 + H / 2, 0]), 'shell-deep'));
  parts.push(p('侧板扣手', place(box(0.008, 0.030, 0.010), [W / 2 + 0.008, 0.018 + H - 0.040, 0]), 'metal'));

  /* 脚垫与后部 */
  for (const [x, z] of [[-0.072, -0.072], [0.072, -0.072], [-0.072, 0.072], [0.072, 0.072]]) {
    parts.push(p(`脚垫${x > 0 ? '右' : '左'}${z > 0 ? '前' : '后'}`, place(cylinder(0.010, 0.011, 0.005, 12), [x, 0.0025, z]), 'shell-deep'));
  }
  for (let i = 0; i < 6; i++) {
    parts.push(
      p(`后部散热槽${i + 1}`, place(box(0.090, 0.004, 0.005), [0, 0.075 + i * 0.028, -W / 2 - 0.001]), 'shell-deep'),
    );
  }
  parts.push(p('接口面板', place(box(0.100, 0.050, 0.005), [0, 0.060, -W / 2 - 0.002]), 'shell-deep'));

  return { id: 'modern-06', parts };
}

export const BUILDERS = { 'cabinet-01': cabinet01, 'console-02': console02, 'console-03': console03, 'handheld-04': handheld04, 'hybrid-05': hybrid05, 'modern-06': modern06 };

export function buildModel(id) {
  const b = BUILDERS[id];
  if (!b) throw new Error(`未知模型: ${id}`);
  return b();
}

export { BUILDERS as builders };
