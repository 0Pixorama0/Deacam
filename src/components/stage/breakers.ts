import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/*
  Real 3D DIN-rail devices for the distribution board. The scanned model only
  has breakers painted onto a flat plate, which reads as fake once the door
  opens, so these sit directly over the painted ones.

  Units are the board's world units after scaling (board height ~2.7).
*/

type Kind = "mcb" | "rcd" | "iso";

function label(text: string, sub: string, stripe: string) {
  const cv = document.createElement("canvas");
  cv.width = 128;
  cv.height = 160;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#f4f4f1";
  c.fillRect(0, 0, 128, 160);
  c.fillStyle = stripe;
  c.fillRect(0, 0, 128, 22);
  c.fillStyle = "#1b1d20";
  c.textAlign = "center";
  c.font = "700 44px Arial";
  c.fillText(text, 64, 84);
  c.font = "600 22px Arial";
  c.fillStyle = "#5b6068";
  c.fillText(sub, 64, 118);
  // curve glyph
  c.strokeStyle = "#5b6068";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(34, 148);
  c.lineTo(34, 132);
  c.quadraticCurveTo(64, 130, 94, 148);
  c.stroke();
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function buildBreakerRows(
  width: number,
  rowY: number[],
  mats: THREE.Material[],
): THREE.Group {
  const g = new THREE.Group();
  const plastic = new THREE.MeshPhysicalMaterial({ color: "#f1f1ee", roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.5 });
  const face = new THREE.MeshPhysicalMaterial({ color: "#e7e7e3", roughness: 0.5 });
  const toggleGrey = new THREE.MeshStandardMaterial({ color: "#2b2f35", roughness: 0.45 });
  const toggleRed = new THREE.MeshStandardMaterial({ color: "#c8202d", roughness: 0.45 });
  const rail = new THREE.MeshStandardMaterial({ color: "#b8bdc3", roughness: 0.3, metalness: 0.9 });
  const screw = new THREE.MeshStandardMaterial({ color: "#8e939a", roughness: 0.3, metalness: 0.9 });
  const hole = new THREE.MeshStandardMaterial({ color: "#6c7178", roughness: 0.7 });
  const testBtn = new THREE.MeshStandardMaterial({ color: "#2f63b5", roughness: 0.5 });
  const shared = [plastic, face, toggleGrey, toggleRed, rail, screw, hole, testBtn];
  mats.push(...shared);

  const modW = width / 8.4;
  const H = 0.36;
  const D = 0.15;
  const body = new RoundedBoxGeometry(modW * 0.97, H, D, 3, 0.012);
  const raise = new RoundedBoxGeometry(modW * 0.97, H * 0.44, 0.06, 3, 0.01);
  const tog = new RoundedBoxGeometry(modW * 0.46, H * 0.18, 0.07, 2, 0.01);
  const screwG = new THREE.CylinderGeometry(modW * 0.12, modW * 0.12, 0.01, 16);
  const holeG = new THREE.BoxGeometry(modW * 0.34, H * 0.035, 0.006);
  const labelG = new THREE.PlaneGeometry(modW * 0.8, H * 0.28);

  const stripes = ["#5a7fb8", "#5a7fb8", "#5fa38d", "#5fa38d", "#5a7fb8", "#5fa38d", "#5fa38d", "#5a7fb8"];
  const ratings = ["C16", "C16", "C20", "C20", "C10", "C16", "C32", "C20"];

  const device = (x: number, y: number, kind: Kind, i: number, w = 1) => {
    const m = new THREE.Group();
    m.position.set(x, y, 0);
    const bw = w === 1 ? body : new RoundedBoxGeometry(modW * w * 0.985, H, D, 3, 0.012);
    const rw = w === 1 ? raise : new RoundedBoxGeometry(modW * w * 0.985, H * 0.44, 0.06, 3, 0.01);
    const b = new THREE.Mesh(bw, plastic);
    b.position.z = D / 2;
    const r = new THREE.Mesh(rw, face);
    r.position.z = D + 0.03;
    m.add(b, r);
    // toggles: one per pole, "on" = up
    const poles = kind === "iso" ? w : 1;
    for (let p = 0; p < poles; p++) {
      const t = new THREE.Mesh(tog, kind === "iso" ? toggleRed : toggleGrey);
      t.position.set((p - (poles - 1) / 2) * modW, H * 0.1, D + 0.075);
      t.rotation.x = -0.35;
      m.add(t);
    }
    // terminal screws top and bottom
    for (let p = 0; p < Math.max(1, w); p++) {
      const px = (p - (Math.max(1, w) - 1) / 2) * modW;
      for (const sy of [H * 0.4, -H * 0.4]) {
        const s = new THREE.Mesh(screwG, screw);
        s.rotation.x = Math.PI / 2;
        s.position.set(px, sy, D + 0.002);
        const h = new THREE.Mesh(holeG, hole);
        h.position.set(px, sy + (sy > 0 ? H * 0.06 : -H * 0.06), D + 0.002);
        m.add(s, h);
      }
    }
    if (kind === "mcb") {
      const lm = new THREE.MeshStandardMaterial({ map: label(ratings[i % 8], "6kA", stripes[i % 8]), roughness: 0.6 });
      mats.push(lm);
      const l = new THREE.Mesh(labelG, lm);
      l.position.set(0, -H * 0.26, D + 0.001);
      m.add(l);
    }
    if (kind === "rcd") {
      const bt = new THREE.Mesh(new THREE.CylinderGeometry(modW * 0.14, modW * 0.14, 0.02, 20), testBtn);
      bt.rotation.x = Math.PI / 2;
      bt.position.set(modW * 0.5, -H * 0.05, D + 0.07);
      m.add(bt);
      const lm = new THREE.MeshStandardMaterial({ map: label("RCD", "30mA", "#2f63b5"), roughness: 0.6 });
      mats.push(lm);
      const l = new THREE.Mesh(new THREE.PlaneGeometry(modW * 1.6, H * 0.28), lm);
      l.position.set(0, -H * 0.26, D + 0.001);
      m.add(l);
    }
    if (kind === "iso") {
      const lm = new THREE.MeshStandardMaterial({ map: label("100A", "MAIN SWITCH", "#c8202d"), roughness: 0.6 });
      mats.push(lm);
      const l = new THREE.Mesh(new THREE.PlaneGeometry(modW * 2.4, H * 0.28), lm);
      l.position.set(0, -H * 0.26, D + 0.001);
      m.add(l);
    }
    g.add(m);
  };

  rowY.forEach((y, row) => {
    // DIN rail behind each row
    const r = new THREE.Mesh(new THREE.BoxGeometry(width * 0.99, 0.1, 0.02), rail);
    r.position.set(0, y, 0.01);
    g.add(r);
    if (row < rowY.length - 1) {
      for (let i = 0; i < 8; i++) device((i - 3.5) * modW, y, "mcb", i + row * 3);
    } else {
      device(-2.5 * modW, y, "rcd", 0, 2);
      device(-0.5 * modW, y, "mcb", 2);
      device(2 * modW, y, "iso", 0, 4);
    }
  });
  return g;
}
