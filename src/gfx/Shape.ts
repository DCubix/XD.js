namespace gfx {
	export enum PrimitiveType {
		TRIANGLES = 0,
		TRIANGLE_STRIP = 1,
		TRIANGLE_FAN = 2
	}

	export enum BlendMode {
		NORMAL,
		ADD,
		SCREEN
	}

	export class Shape {
		vertices: Array<Vertex> = new Array();
		primitive: PrimitiveType = PrimitiveType.TRIANGLES;
		texture: Texture = null;
		blendMode: BlendMode = BlendMode.NORMAL;
	}
}