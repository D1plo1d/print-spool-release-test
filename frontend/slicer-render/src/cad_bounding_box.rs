use crate::renderer::*;

pub struct CadBoundingBox<M: ForwardMaterial> {
    model: InstancedModel<M>,
    aabb: AxisAlignedBoundingBox,
}

impl<M: ForwardMaterial> CadBoundingBox<M> {
    ///
    /// Creates a bounding box object from an axis aligned bounding box.
    ///
    pub fn new_with_material(
        context: &Context,
        aabb: AxisAlignedBoundingBox,
        material: M,
        thickness: f32,
    ) -> ThreeDResult<Self> {
        let max = aabb.max();
        let min = aabb.min();
        let size = aabb.size();
        let transformations = [
            Mat4::from_translation(min) * Mat4::from_nonuniform_scale(size.x, thickness, thickness),
            Mat4::from_translation(vec3(min.x, max.y, max.z))
                * Mat4::from_nonuniform_scale(size.x, thickness, thickness),
            Mat4::from_translation(vec3(min.x, min.y, max.z))
                * Mat4::from_nonuniform_scale(size.x, thickness, thickness),
            Mat4::from_translation(vec3(min.x, max.y, min.z))
                * Mat4::from_nonuniform_scale(size.x, thickness, thickness),
            Mat4::from_translation(min)
                * Mat4::from_angle_z(degrees(90.0))
                * Mat4::from_nonuniform_scale(size.y, thickness, thickness),
            Mat4::from_translation(vec3(max.x, min.y, max.z))
                * Mat4::from_angle_z(degrees(90.0))
                * Mat4::from_nonuniform_scale(size.y, thickness, thickness),
            Mat4::from_translation(vec3(min.x, min.y, max.z))
                * Mat4::from_angle_z(degrees(90.0))
                * Mat4::from_nonuniform_scale(size.y, thickness, thickness),
            Mat4::from_translation(vec3(max.x, min.y, min.z))
                * Mat4::from_angle_z(degrees(90.0))
                * Mat4::from_nonuniform_scale(size.y, thickness, thickness),
            Mat4::from_translation(min)
                * Mat4::from_angle_y(degrees(-90.0))
                * Mat4::from_nonuniform_scale(size.z, thickness, thickness),
            Mat4::from_translation(vec3(max.x, max.y, min.z))
                * Mat4::from_angle_y(degrees(-90.0))
                * Mat4::from_nonuniform_scale(size.z, thickness, thickness),
            Mat4::from_translation(vec3(min.x, max.y, min.z))
                * Mat4::from_angle_y(degrees(-90.0))
                * Mat4::from_nonuniform_scale(size.z, thickness, thickness),
            Mat4::from_translation(vec3(max.x, min.y, min.z))
                * Mat4::from_angle_y(degrees(-90.0))
                * Mat4::from_nonuniform_scale(size.z, thickness, thickness),
        ];
        let model = InstancedModel::new_with_material(
            context,
            &transformations,
            &CPUMesh::cylinder(16),
            material,
        )?;
        Ok(Self { model, aabb })
    }
}

impl<M: ForwardMaterial> Shadable for CadBoundingBox<M> {
    fn render_forward(
        &self,
        material: &dyn ForwardMaterial,
        camera: &Camera,
        lights: &Lights,
    ) -> ThreeDResult<()> {
        self.model.render_forward(material, camera, lights)
    }

    fn render_deferred(
        &self,
        material: &dyn DeferredMaterial,
        camera: &Camera,
        viewport: Viewport,
    ) -> ThreeDResult<()> {
        self.model.render_deferred(material, camera, viewport)
    }
}

impl<M: ForwardMaterial> Geometry for CadBoundingBox<M> {
    fn aabb(&self) -> AxisAlignedBoundingBox {
        self.aabb
    }

    fn transformation(&self) -> Mat4 {
        Mat4::identity()
    }
}

impl<M: ForwardMaterial> Object for CadBoundingBox<M> {
    fn render(&self, camera: &Camera, lights: &Lights) -> ThreeDResult<()> {
        self.model.render(camera, lights)
    }

    fn is_transparent(&self) -> bool {
        false
    }
}
