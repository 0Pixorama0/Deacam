import * as THREE from "three";

/*
  Safety signs and equipment labels, drawn on canvas so they stay crisp and
  weigh nothing. Styled after AS 1319 (DANGER / WARNING / NOTICE) and the
  traffolyte ID plates common on Australian switchgear. Illustrative props for
  the 3D scene, not specifications of real equipment.
*/

type Draw = (c: CanvasRenderingContext2D, w: number, h: number) => void;

function tex(w: number, h: number, draw: Draw) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d")!;
  draw(c, w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const SANS = '"Helvetica Neue", Arial, sans-serif';

function rounded(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

function fitText(c: CanvasRenderingContext2D, text: string, maxW: number, weight: string, size: number) {
  let s = size;
  c.font = `${weight} ${s}px ${SANS}`;
  while (c.measureText(text).width > maxW && s > 10) {
    s -= 2;
    c.font = `${weight} ${s}px ${SANS}`;
  }
}

function centered(c: CanvasRenderingContext2D, lines: string[], y0: number, w: number, lh: number, weight: string, size: number) {
  c.textAlign = "center";
  c.textBaseline = "middle";
  lines.forEach((l, i) => {
    fitText(c, l, w - 48, weight, size);
    c.fillText(l, w / 2, y0 + i * lh);
  });
}

/** AS 1319 DANGER: red oval with white text on a black header, black text below. */
export const danger = (l1 = "HIGH VOLTAGE", l2 = "KEEP OUT") =>
  tex(640, 400, (c, w, h) => {
    rounded(c, 0, 0, w, h, 18);
    c.fillStyle = "#f7f7f5";
    c.fill();
    c.fillStyle = "#111";
    c.fillRect(0, 0, w, 150);
    c.fillStyle = "#d4202c";
    c.beginPath();
    c.ellipse(w / 2, 75, 230, 56, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff";
    centered(c, ["DANGER"], 78, w, 0, "800", 78);
    c.fillStyle = "#111";
    centered(c, [l1, l2], 222, w, 92, "800", 72);
    c.strokeStyle = "#111";
    c.lineWidth = 8;
    rounded(c, 4, 4, w - 8, h - 8, 16);
    c.stroke();
  });

/** AS 1319 WARNING: yellow with a black triangle symbol. */
export const warning = (l1: string, l2: string) =>
  tex(640, 420, (c, w, h) => {
    rounded(c, 0, 0, w, h, 18);
    c.fillStyle = "#ffcf1f";
    c.fill();
    // triangle
    c.fillStyle = "#111";
    c.beginPath();
    c.moveTo(w / 2, 26);
    c.lineTo(w / 2 + 92, 184);
    c.lineTo(w / 2 - 92, 184);
    c.closePath();
    c.fill();
    c.fillStyle = "#ffcf1f";
    c.beginPath();
    c.moveTo(w / 2, 58);
    c.lineTo(w / 2 + 66, 170);
    c.lineTo(w / 2 - 66, 170);
    c.closePath();
    c.fill();
    // lightning bolt
    c.fillStyle = "#111";
    c.beginPath();
    c.moveTo(w / 2 + 6, 82);
    c.lineTo(w / 2 - 22, 132);
    c.lineTo(w / 2 - 2, 132);
    c.lineTo(w / 2 - 10, 164);
    c.lineTo(w / 2 + 24, 116);
    c.lineTo(w / 2 + 4, 116);
    c.closePath();
    c.fill();
    centered(c, ["WARNING"], 230, w, 0, "800", 64);
    centered(c, [l1, l2], 306, w, 56, "700", 44);
    c.strokeStyle = "#111";
    c.lineWidth = 8;
    rounded(c, 4, 4, w - 8, h - 8, 16);
    c.stroke();
  });

/** AS 1319 mandatory (blue) sign. */
export const mandatory = (l1: string, l2: string) =>
  tex(640, 360, (c, w, h) => {
    rounded(c, 0, 0, w, h, 18);
    c.fillStyle = "#f7f7f5";
    c.fill();
    c.fillStyle = "#0a5aa8";
    c.beginPath();
    c.arc(116, h / 2, 88, 0, Math.PI * 2);
    c.fill();
    // padlock symbol
    c.strokeStyle = "#fff";
    c.lineWidth = 12;
    c.beginPath();
    c.arc(116, h / 2 - 18, 26, Math.PI, 0);
    c.stroke();
    c.fillStyle = "#fff";
    c.fillRect(80, h / 2 - 18, 72, 56);
    c.fillStyle = "#0a5aa8";
    c.fillRect(112, h / 2 + 2, 8, 20);
    c.fillStyle = "#111";
    c.textAlign = "left";
    c.textBaseline = "middle";
    fitText(c, l1, 380, "800", 56);
    c.fillText(l1, 228, h / 2 - 34);
    fitText(c, l2, 380, "800", 56);
    c.fillText(l2, 228, h / 2 + 34);
    c.strokeStyle = "#0a5aa8";
    c.lineWidth = 8;
    rounded(c, 4, 4, w - 8, h - 8, 16);
    c.stroke();
  });

/** Engraved traffolyte ID plate: white on black. */
export const idPlate = (l1: string, l2: string) =>
  tex(640, 200, (c, w, h) => {
    rounded(c, 0, 0, w, h, 10);
    c.fillStyle = "#15171a";
    c.fill();
    c.fillStyle = "#f2f2f0";
    centered(c, [l1], 72, w, 0, "700", 64);
    c.fillStyle = "#b9bec4";
    centered(c, [l2], 146, w, 0, "500", 38);
    // screw heads
    c.fillStyle = "#8b9097";
    [
      [22, h / 2],
      [w - 22, h / 2],
    ].forEach(([x, y]) => {
      c.beginPath();
      c.arc(x, y, 9, 0, Math.PI * 2);
      c.fill();
    });
  });

/** DEACAM 24/7 service sticker. */
export const service = (line = "24/7 BREAKDOWN") =>
  tex(640, 300, (c, w, h) => {
    rounded(c, 0, 0, w, h, 22);
    c.fillStyle = "#ffffff";
    c.fill();
    c.fillStyle = "#bf1e2e";
    rounded(c, 0, 0, w, 96, 22);
    c.fill();
    c.fillRect(0, 60, w, 36);
    c.fillStyle = "#fff";
    centered(c, [line], 50, w, 0, "800", 48);
    // mark: D stem + red C arc + wordmark
    c.fillStyle = "#676867";
    c.fillRect(70, 138, 14, 76);
    c.strokeStyle = "#bf1e2e";
    c.lineWidth = 14;
    c.beginPath();
    c.arc(116, 176, 32, Math.PI * 0.5, Math.PI * 1.5);
    c.stroke();
    c.fillStyle = "#676867";
    c.textAlign = "left";
    c.textBaseline = "middle";
    c.font = `600 64px ${SANS}`;
    c.fillText("DEACAM", 168, 180);
    c.fillStyle = "#111";
    c.textAlign = "center";
    c.font = `700 44px ${SANS}`;
    c.fillText("(03) 9738 0528", w / 2, 262);
  });

/** Safe working load plate for lifting equipment. */
export const swl = (load = "SWL 10 t") =>
  tex(640, 240, (c, w, h) => {
    rounded(c, 0, 0, w, h, 14);
    c.fillStyle = "#ffcf1f";
    c.fill();
    c.fillStyle = "#111";
    centered(c, [load], 104, w, 0, "900", 120);
    centered(c, ["NEVER STAND UNDER LOAD"], 196, w, 0, "700", 40);
    c.strokeStyle = "#111";
    c.lineWidth = 10;
    rounded(c, 5, 5, w - 10, h - 10, 12);
    c.stroke();
  });

/** Green inspection tag, as seen on serviced plant. */
export const tested = (by = "DEACAM") =>
  tex(420, 260, (c, w, h) => {
    rounded(c, 0, 0, w, h, 16);
    c.fillStyle = "#1f9d55";
    c.fill();
    c.fillStyle = "#fff";
    centered(c, ["INSPECTED", `BY ${by}`], 78, w, 64, "800", 52);
    c.fillStyle = "rgba(255,255,255,.85)";
    c.fillRect(40, 196, w - 80, 4);
    c.font = `600 26px ${SANS}`;
    c.fillText("NEXT DUE ________", w / 2, 226);
  });
