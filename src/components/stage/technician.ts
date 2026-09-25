import * as THREE from "three";

/*
  An original DEACAM technician in a friendly animated-film style (big face,
  round glasses, overalls with orange braces), built from primitives: no
  licence, tiny download.

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
    shirt: phys("#86aed3", 0.62, 0, { sheen: 0.5, sheenColor: new THREE.Color("#cfe2f3") }),
    shirtDark: phys("#6f97bd", 0.65),
    denim: phys("#3b4453", 0.7, 0, { sheen: 0.35, sheenColor: new THREE.Color("#6a7688") }),
    denimDark: phys("#2c333f", 0.75),
    strap: phys("#e38a2c", 0.5, 0, { clearcoat: 0.2 }),
    belt: phys("#e07a24", 0.45, 0, { clearcoat: 0.3 }),
    buckle: phys("#e3b341", 0.25, 0.85),
    pouch: phys("#b8621f", 0.55),
    boot: phys("#7a4a2a", 0.45, 0, { clearcoat: 0.4, clearcoatRoughness: 0.35 }),
    soleTrim: phys("#e0a13a", 0.5),
    sole: phys("#23201d", 0.85),
    skin: phys("#f0b58e", 0.5, 0, { sheen: 0.4, sheenColor: new THREE.Color("#ffd3b8"), clearcoat: 0.15 }),
    cheek: phys("#e89a7d", 0.55),
    hair: phys("#3d4350", 0.7),
    brow: phys("#3a3f4b", 0.7),
    white: phys("#ffffff", 0.25, 0, { clearcoat: 0.6 }),
    iris: phys("#8a6a1f", 0.3, 0, { clearcoat: 1 }),
    pupil: phys("#111111", 0.2, 0, { clearcoat: 1 }),
    mouth: phys("#5a2320", 0.6),
    frame: phys("#4a4f57", 0.35, 0.6),
    lens: new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.02, transmission: 0.9, thickness: 0.01, transparent: true, opacity: 0.18 }),
    hat: phys("#f2a531", 0.35, 0, { clearcoat: 0.8, clearcoatRoughness: 0.25 }),
    hatDark: phys("#d98b22", 0.4, 0, { clearcoat: 0.6 }),
    glove: phys("#6b5646", 0.7, 0, { sheen: 0.3 }),
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

  const root = new THREE.Group();
  const hips = new THREE.Group();
  hips.position.y = HIP_Y;
  root.add(hips);

  // ── Pelvis, belt, pouches ──
  hips.add(mesh(new THREE.SphereGeometry(0.3, 28, 18).scale(1.08, 0.62, 0.8), M.denim, 0, 0.02, 0));
  hips.add(mesh(new THREE.CylinderGeometry(0.325, 0.31, 0.09, 36).scale(1.06, 1, 0.8), M.belt, 0, 0.15, 0));
  hips.add(mesh(rbox(0.13, 0.1, 0.03, 0.015), M.buckle, 0, 0.15, 0.255));
  hips.add(mesh(rbox(0.07, 0.045, 0.035, 0.01), M.belt, 0, 0.15, 0.262));
  for (const s of [-1, 1]) {
    const pouch = new THREE.Group();
    pouch.position.set(s * 0.29, 0.05, 0.12);
    pouch.rotation.y = s * 0.55;
    pouch.add(mesh(rbox(0.13, 0.18, 0.08, 0.02), M.pouch));
    pouch.add(mesh(rbox(0.14, 0.05, 0.09, 0.015), M.pouch, 0, 0.08, 0.005));
    hips.add(pouch);
  }

  // ── Legs: straight overall trousers, big cuffs, chunky boots ──
  const leg = (side: number) => {
    const thigh = new THREE.Group();
    thigh.position.set(side * 0.155, 0, 0);
    thigh.add(mesh(cap(0.14, 0.36), M.denim, 0, -0.27, 0));
    const shin = new THREE.Group();
    shin.position.y = -0.55;
    shin.add(mesh(cap(0.13, 0.3), M.denim, 0, -0.22, 0));
    shin.add(mesh(new THREE.CylinderGeometry(0.155, 0.15, 0.12, 28), M.denimDark, 0, -0.43, 0)); // cuff
    const b = new THREE.Group();
    b.position.y = -0.56;
    b.add(mesh(new THREE.SphereGeometry(0.15, 24, 16).scale(1, 0.72, 1.55), M.boot, 0, 0.02, 0.07));
    b.add(mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.12, 24), M.boot, 0, 0.07, -0.01));
    b.add(mesh(rbox(0.28, 0.035, 0.46, 0.015), M.soleTrim, 0, -0.06, 0.07));
    b.add(mesh(rbox(0.27, 0.05, 0.45, 0.02), M.sole, 0, -0.095, 0.07));
    shin.add(b);
    thigh.add(shin);
    hips.add(thigh);
    return { thigh, shin };
  };
  const L = leg(-1);
  const R = leg(1);

  // ── Torso: blue shirt, overall bib with orange braces ──
  const torso = new THREE.Group();
  torso.position.y = 0.16;
  hips.add(torso);
  const prof = [
    [0.0, 0.0],
    [0.29, 0.0],
    [0.31, 0.12],
    [0.34, 0.34],
    [0.36, 0.56],
    [0.36, 0.7],
    [0.31, 0.8],
    [0.15, 0.86],
    [0.0, 0.87],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  torso.add(mesh(new THREE.LatheGeometry(prof, 40).scale(1.05, 1, 0.74), M.shirt));
  // lower overall wrap
  torso.add(mesh(new THREE.CylinderGeometry(0.335, 0.31, 0.24, 40).scale(1.05, 1, 0.76), M.denim, 0, 0.1, 0));
  // bib
  const bib = mesh(rbox(0.42, 0.34, 0.05, 0.03), M.denim, 0, 0.36, 0.245);
  bib.rotation.x = -0.06;
  torso.add(bib);
  torso.add(mesh(rbox(0.16, 0.1, 0.02, 0.015), M.denimDark, 0, 0.4, 0.278)); // bib pocket
  torso.add(mesh(rbox(0.1, 0.035, 0.012, 0.006), M.red, 0, 0.42, 0.29)); // DEACAM patch
  for (const s of [-1, 1]) {
    // braces run up the chest and over the shoulders
    const strap = mesh(rbox(0.075, 0.42, 0.03, 0.012), M.strap, s * 0.15, 0.66, 0.2);
    strap.rotation.set(-0.45, 0, s * -0.12);
    torso.add(strap);
    const back = mesh(rbox(0.075, 0.5, 0.03, 0.012), M.strap, s * 0.13, 0.55, -0.24);
    back.rotation.set(0.1, 0, s * 0.18);
    torso.add(back);
    torso.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.015, 16).rotateX(Math.PI / 2), M.buckle, s * 0.15, 0.51, 0.28)); // button
    // collar points
    const c = mesh(rbox(0.12, 0.06, 0.02, 0.01), M.shirtDark, s * 0.07, 0.83, 0.12);
    c.rotation.set(0.6, s * 0.4, s * 0.45);
    torso.add(c);
  }

  // ── Arms: rolled sleeves, bare forearms, work gloves ──
  const arm = (side: number) => {
    const upper = new THREE.Group();
    upper.position.set(side * 0.42, 0.74, 0);
    upper.add(mesh(new THREE.SphereGeometry(0.14, 20, 14), M.shirt));
    upper.add(mesh(cap(0.11, 0.28), M.shirt, 0, -0.22, 0));
    upper.add(mesh(new THREE.TorusGeometry(0.105, 0.035, 12, 24).rotateX(Math.PI / 2), M.shirtDark, 0, -0.42, 0)); // rolled cuff
    const fore = new THREE.Group();
    fore.position.y = -0.46;
    fore.add(mesh(cap(0.085, 0.24), M.skin, 0, -0.15, 0));
    const hand = new THREE.Group();
    hand.position.y = -0.36;
    hand.add(mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.07, 20), M.glove, 0, 0.05, 0)); // glove cuff
    hand.add(mesh(new THREE.SphereGeometry(0.1, 20, 14).scale(1, 1.1, 0.75), M.glove, 0, -0.05, 0));
    for (let f = 0; f < 3; f++) hand.add(mesh(cap(0.028, 0.06), M.glove, -0.045 + f * 0.045, -0.15, 0.02));
    const thumb = mesh(cap(0.03, 0.06), M.glove, side * -0.08, -0.03, 0.04);
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

  // ── Head: big friendly face, round glasses, hard hat ──
  const head = new THREE.Group();
  head.position.y = 0.86;
  torso.add(head);
  head.add(mesh(cap(0.1, 0.05), M.skin, 0, 0.03, 0)); // neck
  const HY = 0.34; // head centre
  head.add(mesh(new THREE.SphereGeometry(0.32, 40, 30).scale(0.98, 1.02, 0.94), M.skin, 0, HY, 0));
  head.add(mesh(new THREE.SphereGeometry(0.2, 28, 18).scale(1.2, 0.8, 0.9), M.skin, 0, HY - 0.14, 0.08)); // cheeks/jaw
  // hair at the sides under the hat
  for (const s of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(0.14, 16, 12).scale(0.55, 1, 1), M.hair, s * 0.285, HY + 0.08, -0.04));
  // ears
  for (const s of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(0.07, 16, 12).scale(0.5, 1, 0.8), M.skin, s * 0.315, HY - 0.02, 0));
  // eyes: white, iris, pupil, highlight
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    e.position.set(s * 0.115, HY + 0.05, 0.255);
    e.add(mesh(new THREE.SphereGeometry(0.075, 24, 18).scale(1, 1.1, 0.6), M.white));
    e.add(mesh(new THREE.CircleGeometry(0.045, 24), M.iris, 0, -0.005, 0.047));
    e.add(mesh(new THREE.CircleGeometry(0.024, 20), M.pupil, 0, -0.005, 0.048));
    e.add(mesh(new THREE.CircleGeometry(0.01, 12), M.white, 0.014, 0.01, 0.049));
    e.rotation.y = s * 0.18;
    head.add(e);
    // thick brows
    const b = mesh(cap(0.022, 0.09).rotateZ(Math.PI / 2), M.brow, s * 0.115, HY + 0.155, 0.27);
    b.rotation.z = s * -0.12;
    head.add(b);
    // cheek blush
    head.add(mesh(new THREE.CircleGeometry(0.045, 16), M.cheek, s * 0.18, HY - 0.08, 0.272).rotateY(s * 0.4));
  }
  // nose
  head.add(mesh(new THREE.SphereGeometry(0.06, 20, 16).scale(0.9, 0.85, 1.1), M.skin, 0, HY - 0.03, 0.315));
  // smile: dark mouth with a row of teeth
  const mouth = new THREE.Group();
  mouth.position.set(0, HY - 0.14, 0.285);
  mouth.rotation.x = -0.25;
  mouth.add(mesh(new THREE.CircleGeometry(0.09, 28, Math.PI, Math.PI).scale(1, 0.55, 1), M.mouth));
  mouth.add(mesh(new THREE.PlaneGeometry(0.16, 0.025), M.white, 0, -0.012, 0.002));
  head.add(mouth);
  // round glasses
  for (const s of [-1, 1]) {
    head.add(mesh(new THREE.TorusGeometry(0.085, 0.011, 10, 32), M.frame, s * 0.115, HY + 0.05, 0.31));
    head.add(mesh(new THREE.CircleGeometry(0.083, 28), M.lens, s * 0.115, HY + 0.05, 0.308));
    const arm2 = mesh(cap(0.008, 0.22).rotateX(Math.PI / 2), M.frame, s * 0.2, HY + 0.06, 0.2);
    arm2.rotation.y = s * 0.15;
    head.add(arm2);
  }
  head.add(mesh(new THREE.TorusGeometry(0.03, 0.009, 8, 16, Math.PI), M.frame, 0, HY + 0.06, 0.315));
  // hard hat
  const helmet = new THREE.Group();
  helmet.position.y = HY + 0.17;
  helmet.add(mesh(new THREE.SphereGeometry(0.34, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.9, 1.08), M.hat));
  helmet.add(mesh(new THREE.CylinderGeometry(0.37, 0.38, 0.035, 48).scale(1, 1, 1.12), M.hatDark, 0, 0.0, 0.02));
  const peak = mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.03, 32, 1, false, -Math.PI / 2, Math.PI).scale(1, 1, 0.7), M.hat, 0, 0.005, 0.26);
  helmet.add(peak);
  const ridge = mesh( // centre ridge
    new THREE.TorusGeometry(0.33, 0.028, 10, 32, Math.PI), M.hatDark, 0, 0, 0);
  ridge.rotation.y = Math.PI / 2;
  ridge.scale.set(1, 0.9, 1.08);
  helmet.add(ridge);
  helmet.add(mesh(rbox(0.1, 0.03, 0.005, 0.008), M.red, 0, 0.2, 0.33)); // DEACAM mark on the front
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
