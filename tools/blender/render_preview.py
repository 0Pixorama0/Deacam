"""blender -b -P render_preview.py -- in.glb out_prefix"""
import sys, math, bpy
from mathutils import Vector

a = sys.argv[sys.argv.index("--") + 1 :]
GLB, OUT = a[0], a[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE_NEXT"
sc.render.resolution_x, sc.render.resolution_y = 600, 800
sc.render.film_transparent = False
w = bpy.data.worlds.new("w"); sc.world = w
w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.02, 0.022, 0.026, 1)
w.node_tree.nodes["Background"].inputs[1].default_value = 1.0
for name, loc, e in [("key", (-3, -5, 6), 900), ("fill", (4, -3, 3), 350), ("rim", (0, 5, 5), 500)]:
    L = bpy.data.lights.new(name, "AREA"); L.energy = e; L.size = 4
    o = bpy.data.objects.new(name, L); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 1.4)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
cam = bpy.data.cameras.new("c"); cam.lens = 70
co = bpy.data.objects.new("c", cam); sc.collection.objects.link(co); sc.camera = co
for tag, ang in [("front", 0), ("three", 0.6), ("side", 1.5708)]:
    d = 11
    co.location = (math.sin(ang) * -d * -1 * 0 + math.sin(ang) * d, -math.cos(ang) * d, 1.55)
    co.rotation_euler = (Vector((0, 0, 1.45)) - co.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = f"{OUT}_{tag}.png"
    bpy.ops.render.render(write_still=True)
print("RENDERED")
