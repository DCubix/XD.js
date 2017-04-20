namespace gfx {
	export class RendererState {
		position: math.Vector3 = new math.Vector3(0, 0, 0);
		scale: math.Vector2 = new math.Vector2(1, 1);
		uv: math.Rect = new math.Rect(0, 0, 1, 1);
		origin: math.Vector2 = new math.Vector2(0, 0);
		color: Color = new Color(1, 1, 1);
		rotation: number = 0;
		blendMode: BlendMode = BlendMode.NORMAL;

		copy(): RendererState {
			let cpy = new RendererState();
			cpy.blendMode = this.blendMode;
			cpy.color = new Color(this.color.r, this.color.g, this.color.b, this.color.a);
			cpy.origin = new math.Vector2(this.origin.x, this.origin.y);
			cpy.position = new math.Vector3(this.position.x, this.position.y, this.position.z);
			cpy.rotation = this.rotation;
			cpy.scale = new math.Vector2(this.scale.x, this.scale.y);
			cpy.uv = new math.Rect(this.uv.x, this.uv.y, this.uv.w, this.uv.h);
			return cpy;
		}
	}
}