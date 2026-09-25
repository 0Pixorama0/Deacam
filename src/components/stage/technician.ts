import * as THREE from "three";

/*
  An original DEACAM technician, built from primitives: no licence, tiny download.

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
  const M = {
    hivis: phys("#ff6812", 0.68, 0, { sheen: 0.5, sheenColor: new THREE.Color("#ffb680"), sheenRoughness: 0.6 }),
    hivisDark: phys("#e2560a", 0.72),
    reflect: phys("#dfe4e9", 0.22, 0.75),
    navy: phys("#1e2839", 0.82, 0, { sheen: 0.3, sheenColor: new THREE.Color("#3a4a66") }),
    navyDark: phys("#141b27", 0.85),
    boot: phys("#3a2a1e", 0.5, 0, { clearcoat: 0.3, clearcoatRoughness: 0.5 }),
    sole: phys("#141210", 0.9),
    skin: phys("#d9a07c", 0.55, 0, { sheen: 0.35, sheenColor: new THREE.Color("#f2c3a5") }),
    stubble: phys("#8a6a55", 0.9),
    hat: phys("#f6f7f4", 0.28, 0, { clearcoat: 0.9, clearcoatRoughness: 0.2 }),
    red: phys("#bf1e2e", 0.45),
    glove: phys("#2f3438", 0.75),
    black: phys("#121416", 0.5),
    belt: phys("#1b1c1e", 0.55),
    buckle: phys("#b9bec4", 0.25, 0.9),
    pouch: phys("#5a3d26", 0.7),
    lens: new THREE.MeshPhysicalMaterial({ color: "#1b2530", roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.82, clearcoat: 1 }),
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
  const rbox = (w: number, h: number, d: number) => {
    const g = new THREE.BoxGeometry(w, h, d, 2, 2, 2);
    // soften corners a touch
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const k = 0.92 + 0.08 * (1 - (Math.abs(v.x) / (w / 2)) * (Math.abs(v.y) / (h / 2)) * (Math.abs(v.z) / (d / 2)));
      p.setXYZ(i, v.x * k, v.y * k, v.z * k);
    }
    g.computeVertexNormals();
    return g;
  };

  const root = new THREE.Group();
  const hips = new THREE.Group();
  hips.position.y = HIP_Y;
  root.add(hips);

  // ── Pelvis, belt, pouch ──
  hips.add(mesh(new THREE.SphereGeometry(0.29, 28, 18).scale(1.08, 0.6, 0.78), M.navy, 0, 0.02, 0));
  hips.add(mesh(new THREE.CylinderGeometry(0.315, 0.3, 0.075, 36).scale(1.06, 1, 0.8), M.belt, 0, 0.14, 0));
  hips.add(mesh(rbox(0.1, 0.07, 0.02), M.buckle, 0, 0.14, 0.245));
  const pouch = new THREE.Group();
  pouch.position.set(0.3, 0.02, 0.1);
  pouch.rotation.y = 0.5;
  pouch.add(mesh(rbox(0.16, 0.2, 0.09), M.pouch));
  pouch.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 8), M.red, -0.03, 0.14, 0));
  pouch.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.08, 8), M.yellow, 0.03, 0.13, 0));
  hips.add(pouch);

  // ── Legs ──
  const leg = (side: number) => {
    const thigh = new THREE.Group();
    thigh.position.set(side * 0.155, 0, 0);
    thigh.add(mesh(cap(0.135, 0.36), M.navy, 0, -0.27, 0));
    thigh.add(mesh(rbox(0.07, 0.17, 0.15), M.navyDark, side * 0.13, -0.3, 0.01)); // cargo pocket
    const shin = new THREE.Group();
    shin.position.y = -0.55;
    shin.add(mesh(new THREE.SphereGeometry(0.105, 16, 12).scale(1, 0.9, 0.7), M.navyDark, 0, 0, 0.08)); // knee pad
    shin.add(mesh(cap(0.118, 0.34), M.navy, 0, -0.26, 0));
    shin.add(mesh(new THREE.CylinderGeometry(0.124, 0.124, 0.045, 24), M.reflect, 0, -0.2, 0));
    const b = new THREE.Group();
    b.position.y = -0.55;
    b.add(mesh(cap(0.105, 0.2).rotateX(Math.PI / 2), M.boot, 0, 0.02, 0.07)); // upper + steel toe
    b.add(mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.14, 20), M.boot, 0, 0.07, -0.02)); // ankle
    b.add(mesh(rbox(0.25, 0.05, 0.44), M.sole, 0, -0.085, 0.07));
    shin.add(b);
    thigh.add(shin);
    hips.add(thigh);
    return { thigh, shin };
  };
  const L = leg(-1);
  const R = leg(1);

  // ── Torso (lathe profile: waist → chest → shoulders) ──
  const torso = new THREE.Group();
  torso.position.y = 0.16;
  hips.add(torso);
  const prof = [
    [0.0, 0.0],
    [0.28, 0.0],
    [0.3, 0.12],
    [0.33, 0.34],
    [0.36, 0.56],
    [0.37, 0.7],
    [0.32, 0.8],
    [0.16, 0.86],
    [0.0, 0.87],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const torsoGeo = new THREE.LatheGeometry(prof, 40).scale(1.05, 1, 0.74);
  torso.add(mesh(torsoGeo, M.hivis));
  // hoop bands + shoulder straps (AU day/night pattern)
  torso.add(mesh(new THREE.CylinderGeometry(0.335, 0.33, 0.06, 40).scale(1.06, 1, 0.76), M.reflect, 0, 0.2, 0));
  for (const s of [-1, 1]) {
    const strap = mesh(rbox(0.06, 0.56, 0.02), M.reflect, s * 0.15, 0.53, 0.262);
    strap.rotation.x = -0.12;
    torso.add(strap);
    const back = mesh(rbox(0.06, 0.56, 0.02), M.reflect, s * 0.15, 0.53, -0.262);
    back.rotation.x = 0.12;
    torso.add(back);
    // chest pocket + flap
    torso.add(mesh(rbox(0.13, 0.13, 0.02), M.hivisDark, s * 0.14, 0.47, 0.27));
    torso.add(mesh(rbox(0.14, 0.04, 0.03), M.hivisDark, s * 0.14, 0.55, 0.275));
  }
  torso.add(mesh(rbox(0.025, 0.6, 0.02), M.hivisDark, 0, 0.44, 0.272)); // placket
  torso.add(mesh(rbox(0.11, 0.045, 0.012), M.red, 0.14, 0.64, 0.268)); // DEACAM patch
  // collar
  for (const s of [-1, 1]) {
    const c = mesh(rbox(0.13, 0.05, 0.1), M.hivisDark, s * 0.08, 0.84, 0.1);
    c.rotation.set(0.5, s * 0.5, s * 0.3);
    torso.add(c);
  }

  // ── Arms ──
  const arm = (side: number) => {
    const upper = new THREE.Group();
    upper.position.set(side * 0.43, 0.74, 0);
    upper.add(mesh(new THREE.SphereGeometry(0.135, 20, 14), M.hivis));
    upper.add(mesh(cap(0.105, 0.3), M.hivis, 0, -0.23, 0));
    upper.add(mesh(new THREE.CylinderGeometry(0.111, 0.111, 0.04, 20), M.reflect, 0, -0.2, 0));
    const fore = new THREE.Group();
    fore.position.y = -0.46;
    fore.add(mesh(cap(0.092, 0.26), M.hivis, 0, -0.17, 0));
    fore.add(mesh(new THREE.CylinderGeometry(0.098, 0.098, 0.035, 20), M.reflect, 0, -0.12, 0));
    // glove: palm + thumb
    const hand = new THREE.Group();
    hand.position.y = -0.38;
    hand.add(mesh(rbox(0.13, 0.15, 0.07), M.glove, 0, -0.03, 0));
    const thumb = mesh(cap(0.028, 0.06), M.glove, side * -0.06, 0.0, 0.04);
    thumb.rotation.set(0.6, 0, side * 0.6);
    hand.add(thumb);
    const tip = new THREE.Object3D();
    tip.position.set(0, -0.1, 0.02);
    hand.add(tip);
    fore.add(hand);
    upper.add(fore);
    torso.add(upper);
    return { upper, fore, hand, tip };
  };
  const AL = arm(-1);
  const AR = arm(1);

  // ── Head: neck, face, stubble, glasses, hard hat ──
  const head = new THREE.Group();
  head.position.y = 0.86;
  torso.add(head);
  head.add(mesh(cap(0.085, 0.06), M.skin, 0, 0.02, 0));
  head.add(mesh(new THREE.SphereGeometry(0.21, 32, 24).scale(0.95, 1.12, 1), M.skin, 0, 0.25, 0));
  head.add(mesh(new THREE.SphereGeometry(0.2, 28, 18, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.4).scale(0.97, 1.1, 1.02), M.stubble, 0, 0.245, 0.004));
  head.add(mesh(new THREE.SphereGeometry(0.035, 12, 10).scale(0.9, 1, 1.2), M.skin, 0, 0.23, 0.205)); // nose
  head.add(mesh(rbox(0.07, 0.012, 0.01), M.black, 0, 0.16, 0.19)); // mouth
  for (const s of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(0.045, 12, 10).scale(0.45, 1, 0.75), M.skin, s * 0.2, 0.25, 0)); // ears
  // safety glasses
  const glasses = new THREE.Group();
  glasses.position.set(0, 0.29, 0.17);
  glasses.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 32, 1, true, -0.9, 1.8).rotateY(Math.PI), M.lens, 0, 0, -0.13));
  glasses.add(mesh(rbox(0.36, 0.014, 0.02), M.black, 0, 0.035, 0.05));
  head.add(glasses);
  // hard hat
  const helmet = new THREE.Group();
  helmet.position.y = 0.37;
  helmet.add(mesh(new THREE.SphereGeometry(0.245, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.95, 1.12), M.hat));
  const brim = mesh(new THREE.CylinderGeometry(0.3, 0.31, 0.022, 44).scale(0.92, 1, 1.12), M.hat, 0, 0.005, 0.03);
  helmet.add(brim);
  const peak = mesh(new THREE.SphereGeometry(0.2, 24, 8, 0, Math.PI, 0, Math.PI / 2).scale(0.9, 0.12, 0.55).rotateY(-Math.PI / 2 + Math.PI / 2), M.hat, 0, 0.008, 0.2);
  helmet.add(peak);
  for (const x of [-0.07, 0, 0.07]) {
    const ridge = mesh(new THREE.TorusGeometry(0.235, 0.012, 6, 24, Math.PI), M.hat, x, 0.0, 0);
    ridge.rotation.y = Math.PI / 2;
    ridge.scale.set(1, 0.95, 1.12);
    helmet.add(ridge);
  }
  helmet.add(mesh(new THREE.CylinderGeometry(0.247, 0.247, 0.04, 36, 1, true).scale(1, 1, 1.12), M.red, 0, 0.05, 0));
  head.add(helmet);

  // ── Props ──
  // Tablet (left hand)
  const tablet = new THREE.Group();
  tablet.position.set(0, -0.08, 0.06);
  tablet.rotation.set(-1.15, 0, 0);
  tablet.add(mesh(rbox(0.36, 0.25, 0.025), M.black));
  tablet.add(mesh(new THREE.PlaneGeometry(0.32, 0.21), M.screenBlue, 0, 0, 0.014));
  AL.hand.add(tablet);
  // Multimeter (left hand) + probe (right hand)
  const meter = new THREE.Group();
  meter.position.set(0, -0.09, 0.05);
  meter.rotation.set(-1.0, 0, 0);
  meter.add(mesh(rbox(0.13, 0.22, 0.05), M.yellow));
  meter.add(mesh(new THREE.PlaneGeometry(0.1, 0.06), M.lcd, 0, 0.05, 0.027));
  meter.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16).rotateX(Math.PI / 2), M.black, 0, -0.04, 0.027));
  const meterJack = new THREE.Object3D();
  meterJack.position.set(0, -0.11, 0.02);
  meter.add(meterJack);
  AL.hand.add(meter);
  const probe = new THREE.Group();
  probe.position.set(0, -0.08, 0.04);
  probe.rotation.set(-1.4, 0, 0);
  probe.add(mesh(cap(0.014, 0.14), M.red, 0, 0, 0));
  probe.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 8), M.buckle, 0, -0.12, 0));
  const probeTail = new THREE.Object3D();
  probeTail.position.set(0, 0.09, 0);
  probe.add(probeTail);
  AR.hand.add(probe);
  // Crane pendant (right hand)
  const pendant = new THREE.Group();
  pendant.position.set(0, -0.1, 0.05);
  pendant.rotation.set(-0.4, 0, 0);
  pendant.add(mesh(rbox(0.1, 0.28, 0.08), M.yellow));
  for (let i = 0; i < 3; i++) pendant.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 12).rotateX(Math.PI / 2), i === 0 ? M.red : M.black, 0, 0.07 - i * 0.07, 0.045));
  const pendantTop = new THREE.Object3D();
  pendantTop.position.set(0, 0.15, 0);
  pendant.add(pendantTop);
  AR.hand.add(pendant);
  // Refrigeration gauge manifold (both hands, parented to right)
  const gauge = new THREE.Group();
  gauge.position.set(-0.17, -0.07, 0.1);
  gauge.rotation.set(-0.5, 0, 0);
  gauge.add(mesh(rbox(0.34, 0.07, 0.07), M.buckle));
  for (const [x, m] of [
    [-0.08, M.blue],
    [0.08, M.red],
  ] as const) {
    const g = new THREE.Group();
    g.position.set(x, 0.1, 0);
    g.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 28).rotateX(Math.PI / 2), m));
    g.add(mesh(new THREE.CircleGeometry(0.062, 28), M.gaugeFace, 0, 0, 0.021));
    const needle = mesh(rbox(0.004, 0.05, 0.004), M.black, 0.01, 0.01, 0.024);
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
