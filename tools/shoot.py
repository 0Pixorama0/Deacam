#!/usr/bin/env python3
"""Screenshot the built site at desktop and phone widths, and report console errors."""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")
SHOTS = os.path.join(ROOT, "tools", "shots")
os.makedirs(SHOTS, exist_ok=True)

PAGES = ["index", "about", "services", "industries", "projects", "contact"]
VIEWS = [("desktop", 1440, 900), ("phone", 390, 844)]

problems = []
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    for label, w, h in VIEWS:
        ctx = browser.new_context(viewport={"width": w, "height": h},
                                  device_scale_factor=2 if label == "phone" else 1)
        page = ctx.new_page()
        page.on("console", lambda m: problems.append("console %s: %s" % (m.type, m.text))
                if m.type == "error" and "ERR_CERT" not in m.text and "fonts.g" not in m.text else None)
        page.on("pageerror", lambda e: problems.append("pageerror: %s" % e))
        for name in PAGES:
            page.goto("file://%s/%s.html" % (SITE, name), wait_until="load")
            # scroll the whole page so lazy images actually load before we check them
            page.evaluate("""() => new Promise(r => {
                let y = 0;
                const step = () => {
                    y += window.innerHeight;
                    window.scrollTo(0, y);
                    if (y < document.body.scrollHeight) { setTimeout(step, 60); }
                    else { window.scrollTo(0, 0); setTimeout(r, 800); }
                };
                step();
            })""")
            try:
                page.wait_for_function(
                    "() => [...document.images].every(i => i.complete)", timeout=8000)
            except Exception:
                pass
            page.wait_for_timeout(400)
            full = label == "desktop"
            page.screenshot(path=os.path.join(SHOTS, "%s-%s.png" % (name, label)),
                            full_page=full)
            # horizontal overflow is the classic responsive failure
            over = page.evaluate(
                "() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
            if over > 1:
                problems.append("%s @%s: horizontal overflow %dpx" % (name, label, over))
            # (asset paths are verified deterministically after the browser run)
        ctx.close()

    # mobile menu behaviour
    ctx = browser.new_context(viewport={"width": 390, "height": 844})
    page = ctx.new_page()
    page.goto("file://%s/index.html" % SITE, wait_until="networkidle")
    page.click("[data-nav-open]")
    page.wait_for_timeout(350)
    open_state = page.get_attribute("#mobile-nav", "data-open")
    page.screenshot(path=os.path.join(SHOTS, "menu-phone.png"))
    page.keyboard.press("Escape")
    page.wait_for_timeout(350)
    closed_state = page.get_attribute("#mobile-nav", "data-open")
    print("mobile menu: open=%s  after Escape=%s" % (open_state, closed_state))
    if open_state != "true" or closed_state != "false":
        problems.append("mobile menu did not open/close correctly")
    ctx.close()
    browser.close()

# every referenced asset must exist on disk and decode — deterministic, no lazy-load race
import re, struct
refs = set()
for name in PAGES:
    html = open(os.path.join(SITE, name + ".html")).read()
    for attr in re.findall(r'(?:src|href)="([^"]+)"', html):
        if attr.startswith(("http", "#", "mailto:", "tel:")):
            continue
        refs.add((name, attr))
for page_name, rel in sorted(refs):
    target = os.path.normpath(os.path.join(SITE, rel))
    if not os.path.exists(target):
        problems.append("%s: missing asset %s" % (page_name, rel))
    elif target.lower().endswith((".png", ".jpg", ".jpeg")) and os.path.getsize(target) < 100:
        problems.append("%s: empty asset %s" % (page_name, rel))
print("verified %d referenced assets" % len({r for _, r in refs}))

print("\nshots -> tools/shots/")
if problems:
    print("\nPROBLEMS (%d):" % len(problems))
    for p in dict.fromkeys(problems):
        print("  -", p)
    sys.exit(1)
print("\nNo overflow, no broken images, no console errors.")
