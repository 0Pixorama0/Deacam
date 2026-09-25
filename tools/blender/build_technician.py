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
    "hair": ("#1d1f24", 0.55, 0), "brow": ("#1d1f24", 0.6, 0), "white": ("#ffffff", 0.25, 0),
    "iris": ("#6b3a1c", 0.3, 0), "pupil": ("#111111", 0.2, 0), "lip": ("#b8614f", 0.55, 0),
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
    "headTop": Vector((0, 0, HIP + 0.16 + 0.86 + 0.66)),
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
    if c.z > HIP + 0.99 and ax < 0.13:
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

# ── head ───────────────────────────────────────────────────────
HC = J["neck"] + Vector((0, 0, 0.34))
FZ = -0.29  # face plane (y) ≈ front of head
parts = []
def part(name, bm, material, bone_name="head"):
    ob = new_obj(name, bm, material)
    parts.append((ob, bone_name))
    return ob
part("skull", xf(sphere(0.31, 48, 24), s=(0.96, 0.94, 1.06), t=HC), "skin")
part("jaw", xf(sphere(0.2, 32, 16), s=(1.15, 0.9, 0.85), t=HC + Vector((0, -0.07, -0.13))), "skin")
part("nose", xf(sphere(0.052, 20, 12), s=(0.9, 1.1, 0.85), t=HC + Vector((0, -0.3, -0.03))), "skin")
for s in (-1, 1):
    part(f"ear{s}", xf(sphere(0.075, 16, 10), s=(0.5, 0.8, 1), t=HC + Vector((s * 0.305, 0, -0.02))), "skin")
    ec = HC + Vector((s * 0.11, -0.25, 0.04))
    part(f"eyeW{s}", xf(sphere(0.066, 24, 14), s=(1, 0.6, 1.12), t=ec), "white")
    part(f"iris{s}", xf(sphere(0.043, 20, 10), s=(1, 0.25, 1), t=ec + Vector((0, -0.036, -0.004))), "iris")
    part(f"pupil{s}", xf(sphere(0.023, 16, 8), s=(1, 0.25, 1), t=ec + Vector((0, -0.045, -0.004))), "pupil")
    part(f"glint{s}", xf(sphere(0.009, 8, 6), s=(1, 0.4, 1), t=ec + Vector((0.013, -0.05, 0.012))), "white")
    part(f"brow{s}", xf(cyl(0.024, 0.02, 0.11, 16), r=(0, math.pi / 2 + s * 0.18, 0), t=HC + Vector((s * 0.11, -0.27, 0.15))), "brow")
    part(f"cheek{s}", xf(sphere(0.046, 16, 8), s=(1, 0.2, 0.8), t=HC + Vector((s * 0.17, -0.262, -0.07))), "cheek")
smile = keep(torus(0.07, 0.011, 32, 10), lambda co: co.y < -0.02)
part("smile", xf(smile, r=(math.pi / 2, 0, 0), t=HC + Vector((0, -0.285, -0.075))), "lip")
# hair: back and sides + fringe
hair = keep(sphere(0.318, 40, 20), lambda co: co.y > -0.12 and co.z > -0.04)
part("hair", xf(hair, s=(0.97, 0.95, 1.02), t=HC + Vector((0, 0.01, 0.01))), "hair")
for k in range(-2, 3):
    part(f"fringe{k}", xf(cyl(0.04, 0.0, 0.09, 8), r=(-0.6, 0, k * 0.2), t=HC + Vector((k * 0.06, -0.25, 0.215))), "hair")
for s in (-1, 1):
    part(f"burn{s}", xf(sphere(0.1, 12, 8), s=(0.45, 0.8, 1.1), t=HC + Vector((s * 0.285, 0.02, 0.06))), "hair")
# hard hat
HT = HC + Vector((0, 0, 0.15))
dome = keep(sphere(0.34, 48, 24), lambda co: co.z >= -0.001)
part("hatDome", xf(dome, s=(1, 1.08, 0.95), t=HT), "hat")
part("hatBrim", xf(cyl(0.38, 0.37, 0.035, 48), s=(1, 1.12, 1), t=HT + Vector((0, -0.02, 0))), "hatDark")
peak = keep(cyl(0.25, 0.22, 0.03, 32), lambda co: co.y <= 0.001)
part("hatPeak", xf(peak, s=(1, 0.75, 1), t=HT + Vector((0, -0.27, 0.005))), "hat")
ridge = keep(torus(0.33, 0.03, 40, 10, math.pi), lambda co: True)
part("hatRidge", xf(ridge, s=(1.08, 1, 0.95), r=(math.pi / 2, 0, math.pi / 2), t=HT), "hatDark")
for s in (-1, 1):
    part(f"hatSlot{s}", xf(rbox(0.05, 0.1, 0.06, 0.012), t=HT + Vector((s * 0.36, 0, 0.03))), "hatDark")
part("hatMark", xf(rbox(0.1, 0.006, 0.03, 0.004), t=HT + Vector((0, -0.335, 0.19))), "red")

# ── torso extras ───────────────────────────────────────────────
T = J["spine"]
for s in (-1, 1):
    part(f"collar{s}", xf(rbox(0.15, 0.02, 0.07, 0.012), r=(-0.7, s * 0.5, s * 0.45), t=T + Vector((s * 0.08, -0.12, 0.83))), "polo", "torso")
    part(f"vestShoulder{s}", xf(rbox(0.13, 0.3, 0.05, 0.02), r=(0, s * 0.35, 0), t=T + Vector((s * 0.27, 0, 0.79))), "vest", "torso")
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

HEAD_SCALE = 1.22
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
