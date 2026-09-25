// Motion preference for this site. Full motion is the default on every device;
// visitors who want less can switch it off in the footer (stored in localStorage).
export const MOTION_KEY = "deacam-motion";

export function reducedMotion(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.motion === "reduce";
}
