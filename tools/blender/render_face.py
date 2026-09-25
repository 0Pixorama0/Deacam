import sys, bpy
from mathutils import Vector
a = sys.argv[sys.argv.index("--") + 1 :]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=a[0])
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE_NEXT"
sc.render.resolution_x, sc.render.resolution_y = 700, 700
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.03, 0.03, 0.035, 1)
for name, loc, e in [("key", (-1.5, -3, 4), 250), ("fill", (2, -2.5, 2.8), 90), ("rim", (0, 3, 4), 150)]:
    L = bpy.data.lights.new(name, "AREA"); L.energy = e; L.size = 2
    o = bpy.data.objects.new(name, L); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 2.5)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
cam = bpy.data.cameras.new("c"); cam.lens = 110
co = bpy.data.objects.new("c", cam); sc.collection.objects.link(co); sc.camera = co
for tag, loc in [("f", (0, -3.2, 2.62)), ("q", (1.6, -2.8, 2.62))]:
    co.location = loc
    co.rotation_euler = (Vector((0, 0, 2.58)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = a[1] + "_" + tag + ".png"
    bpy.ops.render.render(write_still=True)
