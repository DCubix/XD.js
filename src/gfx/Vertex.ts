namespace gfx {
	export class Vertex {
		position: math.Vector3;
		uv: math.Vector2;
		color: Color;

		static readonly SIZE: number = 9;
		static readonly SIZE_BYTES: number = Vertex.SIZE * 4;

		constructor(position: math.Vector3=null, uv: math.Vector2=null, color: Color=null) {
			this.position = position;
			this.uv = uv;
			this.color = color;
		}
	}
}