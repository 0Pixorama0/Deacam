import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

/*
  An original DEACAM technician in a friendly animated-film style (yellow hard
  hat, blue polo, orange hi-vis vest, jeans and tool pouches), built from
  primitives: no licence, tiny download.

  Rig (all joints are groups):
    root → hips → thighL/R → shinL/R → boot
             └→ torso → upperArmL/R → foreL/R → hand (tip anchor + props)
                     └→ head
  Height ≈ 2.9 units, feet at y = 0, facing +z.

  Props live on the hands (tablet, multimeter, pendant, gauge set) and are shown
  by the scene per task. Cables are drawn in world space by the scene, using
  the tip anchors exposed here.
*/

export type Technician = {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  thighL: THREE.Group;
  thighR: THREE.Group;
  shinL: THREE.Group;
  shinR: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  foreL: THREE.Group;
  foreR: THREE.Group;
  tipL: THREE.Object3D;
  tipR: THREE.Object3D;
  props: { tablet: THREE.Group; meter: THREE.Group; probe: THREE.Group; pendant: THREE.Group; gauge: THREE.Group };
  anchors: { meter: THREE.Object3D; probe: THREE.Object3D; pendant: THREE.Object3D; gauge: THREE.Object3D };
};

const HIP_Y = 1.24;

export function buildTechnician(): Technician {
  const phys = (color: string, rough = 0.6, metal = 0, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: metal, ...extra });
  // Friendly animated-film palette: soft, slightly glossy "clay" surfaces.
  const M = {
    polo: phys("#3f6ea6", 0.62, 0, { sheen: 0.5, sheenColor: new THREE.Color("#8fb3de") }),
    poloDark: phys("#335d8f", 0.65),
    vest: phys("#f26a1b", 0.55, 0, { sheen: 0.4, sheenColor: new THREE.Color("#ffb27a") }),
    band: phys("#e6f02a", 0.35, 0, { clearcoat: 0.4, emissive: new THREE.Color("#3a3c00") }),
    trim: phys("#8a4a1c", 0.6),
    jeans: phys("#4b77ad", 0.72, 0, { sheen: 0.35, sheenColor: new THREE.Color("#9cbde6") }),
    jeansLight: phys("#5f8bc0", 0.7),
    belt: phys("#5a3219", 0.5, 0, { clearcoat: 0.3 }),
    buckle: phys("#c9a24a", 0.3, 0.8),
    pouch: phys("#ef6e1c", 0.55),
    toolY: phys("#e8b21e", 0.45),
    toolG: phys("#8e959d", 0.3, 0.8),
    boot: phys("#8a4b26", 0.42, 0, { clearcoat: 0.45, clearcoatRoughness: 0.35 }),
    sole: phys("#4a2a16", 0.8),
    skin: phys("#eeb08a", 0.5, 0, { sheen: 0.4, sheenColor: new THREE.Color("#ffd0b0"), clearcoat: 0.12 }),
    cheek: phys("#e8977a", 0.55),
    hair: phys("#1d1f24", 0.55, 0, { sheen: 0.4, sheenColor: new THREE.Color("#4a5060") }),
    brow: phys("#1d1f24", 0.6),
    white: phys("#ffffff", 0.25, 0, { clearcoat: 0.6 }),
    iris: phys("#6b3a1c", 0.3, 0, { clearcoat: 1 }),
    pupil: phys("#111111", 0.2, 0, { clearcoat: 1 }),
    lip: phys("#b8614f", 0.55),
    hat: phys("#f7b516", 0.32, 0, { clearcoat: 0.9, clearcoatRoughness: 0.2 }),
    hatDark: phys("#e39c0c", 0.38, 0, { clearcoat: 0.6 }),
    red: phys("#bf1e2e", 0.45),
    black: phys("#121416", 0.5),
    metal: phys("#b9bec4", 0.25, 0.9),
    yellow: phys("#f2b300", 0.45),
    screenBlue: new THREE.MeshStandardMaterial({ color: "#1c2c3d", emissive: "#3f80d4", emissiveIntensity: 0.6, roughness: 0.2 }),
    lcd: new THREE.MeshStandardMaterial({ color: "#b8c9a4", emissive: "#8fae6d", emissiveIntensity: 0.35, roughness: 0.3 }),
    gaugeFace: phys("#f5f5f2", 0.4),
    blue: phys("#2f63b5", 0.5),
  };

  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    return o;
  };
  const cap = (r: number, len: number) => new THREE.CapsuleGeometry(r, len, 8, 24);
  const rbox = (w: number, h: number, d: number, r = 0.02) => {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: Math.min(r, d / 3), bevelSize: Math.min(r, d / 3) * 0.8, bevelSegments: 3 });
    g.translate(0, 0, -d / 2);
    return g;
  };
  // Lathe shell open at the front (phi 0 = +z), used for the vest and its bands.
  const GAP = 0.34;
  const shell = (pts: [number, number][], m: THREE.Material, zs = 0.76) =>
    mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 40, GAP, Math.PI * 2 - GAP * 2).scale(1.05, 1, zs), m);

  const root = new THREE.Group();
  const hips = new THREE.Group();
  hips.position.y = HIP_Y;
  root.add(hips);

  // ── Jeans seat, brown belt, orange tool pouches ──
  hips.add(mesh(new THREE.SphereGeometry(0.3, 28, 18).scale(1.08, 0.62, 0.8), M.jeans, 0, 0.02, 0));
  hips.add(mesh(new THREE.CylinderGeometry(0.318, 0.31, 0.065, 36).scale(1.06, 1, 0.8), M.belt, 0, 0.15, 0));
  hips.add(mesh(rbox(0.09, 0.07, 0.025, 0.012), M.buckle, 0, 0.15, 0.25));
  for (const s of [-1, 1]) {
    const pouch = new THREE.Group();
    pouch.position.set(s * 0.33, -0.06, 0.06);
    pouch.rotation.y = s * 0.7;
    pouch.add(mesh(rbox(0.16, 0.28, 0.1, 0.025), M.pouch));
    pouch.add(mesh(rbox(0.17, 0.05, 0.11, 0.015), M.pouch, 0, 0.13, 0));
    // tools poking out
    pouch.add(mesh(rbox(0.035, 0.16, 0.025, 0.01), M.toolY, -0.04, 0.2, 0));
    pouch.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.18, 10), M.toolG, 0.02, 0.21, 0.01));
    pouch.add(mesh(rbox(0.03, 0.12, 0.02, 0.008), M.toolG, 0.05, 0.18, -0.02));
    hips.add(pouch);
  }

  // ── Legs: blue jeans with rolled cuffs, brown work boots ──
  const leg = (side: number) => {
    const thigh = new THREE.Group();
    thigh.position.set(side * 0.155, 0, 0);
    thigh.add(mesh(cap(0.145, 0.36), M.jeans, 0, -0.27, 0));
    const shin = new THREE.Group();
    shin.position.y = -0.55;
    shin.add(mesh(cap(0.138, 0.3), M.jeans, 0, -0.22, 0));
    shin.add(mesh(new THREE.TorusGeometry(0.14, 0.035, 12, 28).rotateX(Math.PI / 2), M.jeansLight, 0, -0.43, 0)); // rolled cuff
    const b = new THREE.Group();
    b.position.y = -0.56;
    b.add(mesh(new THREE.SphereGeometry(0.155, 24, 16).scale(1, 0.72, 1.55), M.boot, 0, 0.02, 0.07));
    b.add(mesh(new THREE.CylinderGeometry(0.135, 0.145, 0.13, 24), M.boot, 0, 0.07, -0.01));
    b.add(mesh(rbox(0.29, 0.06, 0.47, 0.02), M.sole, 0, -0.09, 0.07));
    shin.add(b);
    thigh.add(shin);
    hips.add(thigh);
    return { thigh, shin };
  };
  const L = leg(-1);
  const R = leg(1);

  // ── Torso: blue polo, open hi-vis vest ──
  const torso = new THREE.Group();
  torso.position.y = 0.16;
  hips.add(torso);
  const prof: [number, number][] = [
    [0.0, 0.0],
    [0.29, 0.0],
    [0.31, 0.12],
    [0.34, 0.34],
    [0.36, 0.56],
    [0.36, 0.7],
    [0.31, 0.8],
    [0.15, 0.86],
    [0.0, 0.87],
  ];
  torso.add(mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 40).scale(1.05, 1, 0.74), M.polo));
  // polo placket, buttons, collar
  torso.add(mesh(rbox(0.06, 0.26, 0.015, 0.01), M.poloDark, 0, 0.66, 0.262));
  for (const y of [0.72, 0.62]) torso.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12).rotateX(Math.PI / 2), M.white, 0, y, 0.272));
  for (const s of [-1, 1]) {
    const c = mesh(rbox(0.15, 0.07, 0.02, 0.012), M.polo, s * 0.08, 0.83, 0.12);
    c.rotation.set(0.7, s * 0.45, s * 0.5);
    torso.add(c);
  }
  // vest body (orange), yellow bands, brown piping at the opening
  const vp: [number, number][] = [
    [0.305, 0.05],
    [0.325, 0.14],
    [0.355, 0.34],
    [0.375, 0.56],
    [0.37, 0.7],
    [0.32, 0.78],
  ];
  torso.add(shell(vp, M.vest));
  torso.add(shell([[0.332, 0.14], [0.345, 0.25]], M.band, 0.78));
  torso.add(shell([[0.36, 0.34], [0.37, 0.45]], M.band, 0.78));
  for (const s of [-1, 1]) {
    const ang = s * (GAP + 0.08);
    // vertical yellow stripe up the front beside the opening
    const st = mesh(rbox(0.06, 0.42, 0.012, 0.008), M.band, Math.sin(ang) * 0.385, 0.6, Math.cos(ang) * 0.29);
    st.rotation.set(-0.08, ang, 0);
    torso.add(st);
    // brown piping along the opening
    const pp = mesh(cap(0.008, 0.66), M.trim, Math.sin(s * GAP) * 0.36 * 1.05, 0.42, Math.cos(s * GAP) * 0.36 * 0.76);
    torso.add(pp);
    // vest shoulder straps
    const sh = mesh(rbox(0.13, 0.05, 0.3, 0.02), M.vest, s * 0.27, 0.79, 0);
    sh.rotation.z = s * -0.35;
    torso.add(sh);
  }
  torso.add(mesh(rbox(0.1, 0.035, 0.012, 0.006), M.red, -0.2, 0.58, 0.26)); // DEACAM patch

  // ── Arms: short polo sleeves, bare arms and hands ──
  const arm = (side: number) => {
    const upper = new THREE.Group();
    upper.position.set(side * 0.42, 0.74, 0);
    upper.add(mesh(new THREE.SphereGeometry(0.145, 20, 14), M.polo));
    upper.add(mesh(new THREE.CylinderGeometry(0.135, 0.125, 0.2, 20), M.polo, 0, -0.1, 0)); // short sleeve
    upper.add(mesh(new THREE.TorusGeometry(0.125, 0.018, 10, 24).rotateX(Math.PI / 2), M.poloDark, 0, -0.2, 0));
    upper.add(mesh(cap(0.105, 0.26), M.skin, 0, -0.26, 0));
    const fore = new THREE.Group();
    fore.position.y = -0.46;
    fore.add(mesh(cap(0.09, 0.24), M.skin, 0, -0.15, 0));
    const hand = new THREE.Group();
    hand.position.y = -0.36;
    hand.add(mesh(new THREE.SphereGeometry(0.095, 20, 14).scale(1, 1.1, 0.75), M.skin, 0, -0.04, 0));
    for (let f = 0; f < 4; f++) hand.add(mesh(cap(0.022, 0.05), M.skin, -0.05 + f * 0.034, -0.13, 0.02));
    const thumb = mesh(cap(0.026, 0.05), M.skin, side * -0.075, -0.03, 0.04);
    thumb.rotation.set(0.5, 0, side * 0.7);
    hand.add(thumb);
    const tip = new THREE.Object3D();
    tip.position.set(0, -0.12, 0.02);
    hand.add(tip);
    fore.add(hand);
    upper.add(fore);
    torso.add(upper);
    return { upper, fore, hand, tip };
  };
  const AL = arm(-1);
  const AR = arm(1);

  // ── Head: friendly face, black hair, yellow hard hat ──
  const head = new THREE.Group();
  head.position.y = 0.86;
  torso.add(head);
  head.add(mesh(cap(0.1, 0.05), M.skin, 0, 0.03, 0)); // neck
  const HY = 0.34;
  head.add(mesh(new THREE.SphereGeometry(0.31, 40, 30).scale(0.96, 1.06, 0.94), M.skin, 0, HY, 0));
  head.add(mesh(new THREE.SphereGeometry(0.2, 28, 18).scale(1.15, 0.85, 0.9), M.skin, 0, HY - 0.13, 0.07)); // jaw
  // hair: sides/back and a fringe peeking under the brim
  // hair covers the back and sides only (front of the face stays open)
  head.add(mesh(new THREE.SphereGeometry(0.318, 36, 24, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, Math.PI * 0.56).scale(0.97, 1.02, 0.95), M.hair, 0, HY + 0.01, -0.01));
  for (const s of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(0.1, 14, 10).scale(0.45, 1.1, 0.8), M.hair, s * 0.285, HY + 0.06, -0.02));
  for (let k = -2; k <= 2; k++) {
    const f = mesh(new THREE.ConeGeometry(0.04, 0.08, 8), M.hair, k * 0.06, HY + 0.215, 0.255);
    f.rotation.set(-2.6, 0, k * 0.2);
    head.add(f);
  }
  for (const s of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(0.075, 16, 12).scale(0.5, 1, 0.8), M.skin, s * 0.305, HY - 0.02, 0)); // ears
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    e.position.set(s * 0.11, HY + 0.04, 0.25);
    e.add(mesh(new THREE.SphereGeometry(0.066, 24, 18).scale(1, 1.12, 0.6), M.white));
    e.add(mesh(new THREE.CircleGeometry(0.042, 24), M.iris, 0, -0.004, 0.041));
    e.add(mesh(new THREE.CircleGeometry(0.022, 20), M.pupil, 0, -0.004, 0.042));
    e.add(mesh(new THREE.CircleGeometry(0.009, 12), M.white, 0.013, 0.01, 0.043));
    e.rotation.y = s * 0.18;
    head.add(e);
    const b = mesh(cap(0.026, 0.1).rotateZ(Math.PI / 2), M.brow, s * 0.11, HY + 0.145, 0.27);
    b.rotation.z = s * -0.18;
    head.add(b);
    head.add(mesh(new THREE.CircleGeometry(0.045, 16), M.cheek, s * 0.17, HY - 0.07, 0.265).rotateY(s * 0.4));
  }
  head.add(mesh(new THREE.SphereGeometry(0.052, 20, 16).scale(0.9, 0.85, 1.1), M.skin, 0, HY - 0.03, 0.3)); // nose
  // closed, warm smile
  const smile = mesh(new THREE.TorusGeometry(0.07, 0.011, 8, 24, Math.PI * 0.8), M.lip, 0, HY - 0.09, 0.285);
  smile.rotation.z = Math.PI + Math.PI * 0.1;
  head.add(smile);
  // yellow hard hat with front peak and side slots
  const helmet = new THREE.Group();
  helmet.position.y = HY + 0.15;
  helmet.add(mesh(new THREE.SphereGeometry(0.34, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.95, 1.08), M.hat));
  helmet.add(mesh(new THREE.CylinderGeometry(0.37, 0.385, 0.035, 48).scale(1, 1, 1.12), M.hatDark, 0, 0, 0.02));
  helmet.add(mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.03, 32, 1, false, -Math.PI / 2, Math.PI).scale(1, 1, 0.75), M.hat, 0, 0.005, 0.27));
  const ridge = mesh(new THREE.TorusGeometry(0.33, 0.03, 10, 32, Math.PI), M.hatDark, 0, 0, 0); // centre ridge
  ridge.rotation.y = Math.PI / 2;
  ridge.scale.set(1, 0.95, 1.08);
  helmet.add(ridge);
  for (const s of [-1, 1]) helmet.add(mesh(rbox(0.05, 0.06, 0.1, 0.012), M.hatDark, s * 0.36, 0.03, 0)); // accessory slots
  helmet.add(mesh(rbox(0.1, 0.03, 0.005, 0.008), M.red, 0, 0.19, 0.335)); // DEACAM mark
  head.add(helmet);

  // ── Props (same anchors the scene uses) ──
  const tablet = new THREE.Group();
  tablet.position.set(0, -0.08, 0.06);
  tablet.rotation.set(-1.15, 0, 0);
  tablet.add(mesh(rbox(0.36, 0.25, 0.025, 0.02), M.black));
  tablet.add(mesh(new THREE.PlaneGeometry(0.32, 0.21), M.screenBlue, 0, 0, 0.016));
  AL.hand.add(tablet);
  const meter = new THREE.Group();
  meter.position.set(0, -0.1, 0.05);
  meter.rotation.set(-1.0, 0, 0);
  meter.add(mesh(rbox(0.13, 0.22, 0.05, 0.02), M.yellow));
  meter.add(mesh(new THREE.PlaneGeometry(0.1, 0.06), M.lcd, 0, 0.05, 0.03));
  meter.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16).rotateX(Math.PI / 2), M.black, 0, -0.04, 0.03));
  const meterJack = new THREE.Object3D();
  meterJack.position.set(0, -0.11, 0.02);
  meter.add(meterJack);
  AL.hand.add(meter);
  const probe = new THREE.Group();
  probe.position.set(0, -0.1, 0.04);
  probe.rotation.set(-1.4, 0, 0);
  probe.add(mesh(cap(0.014, 0.14), M.red));
  probe.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 8), M.metal, 0, -0.12, 0));
  const probeTail = new THREE.Object3D();
  probeTail.position.set(0, 0.09, 0);
  probe.add(probeTail);
  AR.hand.add(probe);
  const pendant = new THREE.Group();
  pendant.position.set(0, -0.12, 0.05);
  pendant.rotation.set(-0.4, 0, 0);
  pendant.add(mesh(rbox(0.1, 0.28, 0.08, 0.02), M.yellow));
  for (let i = 0; i < 3; i++) pendant.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 12).rotateX(Math.PI / 2), i === 0 ? M.red : M.black, 0, 0.07 - i * 0.07, 0.05));
  const pendantTop = new THREE.Object3D();
  pendantTop.position.set(0, 0.15, 0);
  pendant.add(pendantTop);
  AR.hand.add(pendant);
  const gauge = new THREE.Group();
  gauge.position.set(-0.17, -0.09, 0.1);
  gauge.rotation.set(-0.5, 0, 0);
  gauge.add(mesh(rbox(0.34, 0.07, 0.07, 0.02), M.metal));
  for (const [x, m] of [
    [-0.08, M.blue],
    [0.08, M.red],
  ] as const) {
    const g = new THREE.Group();
    g.position.set(x, 0.1, 0);
    g.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 28).rotateX(Math.PI / 2), m));
    g.add(mesh(new THREE.CircleGeometry(0.062, 28), M.gaugeFace, 0, 0, 0.021));
    const needle = mesh(new THREE.BoxGeometry(0.004, 0.05, 0.004), M.black, 0.01, 0.01, 0.024);
    needle.rotation.z = -0.6;
    g.add(needle);
    gauge.add(g);
  }
  const gaugePort = new THREE.Object3D();
  gaugePort.position.set(0, -0.05, 0);
  gauge.add(gaugePort);
  AR.hand.add(gauge);

  for (const p of [meter, probe, pendant, gauge]) p.visible = false;

  return {
    root,
    hips,
    torso,
    head,
    thighL: L.thigh,
    thighR: R.thigh,
    shinL: L.shin,
    shinR: R.shin,
    armL: AL.upper,
    armR: AR.upper,
    foreL: AL.fore,
    foreR: AR.fore,
    tipL: AL.tip,
    tipR: AR.tip,
    props: { tablet, meter, probe, pendant, gauge },
    anchors: { meter: meterJack, probe: probeTail, pendant: pendantTop, gauge: gaugePort },
  };
}

// ── Posing ──────────────────────────────────────────────────

type J = {
  hipY: number;
  tX: number;
  tY: number;
  tZ: number;
  hX: number;
  hY: number;
  aLx: number;
  aLy: number;
  aLz: number;
  fL: number;
  aRx: number;
  aRy: number;
  aRz: number;
  fR: number;
  lL: number;
  lR: number;
  sL: number;
  sR: number;
};

const REST: J = { hipY: 0, tX: 0, tY: 0, tZ: 0, hX: 0, hY: 0, aLx: 0, aLy: 0, aLz: 0.1, fL: -0.15, aRx: 0, aRy: 0, aRz: -0.1, fR: -0.15, lL: 0, lR: 0, sL: 0.04, sR: 0.04 };

export type Task = "tablet" | "pull" | "reach" | "probe" | "signal" | "gauge";

/** Joint targets for each task at time t. Missing keys fall back to REST. */
function taskPose(task: Task, t: number): Partial<J> {
  const breathe = Math.sin(t * 1.6) * 0.012;
  switch (task) {
    case "tablet": {
      const tap = Math.max(0, Math.sin(t * 5)) * (Math.sin(t * 0.7) > 0.3 ? 0.08 : 0);
      return { aLx: -0.4, aLz: 0.18, fL: -1.35, aRx: -0.5, aRz: -0.32, aRy: -0.35, fR: -1.35 - tap, hX: 0.42 + Math.sin(t * 0.5) * 0.04, hY: Math.sin(t * 0.3) * 0.1, tX: 0.06 + breathe };
    }
    case "pull": {
      // hand-over-hand haul: arms alternate, body rocks back
      const w = t * 3.6;
      const a = Math.sin(w);
      return {
        aRx: -1.0 + a * 0.45,
        fR: -0.55 - Math.max(0, a) * 0.5,
        aRz: -0.12,
        aLx: -1.0 - a * 0.45,
        fL: -0.55 - Math.max(0, -a) * 0.5,
        aLz: 0.12,
        tX: -0.12 + a * 0.06,
        tY: a * 0.08,
        hX: 0.25,
        hipY: -0.06,
        lL: 0.35,
        lR: -0.15,
        sL: 0.35,
        sR: 0.2,
      };
    }
    case "reach":
      return { aRx: -1.35, aRz: -0.28, fR: -0.12, aLx: -0.2, fL: -0.3, hX: 0.1, tX: 0.08, tY: 0.12 };
    case "probe": {
      const row = Math.round(((Math.sin(t * 0.55) + 1) / 2) * 2) / 2; // steps between rows
      return {
        aRx: -1.25 + row * 0.35,
        aRz: -0.22,
        aRy: Math.sin(t * 1.3) * 0.12,
        fR: -0.25,
        aLx: -0.55,
        aLz: 0.2,
        fL: -1.25,
        hX: 0.05 + row * 0.2,
        hY: 0.1,
        tX: 0.06 + breathe,
      };
    }
    case "signal": {
      // left arm raised, index circling = "hoist up"; right hand on the pendant
      return {
        aLx: -2.85,
        aLz: 0.18 + Math.sin(t * 5) * 0.08,
        aLy: Math.cos(t * 5) * 0.12,
        fL: -0.35,
        aRx: -0.55,
        fR: -1.15,
        hX: -0.55 + Math.sin(t * 0.6) * 0.04,
        tX: -0.05 + breathe,
      };
    }
    case "gauge": {
      const tap = Math.max(0, Math.sin(t * 4)) * (Math.sin(t * 0.5) > 0.5 ? 0.12 : 0);
      return { aRx: -0.95, aRz: -0.28, fR: -0.95, aLx: -0.95 - tap, aLz: 0.3, fL: -0.95, hX: 0.38, hY: Math.sin(t * 0.4) * 0.12, tX: 0.08 + breathe };
    }
  }
}

function walkPose(phase: number): Partial<J> {
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  return {
    lL: s * 0.6,
    lR: -s * 0.6,
    sL: Math.max(0, -c) * 0.9 + 0.05,
    sR: Math.max(0, c) * 0.9 + 0.05,
    hipY: Math.abs(c) * 0.05 - 0.02,
    tY: s * 0.12,
    tX: 0.06,
    aRx: s * 0.5,
    fR: -0.25 - Math.max(0, s) * 0.35,
    aLx: -s * 0.5,
    fL: -0.25 - Math.max(0, -s) * 0.35,
  };
}

export type PoseInput = {
  phase: number;
  stride: number; // 0 idle … 1 full walk
  tasks: Partial<Record<Task, number>>; // weights, applied over the idle base
  time: number;
};

/** Blend walk + task poses and write joint rotations. */
export function pose(t: Technician, p: PoseInput) {
  const j: J = { ...REST };
  const add = (src: Partial<J>, w: number) => {
    if (w <= 0) return;
    for (const k in src) {
      const key = k as keyof J;
      j[key] += (src[key]! - REST[key]) * w;
    }
  };
  const still = 1 - p.stride;
  for (const [task, w] of Object.entries(p.tasks) as [Task, number][]) add(taskPose(task, p.time), (w ?? 0) * still);
  add(walkPose(p.phase), p.stride);
  // idle glance when nothing else is happening
  j.hY += Math.sin(p.time * 0.45) * 0.08 * still * (1 - Math.min(1, Object.values(p.tasks).reduce((a, b) => a + (b ?? 0), 0)));

  t.hips.position.y = HIP_Y + j.hipY;
  t.torso.rotation.set(j.tX, j.tY, j.tZ);
  t.head.rotation.set(j.hX, j.hY, 0);
  t.armL.rotation.set(j.aLx, j.aLy, j.aLz);
  t.armR.rotation.set(j.aRx, j.aRy, j.aRz);
  t.foreL.rotation.x = j.fL;
  t.foreR.rotation.x = j.fR;
  t.thighL.rotation.x = -j.lL;
  t.thighR.rotation.x = -j.lR;
  t.shinL.rotation.x = j.sL;
  t.shinR.rotation.x = j.sR;
}


// ── Blender body driven by the procedural rig ──────────────────
/*
  The Blender GLB (public/models/technician.glb) is one continuous skinned
  body with bones named like the rig above. We keep the procedural rig as an
  invisible driver: its joints are posed by pose(), and every frame each bone
  is set to follow its driver joint. Props stay on the driver's hands.
*/
export type Rigged = { tech: Technician; update: () => void };

const JOINT_NAMES = ["hips", "torso", "head", "thighL", "thighR", "shinL", "shinR", "armL", "armR", "foreL", "foreR", "handL", "handR"] as const;

export function buildRiggedTechnician(source: THREE.Object3D): Rigged {
  const tech = buildTechnician();
  // Own copy (with its own skeleton): the loaded scene is shared and may be built twice in dev.
  const body = cloneSkinned(source);
  // Drop the procedural body meshes; keep only the props.
  const propRoots = new Set<THREE.Object3D>(Object.values(tech.props));
  const doomed: THREE.Mesh[] = [];
  tech.root.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return;
    let p: THREE.Object3D | null = o;
    while (p && !propRoots.has(p)) p = p.parent;
    if (!p) doomed.push(o as THREE.Mesh);
  });
  doomed.forEach((m) => m.parent?.remove(m));

  body.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.frustumCulled = false;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.envMapIntensity = 1.1;
    }
  });
  tech.root.add(body);

  const driver: Record<(typeof JOINT_NAMES)[number], THREE.Object3D> = {
    hips: tech.hips,
    torso: tech.torso,
    head: tech.head,
    thighL: tech.thighL,
    thighR: tech.thighR,
    shinL: tech.shinL,
    shinR: tech.shinR,
    armL: tech.armL,
    armR: tech.armR,
    foreL: tech.foreL,
    foreR: tech.foreR,
    handL: tech.tipL.parent!,
    handR: tech.tipR.parent!,
  };
  const bones = JOINT_NAMES.map((n) => ({ n, bone: body.getObjectByName(n)!, drv: driver[n] })).filter((b) => b.bone);

  // Rest offsets: bone world relative to its driver joint world, at rest.
  tech.root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4();
  const offsets = bones.map(({ bone, drv }) => inv.copy(drv.matrixWorld).invert().multiply(bone.matrixWorld).clone());

  const want = new THREE.Matrix4();
  const local = new THREE.Matrix4();
  const update = () => {
    tech.root.updateMatrixWorld(true);
    bones.forEach(({ bone, drv }, i) => {
      want.multiplyMatrices(drv.matrixWorld, offsets[i]);
      local.copy(bone.parent!.matrixWorld).invert().multiply(want);
      local.decompose(bone.position, bone.quaternion, bone.scale);
      bone.updateMatrixWorld(true);
    });
  };
  return { tech, update };
}
