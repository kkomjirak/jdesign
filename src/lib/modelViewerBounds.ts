import * as THREE from "three";

/** Frame visible product geometry, not fully transparent CAD helper parts. */
export function getRenderableModelBounds(model: THREE.Object3D): THREE.Box3 {
  const bounds = new THREE.Box3();
  model.updateWorldMatrix(true, true);
  model.traverseVisible((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    if (!materials.some((material) => material.visible && (!material.transparent || material.opacity > 0))) return;
    // GLTFLoader splits primitives into meshes. Use each mesh's local geometry
    // rather than setFromObject(), which would also include hidden children.
    if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
    if (object.geometry.boundingBox) {
      bounds.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
    }
  });
  return bounds;
}
