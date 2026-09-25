"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { clamp, smooth, stageStore, stageV } from "./store";

/*
  Photoreal CC0 models (Poly Haven, compressed to GLB) carrying DEACAM
  badges. One model owns each chapter and they cross-fade in place, so
  nothing ever leaves the frame.

    Hero        distribution board, closed
    01 Power    outdoor electrical kiosk
    02 Control  distribution board, door swings open
    03 Safety   overhead crane (mechanical installs)
    04 Cooling  condensing unit
*/

const MODELS = {
  board: "/models/power_box_01.glb",
  kiosk: "/models/utility_box_01.glb",
  crane: "/models/overhead_crane.glb",
  cooler: "/models/exterior_aircon_unit.glb",
};
Object.values(MODELS).forEach((u) => useGLTF.preload(u));

const damp = THREE.MathUtils.damp;

/** Reduced motion: snap to the nearest resting state instead of scrubbing. */
const snap = (v: number) => (v < 0.5 ? 0 : Math.min(4, Math.round(v)));

type Model = { root: THREE.Group; mats: THREE.Material[]; base: number; plane: THREE.Plane };

const hideRails = (root: THREE.Object3D) =>
  root.traverse((o) => {
    if (o.name.includes("rails")) o.visible = false;
  });

/** Clone a GLB, normalise it to a target height, and give it its own materials so it can fade. */
function useModel(url: string, fit: { h?: number; w?: number }, prep?: (root: THREE.Object3D) => void): Model {
  const gltf = useGLTF(url);
  return useMemo(() => {
    const inner = gltf.scene.clone(true);
    const mats: THREE.Material[] = [];
    inner.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.material = (m.material as THREE.Material).clone();
      mats.push(m.material as THREE.Material);
    });
    prep?.(inner);
    const box = new THREE.Box3();
    inner.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o.visible) box.expandByObject(o);
    });
    const size = box.getSize(new THREE.Vector3());
    inner.position.set(-(box.min.x + size.x / 2), -box.min.y, -(box.min.z + size.z / 2));
    const root = new THREE.Group();
    root.add(inner);
    const base = fit.w ? fit.w / size.x : (fit.h ?? 2.5) / size.y;
    root.scale.setScalar(base);
    root.updateMatrixWorld(true);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e6);
    mats.forEach((m) => (m.clippingPlanes = [plane]));
    return { root, mats, base, plane };
  }, [gltf, fit.h, fit.w, prep]);
}

/** Stick a badge onto the model surface found by casting a ray at it from the front. */
function addBadge(model: Model, tex: THREE.Texture, fx: number, fy: number, w: number) {
  model.root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model.root);
  const x = box.min.x + (box.max.x - box.min.x) * fx;
  const y = box.min.y + (box.max.y - box.min.y) * fy;
  const ray = new THREE.Raycaster(new THREE.Vector3(x, y, box.max.z + 1), new THREE.Vector3(0, 0, -1));
  const hit = ray.intersectObject(model.root, true).find((h) => h.object.visible);
  if (!hit || !hit.face) return;
  const img = tex.image as HTMLImageElement;
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    transparent: true,
    roughness: 0.35,
    metalness: 0.2,
    polygonOffset: true,
    polygonOffsetFactor: -4,
  });
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(w, w / (img.width / img.height)), mat);
  const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  badge.position.copy(hit.point).addScaledVector(n, 0.003);
  badge.lookAt(hit.point.clone().add(n));
  hit.object.attach(badge); // moves with doors
  mat.clippingPlanes = [model.plane];
  model.mats.push(mat);
}

// Clipping: keep everything, keep above a height, or keep below it (world space).
const keepAll = (m: Model) => m.plane.set(new THREE.Vector3(0, 1, 0), 1e6);
const keepAbove = (m: Model, y: number) => m.plane.set(new THREE.Vector3(0, 1, 0), -y);
const keepBelow = (m: Model, y: number) => m.plane.set(new THREE.Vector3(0, -1, 0), y);

function Rig() {
  const badge = useTexture("/models/deacam-badge.png", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });

  const board = useModel(MODELS.board, { h: 2.7 });
  const kiosk = useModel(MODELS.kiosk, { h: 2.9 });
  const crane = useModel(MODELS.crane, { w: 4.4 }, hideRails);
  const cooler = useModel(MODELS.cooler, { h: 2.3 });

  const door = useMemo(() => board.root.getObjectByName("power_box_01_door") ?? null, [board]);
  const doorOpenQ = useMemo(() => door?.quaternion.clone() ?? new THREE.Quaternion(), [door]);

  // Close the door, then badge each model once (scene-graph setup, no React state).
  const ready = useMemo(() => {
    door?.quaternion.identity();
    addBadge(board, badge, 0.5, 0.84, 0.95);
    addBadge(kiosk, badge, 0.3, 0.84, 0.8);
    addBadge(cooler, badge, 0.84, 0.55, 0.42);
    addBadge(crane, badge, 0.5, 0.9, 0.6);
    return true;
  }, [board, kiosk, cooler, crane, badge, door]);

  const floor = useRef<THREE.Mesh>(null);
  const floorTex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c = cv.getContext("2d")!;
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(0,0,0,0.8)");
    g.addColorStop(0.55, "rgba(0,0,0,0.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(cv);
  }, []);
  const scan = useRef<THREE.Group>(null);
  const scanGlow = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 256;
    const c = cv.getContext("2d")!;
    const g = c.createRadialGradient(256, 128, 0, 256, 128, 256);
    g.addColorStop(0, "rgba(255,70,85,0.55)");
    g.addColorStop(0.35, "rgba(224,40,58,0.22)");
    g.addColorStop(1, "rgba(224,40,58,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 256);
    return new THREE.CanvasTexture(cv);
  }, []);
  const { camera, size } = useThree();
  const s = useRef({ v: 0, px: 0, py: 0 });
  const q = useMemo(() => new THREE.Quaternion(), []);

  useFrame((state, delta) => {
    if (!ready) return;
    const dt = Math.min(delta, 0.05);
    const reduce = stageStore.reduce;
    const mobile = stageStore.mobile;
    const st = s.current;
    const raw = stageV();
    // Desktop scroll is already smoothed by Lenis; a second heavy damp made the
    // models lag behind the page. Track it closely there, softer on touch.
    st.v = reduce ? snap(raw) : damp(st.v, raw, mobile ? 5 : 14, dt);
    st.px = damp(st.px, reduce ? 0 : stageStore.px, 2.5, dt);
    st.py = damp(st.py, reduce ? 0 : stageStore.py, 2.5, dt);
    const v = st.v;
    const time = state.clock.elapsedTime;

    // Framing: every model sits at the origin and the camera looks straight at it,
    // exactly like the phone layout. On desktop a lens shift (view offset) moves
    // the whole render to the right of the copy, so there's no off-axis skew.
    const dist = mobile ? 11.5 : 9;
    const ay = mobile ? -0.95 : -1.45;
    const lookY = mobile ? -1.2 : -0.1;
    const shift = mobile ? 0 : -size.width * (size.width < 1200 ? 0.23 : 0.2);
    const pc = camera as THREE.PerspectiveCamera;
    if (pc.view?.offsetX !== shift || pc.view?.fullWidth !== size.width || pc.view?.fullHeight !== size.height) {
      if (shift) pc.setViewOffset(size.width, size.height, shift, 0, size.width, size.height);
      else pc.clearViewOffset();
    }
    camera.position.set(st.px * 0.12, 0.6 - st.py * 0.08, dist);
    camera.lookAt(0, lookY, 0);

    const idle = reduce ? 0 : Math.sin(time * 0.25) * 0.04;
    const tilt = st.px * 0.06;
    const k = mobile ? 0.72 : 1;
    const place = (m: Model, yaw: number, sc = 1) => {
      m.root.position.set(0, ay, 0);
      m.root.rotation.set(st.py * 0.02, yaw + idle + tilt, 0);
      m.root.scale.setScalar(m.base * k * sc);
    };
    place(board, -0.42 + smooth(1.8, 2.3, v) * 0.12);
    place(kiosk, -0.5);
    place(crane, -0.45, mobile ? 0.78 : 0.92);
    place(cooler, -0.5);

    // Scan-line handover: a red line rises through the frame; the next model is
    // built below it while the current one is cut away above it. No ghosting.
    const seq: (Model | null)[] = [mobile ? null : board, kiosk, board, crane, cooler];
    const i = clamp(Math.floor(v), 0, 4);
    const p = i < 4 ? smooth(i + 0.35, i + 0.8, v) : 0;
    const from = seq[i];
    const to = i < 4 ? seq[i + 1] : null;
    const cut = ay - 0.05 + p * 3.4 * k;
    for (const m of [board, kiosk, crane, cooler]) m.root.visible = false;
    if (from && p < 1) {
      from.root.visible = true;
      if (p > 0) keepAbove(from, cut);
      else keepAll(from);
      from.root.rotation.y -= p * 0.25;
    }
    if (to && p > 0) {
      to.root.visible = true;
      if (p < 1) keepBelow(to, cut);
      else keepAll(to);
      to.root.rotation.y += (1 - p) * 0.45;
    }
    const sc = scan.current!;
    const on = p > 0 && p < 1 && !reduce;
    sc.visible = on;
    if (on) {
      sc.position.set(0, cut, 0);
      const fadeIO = Math.sin(Math.PI * p);
      sc.children.forEach((c) => (((c as THREE.Mesh).material as THREE.Material).opacity = fadeIO));
    }

    // Board door: closed in the hero, swings open for Control.
    if (door) {
      q.identity().slerp(doorOpenQ, smooth(1.8, 2.25, v));
      door.quaternion.copy(q);
    }

    const fl = floor.current!;
    fl.position.set(0, ay + 0.002, 0);
    const anyOn = (from && p < 1) || (to && p > 0);
    (fl.material as THREE.MeshBasicMaterial).opacity = anyOn ? (seq[Math.round(v)] === crane ? 0.35 : 0.9) : 0;
  });

  return (
    <group>
      <primitive object={board.root} />
      <primitive object={kiosk.root} />
      <primitive object={crane.root} />
      <primitive object={cooler.root} />
      <group ref={scan} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.2, 2.6]} />
          <meshBasicMaterial map={scanGlow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <mesh>
          <boxGeometry args={[3.6, 0.006, 0.006]} />
          <meshBasicMaterial color="#ffd6da" transparent toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={floor} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.5, 3]} />
        <meshBasicMaterial map={floorTex} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function PanelScene() {
  const [active, setActive] = useState(true);

  // Only render while the stage is on screen.
  useEffect(() => {
    const el = stageStore.el;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const mobile = stageStore.mobile;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={mobile ? [1, 1.5] : [1, 2]}
        camera={{ fov: 30, near: 0.1, far: 80, position: [0, 0.6, 9] }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[-4, 6, 5]} intensity={1.8} color="#fff4ea" />
        <directionalLight position={[6, 2, -4]} intensity={2.2} color="#a9c4ff" />
        <Suspense fallback={null}>
          <Environment files="/models/studio.hdr" environmentIntensity={0.9} />
          <Rig />
        </Suspense>
      </Canvas>
    </div>
  );
}
