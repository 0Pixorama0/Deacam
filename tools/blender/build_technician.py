"""
Build the DEACAM technician in Blender and export a rigged GLB.

Run:  blender -b -P build_technician.py -- <out.glb>

Body: one continuous skinned mesh from a Skin modifier (no seams at joints),
subdivided and auto-weighted to an armature whose bone names match the site's
rig. Clothing colours are assigned per face region. Face, hair, hard hat,
vest bands, belt, pouches and boots are separate meshes parented to bones.

Blender axes: Z up, character faces -Y (glTF export turns that into +Z forward).
"""
import sys
import math
import bpy
import bmesh
from mathutils import Vector, Matrix

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "technician.glb"

# ── reset ─────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
col = scene.collection

# ── materials (names are mapped to tuned materials on the site) ──
def mat(name, rgb, rough=0.55, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m

def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

M = {k: mat(k, srgb(v), r, mt) for k, (v, r, mt) in {
    "skin": ("#eeb08a", 0.5, 0), "polo": ("#3f6ea6", 0.62, 0), "poloDark": ("#335d8f", 0.65, 0),
    "vest": ("#f26a1b", 0.55, 0), "band": ("#e6f02a", 0.35, 0), "trim": ("#8a4a1c", 0.6, 0),
    "jeans": ("#4b77ad", 0.72, 0), "jeansLight": ("#5f8bc0", 0.7, 0), "belt": ("#5a3219", 0.5, 0),
    "buckle": ("#c9a24a", 0.3, 0.8), "pouch": ("#ef6e1c", 0.55, 0), "toolY": ("#e8b21e", 0.45, 0),
    "toolG": ("#8e959d", 0.3, 0.8), "boot": ("#8a4b26", 0.42, 0), "sole": ("#4a2a16", 0.8, 0),
    "hair": ("#1d1f24", 0.55, 0), "brow": ("#2a1f18", 0.7, 0), "white": ("#ffffff", 0.25, 0),
    "iris": ("#6b3a1c", 0.3, 0), "pupil": ("#111111", 0.2, 0), "lip": ("#c47a6a", 0.5, 0),
    "cheek": ("#e8977a", 0.55, 0), "hat": ("#f7b516", 0.32, 0), "hatDark": ("#e39c0c", 0.38, 0),
    "red": ("#bf1e2e", 0.45, 0),
}.items()}

def new_obj(name, bm, material):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    me.materials.append(M[material])
    ob = bpy.data.objects.new(name, me)
    col.objects.link(ob)
    return ob

def xf(bm, s=(1, 1, 1), r=(0, 0, 0), t=(0, 0, 0)):
    m = Matrix.Translation(t) @ (Matrix.Rotation(r[2], 4, "Z") @ Matrix.Rotation(r[1], 4, "Y") @ Matrix.Rotation(r[0], 4, "X")) @ Matrix.Diagonal((*s, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts)
    return bm

def sphere(r=1, seg=32, rings=16):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)
    return bm

def cyl(r1, r2, h, seg=32, cap=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, segments=seg, radius1=r1, radius2=r2, depth=h)
    return bm

def rbox(w, d, h, bevel=0.02):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    xf(bm, s=(w, d, h))
    bmesh.ops.bevel(bm, geom=bm.verts[:] + bm.edges[:], offset=bevel, segments=3, affect="EDGES")
    return bm

def torus(R, r, seg=32, rseg=12, arc=math.tau):
    bm = bmesh.new()
    verts = []
    for i in range(seg + (0 if arc >= math.tau else 1)):
        a = arc * i / seg
        ring = []
        for j in range(rseg):
            b = math.tau * j / rseg
            ring.append(bm.verts.new(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b))))
        verts.append(ring)
    n = len(verts)
    for i in range(n if arc >= math.tau else n - 1):
        a, b = verts[i], verts[(i + 1) % n]
        for j in range(rseg):
            bm.faces.new((a[j], a[(j + 1) % rseg], b[(j + 1) % rseg], b[j]))
    return bm

def keep(bm, pred):
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not pred(v.co)], context="VERTS")
    return bm

# ── skeleton points (feet at z=0, facing -Y) ────────────────────
HIP = 1.24
J = {
    "hips": Vector((0, 0, HIP)),
    "spine": Vector((0, 0, HIP + 0.16)),
    "neck": Vector((0, 0, HIP + 0.16 + 0.86)),
    "headTop": Vector((0, 0, HIP + 0.16 + 0.86 + 0.6)),
}
SH_Z = HIP + 0.16 + 0.74
def side(s):
    return {
        "hip": Vector((s * 0.155, 0, HIP)),
        "knee": Vector((s * 0.158, -0.01, HIP - 0.55)),
        "ankle": Vector((s * 0.16, 0.0, HIP - 1.1)),
        "shoulder": Vector((s * 0.42, 0, SH_Z)),
        "elbow": Vector((s * 0.47, 0.01, SH_Z - 0.46)),
        "wrist": Vector((s * 0.5, 0.0, SH_Z - 0.82)),
        "handEnd": Vector((s * 0.51, -0.01, SH_Z - 0.98)),
    }
SIDES = {"L": side(-1), "R": side(1)}

# ── body via Skin modifier ─────────────────────────────────────
bm = bmesh.new()
skin_pts = []  # (vert, radius_x, radius_y)
def V(p, rx, ry=None):
    v = bm.verts.new(p)
    skin_pts.append((v, rx, ry if ry is not None else rx))
    return v
pelvis = V((0, 0, HIP), 0.3, 0.23)
waist = V((0, 0, HIP + 0.22), 0.3, 0.22)
chest = V((0, 0, HIP + 0.6), 0.35, 0.26)
upper = V((0, 0, HIP + 0.84), 0.3, 0.22)
neck = V((0, 0, HIP + 1.04), 0.1, 0.1)
for a, b in [(pelvis, waist), (waist, chest), (chest, upper), (upper, neck)]:
    bm.edges.new((a, b))
for k, s in (("L", -1), ("R", 1)):
    P = SIDES[k]
    hipv = V(P["hip"] + Vector((0, 0, -0.04)), 0.165)
    bm.edges.new((pelvis, hipv))
    thighm = V(P["hip"].lerp(P["knee"], 0.5), 0.15)
    knee = V(P["knee"], 0.125)
    calf = V(P["knee"].lerp(P["ankle"], 0.4), 0.135)
    ankle = V(P["ankle"] + Vector((0, 0, 0.08)), 0.115)
    for a2, b2 in [(hipv, thighm), (thighm, knee), (knee, calf), (calf, ankle)]:
        bm.edges.new((a2, b2))
    shoul = V(Vector((s * 0.3, 0, SH_Z + 0.02)), 0.14)
    bm.edges.new((upper, shoul))
    sj = V(P["shoulder"], 0.13)
    elb = V(P["elbow"], 0.1)
    wr = V(P["wrist"], 0.085)
    hand = V(P["handEnd"] + Vector((0, 0, 0.03)), 0.095, 0.065)
    for a, b in [(shoul, sj), (sj, elb), (elb, wr), (wr, hand)]:
        bm.edges.new((a, b))
me = bpy.data.meshes.new("bodySkel")
bm.to_mesh(me)
body = bpy.data.objects.new("body", me)
col.objects.link(body)
skin = body.modifiers.new("skin", "SKIN")
sv = me.skin_vertices[0].data
for (v, rx, ry) in skin_pts:
    sv[v.index].radius = (rx, ry)
sv[0].use_root = True
body.modifiers.new("sub", "SUBSURF").levels = 2
dg = bpy.context.evaluated_depsgraph_get()
body_me = bpy.data.meshes.new_from_object(body.evaluated_get(dg))
bpy.data.objects.remove(body)
body = bpy.data.objects.new("body", body_me)
col.objects.link(body)
for p in body_me.polygons:
    p.use_smooth = True

# clothing regions on the body
for n in ["skin", "polo", "jeans", "belt"]:
    body_me.materials.append(M[n])
IDX = {n: i for i, n in enumerate(["skin", "polo", "jeans", "belt"])}
for p in body_me.polygons:
    c = p.center
    ax = abs(c.x)
    if c.z > HIP + 1.02 and ax < 0.12:
        m = "skin"  # neck
    elif ax > 0.3 and c.z > HIP - 0.1:  # arms
        m = "polo" if c.z > SH_Z - 0.24 else "skin"
    elif c.z > HIP + 0.19:
        m = "polo"
    elif c.z > HIP + 0.12:
        m = "belt"
    else:
        m = "jeans"
    p.material_index = IDX[m]

# ── vest: offset shell of the torso, open at the front ─────────
bm = bmesh.new()
bm.from_mesh(body_me)
bm.verts.ensure_lookup_table()
bmesh.ops.delete(bm, geom=[f for f in bm.faces if not (HIP + 0.2 < f.calc_center_median().z < HIP + 0.92 and abs(f.calc_center_median().x) < 0.34)], context="FACES")
bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.calc_center_median().y < -0.1 and abs(f.calc_center_median().x) < 0.075], context="FACES")
bm.normal_update()
for v in bm.verts:
    v.co += v.normal * 0.022
vest = new_obj("vest", bm, "vest")
vest.data.materials.append(M["band"])
for p in vest.data.polygons:
    c = p.center
    band = HIP + 0.27 < c.z < HIP + 0.34 or HIP + 0.43 < c.z < HIP + 0.5
    stripe = c.y < -0.1 and 0.085 < abs(c.x) < 0.14 and c.z > HIP + 0.5
    p.material_index = 1 if (band or stripe) else 0
sol = vest.modifiers.new("sol", "SOLIDIFY")
sol.thickness = 0.012
sol.offset = 1

# ── armature (bone names match the site) ───────────────────────
arm_data = bpy.data.armatures.new("rig")
rig = bpy.data.objects.new("rig", arm_data)
col.objects.link(rig)
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
eb = arm_data.edit_bones
def bone(name, head, tail, parent=None):
    b = eb.new(name)
    b.head, b.tail = head, tail
    b.roll = 0
    if parent:
        b.parent = eb[parent]
    return b
bone("hips", Vector((0, 0, HIP - 0.1)), Vector((0, 0, HIP)))
bone("torso", J["spine"], Vector((0, 0, HIP + 0.9)), "hips")
bone("head", J["neck"], J["headTop"], "torso")
for k in ("L", "R"):
    P = SIDES[k]
    bone("thigh" + k, P["hip"], P["knee"], "hips")
    bone("shin" + k, P["knee"], P["ankle"], "thigh" + k)
    bone("arm" + k, P["shoulder"], P["elbow"], "torso")
    bone("fore" + k, P["elbow"], P["wrist"], "arm" + k)
    bone("hand" + k, P["wrist"], P["handEnd"], "fore" + k)
bpy.ops.object.mode_set(mode="OBJECT")

def skin_to_rig(ob):
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")
skin_to_rig(body)
skin_to_rig(vest)

def attach(ob, bone_name):
    mw = ob.matrix_world.copy()
    ob.parent = rig
    ob.parent_type = "BONE"
    ob.parent_bone = bone_name
    bpy.context.view_layer.update()
    ob.matrix_world = mw

# ── head: one sculpted surface (human proportions) ─────────────
HC = J["neck"] + Vector((0, 0, 0.29))
HR = 0.25  # head radius before shaping
parts = []
def part(name, bm, material, bone_name="head"):
    ob = new_obj(name, bm, material)
    parts.append((ob, bone_name))
    return ob

def g(p, c, s, a):
    """anisotropic gaussian bump on the unit sphere"""
    d = [(p[i] - c[i]) / s[i] for i in range(3)]
    return a * math.exp(-(d[0] ** 2 + d[1] ** 2 + d[2] ** 2))

BUMPS = [
    # (centre on unit sphere, sigma xyz, amplitude)   front is -Y
    ((0.0, -0.9, -0.72), (0.24, 0.25, 0.12), 0.04),   # chin
    ((0.33, -0.88, 0.12), (0.13, 0.2, 0.1), -0.075),  # eye socket R
    ((-0.33, -0.88, 0.12), (0.13, 0.2, 0.1), -0.075), # eye socket L
    ((0.3, -0.9, 0.3), (0.2, 0.2, 0.06), 0.03),       # brow ridge R
    ((-0.3, -0.9, 0.3), (0.2, 0.2, 0.06), 0.03),      # brow ridge L
    ((0.0, -0.98, 0.02), (0.07, 0.2, 0.2), 0.16),     # nose bridge
    ((0.0, -0.95, -0.2), (0.1, 0.2, 0.08), 0.13),     # nose tip
    ((0.11, -0.93, -0.25), (0.06, 0.2, 0.05), 0.05),  # nostril wing R
    ((-0.11, -0.93, -0.25), (0.06, 0.2, 0.05), 0.05), # nostril wing L
    ((0.55, -0.72, -0.05), (0.18, 0.2, 0.12), 0.035), # cheekbone R
    ((-0.55, -0.72, -0.05), (0.18, 0.2, 0.12), 0.035),# cheekbone L
    ((0.0, -0.94, -0.41), (0.15, 0.2, 0.04), 0.05),   # upper lip
    ((0.0, -0.93, -0.5), (0.13, 0.2, 0.04), 0.055),   # lower lip
    ((0.0, -0.95, -0.455), (0.17, 0.2, 0.01), -0.035),# mouth line
    ((0.0, -0.96, -0.32), (0.035, 0.2, 0.05), -0.012),# philtrum
]
LIPS = [((0.0, -0.94, -0.41), (0.15, 0.2, 0.04)), ((0.0, -0.93, -0.5), (0.13, 0.2, 0.04))]
head_bm = sphere(1, 128, 96)
lip_amt = {}
for v in head_bm.verts:
    p = v.co.normalized()
    d = sum(g(p, c, sg, a) for (c, sg, a) in BUMPS)
    lip_amt[v.index] = max(g(p, c, sg, 1.0) for (c, sg) in LIPS)
    q = p * (1 + d)
    # skull: taller, narrower; jaw tapers below the cheekbones
    sx = 0.82 * (1 - 0.13 * max(0.0, -p.z - 0.15))
    sy = 0.92 * (1 - 0.08 * max(0.0, -p.z - 0.2))
    v.co = Vector((q.x * sx, q.y * sy, q.z * 1.04)) * HR
xf(head_bm, t=HC)
head_bm.verts.ensure_lookup_table()
lip_faces = [f.index for f in head_bm.faces if sum(lip_amt[v.index] for v in f.verts) / len(f.verts) > 0.45]
face = part("face", head_bm, "skin")
face.data.materials.append(M["lip"])
for i in lip_faces:
    face.data.polygons[i].material_index = 1

# eyes: eyeball, iris, pupil, highlight, upper eyelid
for s in (-1, 1):
    ec = HC + Vector((s * 0.33 * 0.82 * HR, -0.76 * 0.92 * HR, 0.12 * 1.04 * HR))
    er = 0.04
    part(f"eyeball{s}", xf(sphere(er, 24, 16), t=ec), "white")
    part(f"iris{s}", xf(sphere(er * 0.44, 20, 10), s=(1, 0.3, 1), t=ec + Vector((0, -er * 0.92, 0))), "iris")
    part(f"pupil{s}", xf(sphere(er * 0.24, 12, 8), s=(1, 0.3, 1), t=ec + Vector((0, -er * 0.99, 0))), "pupil")
    part(f"glint{s}", xf(sphere(er * 0.08, 8, 6), t=ec + Vector((er * 0.18, -er * 1.02, er * 0.2))), "white")
    lid = keep(sphere(er * 1.1, 24, 16), lambda co: co.z > er * 0.42 and co.y < er * 0.4)
    part(f"lid{s}", xf(lid, t=ec), "skin")
    low = keep(sphere(er * 1.07, 24, 16), lambda co: co.z < -er * 0.45 and co.y < er * 0.3)
    part(f"lowlid{s}", xf(low, t=ec), "skin")
    # natural brows: tapered, slightly arched
    brow = bmesh.new()
    prev = None
    ring = 8
    rows = []
    for k in range(13):
        t = (k - 6) / 6  # -1 inner … +1 outer (mirrored per side)
        cx = s * (t * 0.034 + 0.004)
        cz = er * 1.45 + 0.01 * (1 - t * t) - 0.003 * t
        r = 0.0075 * (1.2 - 0.55 * max(0.0, t)) if t > -0.8 else 0.006
        row = []
        for j in range(ring):
            b2 = math.tau * j / ring
            row.append(brow.verts.new(ec + Vector((cx, -er * 0.97 + math.sin(b2) * r * 0.5, cz + math.cos(b2) * r))))
        rows.append(row)
    for k in range(len(rows) - 1):
        a0, a1 = rows[k], rows[k + 1]
        for j in range(ring):
            brow.faces.new((a0[j], a0[(j + 1) % ring], a1[(j + 1) % ring], a1[j]))
    part(f"brow{s}", brow, "brow")
# ears
for s in (-1, 1):
    ear = sphere(1, 20, 12)
    for v in ear.verts:
        v.co = Vector((v.co.x * 0.018, v.co.y * 0.045, v.co.z * 0.07))
        if v.co.x * s < 0 and abs(v.co.y) < 0.03 and abs(v.co.z) < 0.05:
            v.co.x *= 0.3  # inner hollow
    part(f"ear{s}", xf(ear, t=HC + Vector((s * 0.81 * HR, 0.05 * HR, -0.02))), "skin")
# short black hair: back and sides, with a hairline above the forehead
hair = keep(sphere(1, 64, 32), lambda co: co.z > -0.05 and (co.y > -0.35 or co.z > 0.62))
for v in hair.verts:
    p = v.co.normalized()
    v.co = Vector((p.x * 0.8 * 1.04, p.y * 0.92 * 1.04, p.z * 1.12 * 1.03)) * HR
part("hair", xf(hair, t=HC + Vector((0, 0.004, 0.004))), "hair")
for s in (-1, 1):
    part(f"burn{s}", xf(sphere(1, 12, 8), s=(0.012, 0.035, 0.07), t=HC + Vector((s * 0.79 * HR, -0.05 * HR, 0.02))), "hair")
# hard hat sized to the head
HT = HC + Vector((0, 0, 0.62 * HR))
HS = HR * 1.1
dome = keep(sphere(HS, 48, 24), lambda co: co.z >= -0.001)
part("hatDome", xf(dome, s=(0.92, 1.05, 0.9), t=HT), "hat")
part("hatBrim", xf(cyl(HS * 1.08, HS * 1.05, 0.03, 48), s=(0.92, 1.12, 1), t=HT + Vector((0, -0.02, 0))), "hatDark")
peak = keep(cyl(HS * 0.72, HS * 0.64, 0.028, 32), lambda co: co.y <= 0.001)
part("hatPeak", xf(peak, s=(1, 0.75, 1), t=HT + Vector((0, -HS * 0.98, 0.005))), "hat")
ridge = torus(HS * 0.97, 0.024, 40, 10, math.pi)
part("hatRidge", xf(ridge, s=(1.05, 1, 0.9), r=(math.pi / 2, 0, math.pi / 2), t=HT), "hatDark")
for s in (-1, 1):
    part(f"hatSlot{s}", xf(rbox(0.04, 0.08, 0.05, 0.01), t=HT + Vector((s * HS * 0.94, 0, 0.025))), "hatDark")
part("hatMark", xf(rbox(0.08, 0.006, 0.025, 0.004), t=HT + Vector((0, -HS * 1.02, HS * 0.55))), "red")

# ── torso extras ───────────────────────────────────────────────
T = J["spine"]
for s in (-1, 1):
    part(f"collar{s}", xf(rbox(0.1, 0.015, 0.06, 0.012), r=(-0.35, 0, s * 0.35), t=T + Vector((s * 0.06, -0.125, 0.86))), "polo", "torso")
part("collarRing", xf(torus(0.108, 0.018, 32, 10), s=(1, 0.95, 1), t=T + Vector((0, 0, 0.87))), "poloDark", "torso")
part("placket", xf(rbox(0.06, 0.015, 0.26, 0.01), t=T + Vector((0, -0.262, 0.66))), "poloDark", "torso")
part("patch", xf(rbox(0.1, 0.012, 0.035, 0.006), t=T + Vector((-0.2, -0.285, 0.58))), "red", "torso")
# sleeves hems
for k, s in (("L", -1), ("R", 1)):
    P = SIDES[k]
    part(f"hem{k}", xf(torus(0.125, 0.018, 24, 8), t=P["shoulder"] + Vector((0, 0, -0.2))), "poloDark", "arm" + k)
# belt buckle + pouches
H = Vector((0, 0, HIP))
part("buckle", xf(rbox(0.09, 0.025, 0.07, 0.012), t=H + Vector((0, -0.25, 0.15))), "buckle", "hips")
for s in (-1, 1):
    base = H + Vector((s * 0.31, 0.06, -0.04))
    rot = (0, 0, -s * 0.7)
    part(f"pouch{s}", xf(rbox(0.16, 0.1, 0.28, 0.025), r=rot, t=base), "pouch", "hips")
    part(f"pouchFlap{s}", xf(rbox(0.17, 0.11, 0.05, 0.015), r=rot, t=base + Vector((0, 0, 0.13))), "pouch", "hips")
    part(f"toolY{s}", xf(rbox(0.035, 0.025, 0.16, 0.01), r=rot, t=base + Vector((-0.02 * s, 0, 0.2))), "toolY", "hips")
    part(f"toolG{s}", xf(cyl(0.014, 0.014, 0.18, 10), r=rot, t=base + Vector((0.02 * s, -0.01, 0.21))), "toolG", "hips")
# cuffs + boots
for k, s in (("L", -1), ("R", 1)):
    P = SIDES[k]
    a = P["ankle"]
    part(f"cuff{k}", xf(torus(0.14, 0.035, 28, 10), t=a + Vector((0, 0, 0.12))), "jeansLight", "shin" + k)
    part(f"bootToe{k}", xf(sphere(0.18, 24, 12), s=(1, 1.6, 0.72), t=a + Vector((0, -0.09, -0.03))), "boot", "shin" + k)
    part(f"bootAnkle{k}", xf(cyl(0.15, 0.16, 0.15, 24), t=a + Vector((0, 0.01, 0.02))), "boot", "shin" + k)
    part(f"sole{k}", xf(rbox(0.33, 0.56, 0.07, 0.025), t=a + Vector((0, -0.09, -0.14))), "sole", "shin" + k)
# fingers + thumbs
for k, s in (("L", -1), ("R", 1)):
    P = SIDES[k]
    h = P["handEnd"]
    part(f"thumb{k}", xf(cyl(0.026, 0.022, 0.07, 10), r=(0.5, 0, -s * 0.7), t=h + Vector((-s * 0.075, -0.04, 0.06))), "skin", "hand" + k)

HEAD_SCALE = 1.0
for ob, b in parts:
    if b == "head":
        me2 = ob.data
        for v in me2.vertices:
            v.co = J["neck"] + (v.co - J["neck"]) * HEAD_SCALE
for ob, b in parts:
    attach(ob, b)

# ── export ─────────────────────────────────────────────────────
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    export_apply=True,
    export_skins=True,
    export_animations=False,
    export_yup=True,
    export_materials="EXPORT",
)
print("EXPORTED", OUT, len(parts), "parts")
