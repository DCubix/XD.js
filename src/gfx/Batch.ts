namespace gfx {
	export class Batch {
		constructor(public offset: number,
					public vertexCount: number,
					public texture: Texture,
					public primitive: PrimitiveType,
					public blendMode: BlendMode,
					public z: number) {}
	}
}