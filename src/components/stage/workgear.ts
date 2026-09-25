import * as THREE from "three";
import type { Technician, Task } from "./technician";

/*
  World-space kit for the technician's tasks: a cable drum and the live
  cables that connect his hands to the equipment. Tubes are rebuilt each
  frame from a few control points; at ~24 segments that costs almost nothing.
*/

type Cable = { mesh: THREE.Mesh; radius: number };

export type WorkGear = {
  group: THREE.Group;
  drum: THREE.Group;
  cables: Record<"pull" | "leadRed" | "leadBlack" | "pendant" | "hoseBlue" | "hoseRed", Cable>;
};

export function buildWorkGear(): WorkGear {
  const group = new THREE.Group();
  const mat = (color: string, rough = 0.5) => new THREE.MeshStandardMaterial({ color, roughness: rough });
  const cable = (color: string, radius: number): Cable => {
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat(color, 0.45));
    mesh.castShadow = true;
    mesh.visible = false;
    group.add(mesh);
    return { mesh, radius };
  };

  // Cable drum: two plywood flanges, orange cable wound on the core.
  const drum = new THREE.Group();
  const ply = mat("#b98a55", 0.8);
  for (const x of [-0.22, 0.22]) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 36).rotateZ(Math.PI / 2), ply);
    f.position.x = x;
    f.castShadow = true;
    drum.add(f);
  }
  const wound = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.4, 36).rotateZ(Math.PI / 2), mat("#e0681d", 0.55));
  wound.castShadow = true;
  drum.add(wound);
  drum.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 16).rotateZ(Math.PI / 2), mat("#3a3e44", 0.4)));
  drum.visible = false;
  group.add(drum);

  return {
    group,
    drum,
    cables: {
      pull: cable("#e0681d", 0.03),
      leadRed: cable("#c8202d", 0.012),
      leadBlack: cable("#151719", 0.012),
      pendant: cable("#202326", 0.018),
      hoseBlue: cable("#2f63b5", 0.02),
      hoseRed: cable("#c8202d", 0.02),
    },
  };
}

const tmp = new THREE.Vector3();
const wp = (o: THREE.Object3D) => o.getWorldPosition(tmp).clone();

function setTube(c: Cable, pts: THREE.Vector3[], on: boolean) {
  c.mesh.visible = on;
  if (!on) return;
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4);
  c.mesh.geometry.dispose();
  c.mesh.geometry = new THREE.TubeGeometry(curve, 28, c.radius, 6, false);
}

/** Sagging midpoint between two points. */
const sag = (a: THREE.Vector3, b: THREE.Vector3, drop: number, t = 0.5) =>
  a.clone().lerp(b, t).add(new THREE.Vector3(0, -drop, 0));

export type Targets = {
  kioskEntry: THREE.Vector3;
  hoist: THREE.Vector3;
  coolerPort: THREE.Vector3;
  floorY: number;
  techPos: THREE.Vector3;
  techYaw: number;
};

/** Show props for the active tasks and route cables to the equipment. */
export function updateWorkGear(g: WorkGear, t: Technician, w: Partial<Record<Task, number>>, tg: Targets) {
  const on = (task: Task) => (w[task] ?? 0) > 0.35;
  t.root.updateMatrixWorld(true);

  t.props.tablet.visible = !on("pull") && !on("probe") && !on("signal") && !on("gauge") && !on("reach");
  t.props.meter.visible = on("probe");
  t.props.probe.visible = on("probe");
  t.props.pendant.visible = on("signal");
  t.props.gauge.visible = on("gauge");

  // Cable pull: drum → left hand → right hand → kiosk
  const pulling = on("pull");
  g.drum.visible = pulling;
  if (pulling) {
    const back = new THREE.Vector3(-Math.sin(tg.techYaw), 0, -Math.cos(tg.techYaw));
    const side = new THREE.Vector3(Math.cos(tg.techYaw), 0, -Math.sin(tg.techYaw));
    g.drum.position.copy(tg.techPos).addScaledVector(back, 0.75).addScaledVector(side, -0.35);
    g.drum.position.y = tg.floorY + 0.42;
    g.drum.rotation.y = tg.techYaw;
    const drumTop = g.drum.position.clone().add(new THREE.Vector3(0, 0.3, 0));
    const hl = wp(t.tipL);
    const hr = wp(t.tipR);
    setTube(g.cables.pull, [drumTop, sag(drumTop, hl, 0.25), hl, hr, sag(hr, tg.kioskEntry, 0.35), tg.kioskEntry], true);
  } else setTube(g.cables.pull, [], false);

  // Multimeter leads: meter jack → probe tail
  const probing = on("probe");
  if (probing) {
    const a = wp(t.anchors.meter);
    const b = wp(t.anchors.probe);
    setTube(g.cables.leadRed, [a, sag(a, b, 0.28), b], true);
    const a2 = a.clone().add(new THREE.Vector3(0.02, 0, 0));
    const b2 = b.clone().add(new THREE.Vector3(0, -0.05, 0.02));
    setTube(g.cables.leadBlack, [a2, sag(a2, b2, 0.34, 0.45), b2], true);
  } else {
    setTube(g.cables.leadRed, [], false);
    setTube(g.cables.leadBlack, [], false);
  }

  // Crane pendant: controller → up to the hoist
  if (on("signal")) {
    const a = wp(t.anchors.pendant);
    setTube(g.cables.pendant, [a, a.clone().lerp(tg.hoist, 0.5).add(new THREE.Vector3(0, 0, 0.05)), tg.hoist], true);
  } else setTube(g.cables.pendant, [], false);

  // Gauge hoses: manifold → service ports on the unit
  if (on("gauge")) {
    const a = wp(t.anchors.gauge);
    const pB = tg.coolerPort.clone();
    const pR = tg.coolerPort.clone().add(new THREE.Vector3(0, -0.12, 0.02));
    setTube(g.cables.hoseBlue, [a, sag(a, pB, 0.45), pB], true);
    setTube(g.cables.hoseRed, [a.clone().add(new THREE.Vector3(0.04, 0, 0)), sag(a, pR, 0.55), pR], true);
  } else {
    setTube(g.cables.hoseBlue, [], false);
    setTube(g.cables.hoseRed, [], false);
  }
}
