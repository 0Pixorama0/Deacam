# Technician model (Blender)

`build_technician.py` builds the site's technician procedurally in Blender and exports
`public/models/technician.glb` (skinned body + rigid face, hat, vest and gear parts, bones
named to match `src/components/stage/technician.ts`).

```
blender -b -P tools/blender/build_technician.py -- public/models/technician.glb
blender -b -P tools/blender/render_preview.py -- public/models/technician.glb /abs/path/prev
```

Tested with Blender 4.5 LTS (free, blender.org). The site drives the bones from its own rig at runtime.
