import * as THREE from "three";

/*
  An original DEACAM technician, built from primitives so it carries no
  licence and weighs almost nothing. Stylised "vinyl toy" proportions:
  orange hi-vis shirt with reflective bands, navy work pants, safety boots,
  white hard hat with a DEACAM red stripe, and a tablet.

  Rig: joints are groups so rotations read naturally.
    root → hips → (legL, legR → shin → boot), torso → (armL, armR → fore), neck → head
  Height ≈ 2.9 units with the feet at y = 0.
*/

export type Technician = {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  shinL: THREE.Group;
  shinR: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  foreL: THREE.Group;
  foreR: THREE.Group;
};

export function buildTechnician(): Technician {
  const std = (color: string, rough = 0.6, metal = 0, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: metal, ...extra });
  const hivis = std("#ff6a13", 0.62, 0, { sheen: 0.4, sheenColor: new THREE.Color("#ffb07a") });
  const reflect = std("#e4e8ec", 0.25, 0.6);
  const navy = std("#1f2a3d", 0.75);
  const boot = std("#2a2521", 0.55);
  const sole = std("#141210", 0.8);
  const skin = std("#e2ae88", 0.55, 0, { sheen: 0.3 });
  const hat = std("#f4f5f2", 0.3, 0, { clearcoat: 0.7, clearcoatRoughness: 0.25 });
  const red = std("#bf1e2e", 0.45);
  const dark = std("#15171a", 0.4);
  const screen = new THREE.MeshStandardMaterial({ color: "#1d2b3a", emissive: "#3f7fd0", emissiveIntensity: 0.55, roughness: 0.2 });
  const glove = std("#3a3f45", 0.7);

  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    return o;
  };
  const cap = (r: number, len: number) => new THREE.CapsuleGeometry(r, len, 8, 20);

  const root = new THREE.Group();
  const hips = new THREE.Group();
  hips.position.y = 1.18;
  root.add(hips);

  // Pelvis
  hips.add(mesh(new THREE.SphereGeometry(0.3, 24, 16).scale(1.05, 0.62, 0.8), navy, 0, 0.02, 0));

  // Legs (hip → knee → ankle)
  const leg = (side: number) => {
    const thigh = new THREE.Group();
    thigh.position.set(side * 0.16, 0, 0);
    thigh.add(mesh(cap(0.125, 0.36), navy, 0, -0.28, 0));
    const shin = new THREE.Group();
    shin.position.y = -0.56;
    shin.add(mesh(cap(0.115, 0.34), navy, 0, -0.26, 0));
    // reflective band on the shin
    shin.add(mesh(new THREE.CylinderGeometry(0.122, 0.122, 0.05, 20), reflect, 0, -0.3, 0));
    const b = new THREE.Group();
    b.position.y = -0.56;
    b.add(mesh(new THREE.BoxGeometry(0.24, 0.16, 0.38).translate(0, 0, 0.06), boot, 0, -0.02, 0));
    b.add(mesh(new THREE.BoxGeometry(0.26, 0.05, 0.42).translate(0, 0, 0.06), sole, 0, -0.1, 0));
    shin.add(b);
    thigh.add(shin);
    hips.add(thigh);
    return { thigh, shin };
  };
  const L = leg(-1);
  const R = leg(1);

  // Torso
  const torso = new THREE.Group();
  torso.position.y = 0.12;
  hips.add(torso);
  torso.add(mesh(cap(0.33, 0.42).scale(1.08, 1, 0.78), hivis, 0, 0.46, 0));
  for (const y of [0.3, 0.56]) {
    torso.add(mesh(new THREE.CylinderGeometry(0.357, 0.357, 0.06, 32).scale(1.08, 1, 0.78), reflect, 0, y, 0));
  }
  // belt
  torso.add(mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 32).scale(1.08, 1, 0.78), dark, 0, 0.05, 0));
  // small DEACAM chest patch
  const patch = mesh(new THREE.BoxGeometry(0.12, 0.06, 0.01), red, 0.13, 0.72, 0.265);
  torso.add(patch);

  // Arms (shoulder → elbow)
  const arm = (side: number) => {
    const upper = new THREE.Group();
    upper.position.set(side * 0.42, 0.78, 0);
    upper.add(mesh(new THREE.SphereGeometry(0.13, 16, 12), hivis, 0, 0, 0));
    upper.add(mesh(cap(0.1, 0.3), hivis, 0, -0.24, 0));
    upper.add(mesh(new THREE.CylinderGeometry(0.106, 0.106, 0.04, 16), reflect, 0, -0.34, 0));
    const fore = new THREE.Group();
    fore.position.y = -0.46;
    fore.add(mesh(cap(0.085, 0.28), skin, 0, -0.2, 0));
    fore.add(mesh(new THREE.SphereGeometry(0.085, 16, 12).scale(1, 1.15, 0.8), glove, 0, -0.41, 0));
    upper.add(fore);
    torso.add(upper);
    return { upper, fore };
  };
  const AL = arm(-1);
  const AR = arm(1);

  // Tablet in the left hand
  const tablet = new THREE.Group();
  tablet.position.set(0, -0.46, 0.08);
  tablet.rotation.x = -1.1;
  tablet.add(mesh(new THREE.BoxGeometry(0.34, 0.24, 0.025), dark));
  tablet.add(mesh(new THREE.PlaneGeometry(0.3, 0.2), screen, 0, 0, 0.014));
  AL.fore.add(tablet);

  // Head
  const head = new THREE.Group();
  head.position.y = 1.02;
  torso.add(head);
  head.add(mesh(cap(0.09, 0.08), skin, 0, -0.06, 0)); // neck
  head.add(mesh(new THREE.SphereGeometry(0.29, 32, 24).scale(1, 1.08, 1), skin, 0, 0.22, 0));
  for (const s of [-1, 1]) {
    head.add(mesh(new THREE.SphereGeometry(0.035, 12, 10), dark, s * 0.1, 0.25, 0.265)); // eyes
    head.add(mesh(new THREE.BoxGeometry(0.09, 0.018, 0.02), dark, s * 0.1, 0.33, 0.262)); // brows
    head.add(mesh(new THREE.SphereGeometry(0.06, 12, 10).scale(0.5, 1, 0.8), skin, s * 0.29, 0.2, 0)); // ears
  }
  head.add(mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 20, Math.PI), dark, 0, 0.13, 0.262).rotateZ(Math.PI)); // smile
  head.add(mesh(new THREE.SphereGeometry(0.045, 12, 10), skin, 0, 0.19, 0.29)); // nose
  // Hard hat
  const helmet = new THREE.Group();
  helmet.position.y = 0.3;
  helmet.add(mesh(new THREE.SphereGeometry(0.33, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.9, 1.05), hat));
  helmet.add(mesh(new THREE.CylinderGeometry(0.4, 0.41, 0.03, 40).scale(1, 1, 1.12).translate(0, 0, 0.03), hat, 0, 0.01, 0));
  helmet.add(mesh(new THREE.CapsuleGeometry(0.03, 0.34, 4, 10).rotateX(Math.PI / 2), hat, 0, 0.27, 0.02)); // ridge
  helmet.add(mesh(new THREE.CylinderGeometry(0.335, 0.335, 0.05, 32, 1, true).scale(1, 1, 1.05), red, 0, 0.06, 0)); // red band
  head.add(helmet);

  return {
    root,
    hips,
    torso,
    head,
    legL: L.thigh,
    legR: R.thigh,
    shinL: L.shin,
    shinR: R.shin,
    armL: AL.upper,
    armR: AR.upper,
    foreL: AL.fore,
    foreR: AR.fore,
  };
}

export type Pose = {
  phase: number; // walk cycle phase (radians)
  stride: number; // 0 idle … 1 full walk
  reach: number; // 0 … 1 right arm reaching forward to a handle
  look: number; // head pitch, positive = look up
  tablet: number; // 0 … 1 left arm raised holding the tablet
  breathe: number; // time, for idle motion
};

/** Apply a pose to the rig. Pure function of the inputs, cheap every frame. */
export function pose(t: Technician, p: Pose) {
  const s = Math.sin(p.phase);
  const c = Math.cos(p.phase);
  const a = p.stride;
  t.legL.rotation.x = s * 0.6 * a;
  t.legR.rotation.x = -s * 0.6 * a;
  t.shinL.rotation.x = Math.max(0, -c) * 0.9 * a + 0.04;
  t.shinR.rotation.x = Math.max(0, c) * 0.9 * a + 0.04;
  t.hips.position.y = 1.18 + Math.abs(Math.cos(p.phase)) * 0.05 * a - 0.02 * a;
  t.torso.rotation.y = s * 0.12 * a;
  t.torso.rotation.x = 0.05 * a + Math.sin(p.breathe * 1.6) * 0.01;

  // Right arm: swing when walking, reach forward for the handle.
  const swingR = s * 0.55 * a;
  t.armR.rotation.x = THREE.MathUtils.lerp(swingR, -1.35, p.reach);
  t.armR.rotation.z = THREE.MathUtils.lerp(0.08, -0.25, p.reach);
  t.foreR.rotation.x = THREE.MathUtils.lerp(-0.25 - Math.max(0, s) * 0.3 * a, -0.15, p.reach);

  // Left arm: tablet held at chest, otherwise swinging.
  t.armL.rotation.x = THREE.MathUtils.lerp(-s * 0.55 * a, -0.35, p.tablet);
  t.armL.rotation.z = THREE.MathUtils.lerp(-0.08, 0.1, p.tablet);
  t.foreL.rotation.x = THREE.MathUtils.lerp(-0.25, -1.35, p.tablet);

  t.head.rotation.x = -p.look * 0.55 + Math.sin(p.breathe * 0.7) * 0.02;
  t.head.rotation.y = Math.sin(p.breathe * 0.45) * 0.12 * (1 - a);
}
