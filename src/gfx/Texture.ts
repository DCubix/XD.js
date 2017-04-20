namespace gfx {
	export enum TextureType {
		RGB,
		RGBA,
		LUMINANCE
	}

	export class Texture {
		private _width: number;
		private _height: number;
		private _type: TextureType;
		private _gltex: WebGLTexture;

		constructor() {
			this._width = 0;
			this._height = 0;
			this._gltex = null;
		}

		get gl(): WebGLTexture {
			return this._gltex;
		}

		get width(): number {
			return this._width;
		}

		get height(): number {
			return this._height;
		}

		setFilter(min: number, mag: number): void {
			XD.GL.texParameteri(XD.GL.TEXTURE_2D, XD.GL.TEXTURE_MIN_FILTER, min);
			XD.GL.texParameteri(XD.GL.TEXTURE_2D, XD.GL.TEXTURE_MAG_FILTER, mag);
		}

		setWrap(s: number, t: number): void {
			XD.GL.texParameteri(XD.GL.TEXTURE_2D, XD.GL.TEXTURE_WRAP_S, s);
			XD.GL.texParameteri(XD.GL.TEXTURE_2D, XD.GL.TEXTURE_WRAP_T, t);
		}

		setToEmpty(width: number, height: number, type: TextureType): void {
			this._width = width;
			this._height = height;
			this._type = type;

			this._gltex = XD.GL.createTexture();
			this.bind();
			this.setFilter(XD.GL.LINEAR, XD.GL.LINEAR);
			this.setWrap(XD.GL.CLAMP_TO_EDGE, XD.GL.CLAMP_TO_EDGE);

			switch (this._type) {
				case TextureType.RGB:
					XD.GL.texImage2D(XD.GL.TEXTURE_2D, 0, XD.GL.RGB, this._width, this._height, 0, XD.GL.RGB, XD.GL.UNSIGNED_BYTE, null);
					break;
				case TextureType.RGBA:
					XD.GL.texImage2D(XD.GL.TEXTURE_2D, 0, XD.GL.RGBA, this._width, this._height, 0, XD.GL.RGBA, XD.GL.UNSIGNED_BYTE, null);
					break;
				case TextureType.LUMINANCE:
					XD.GL.texImage2D(XD.GL.TEXTURE_2D, 0, XD.GL.LUMINANCE, this._width, this._height, 0, XD.GL.LUMINANCE, XD.GL.UNSIGNED_BYTE, null);
					break;
			}
			this.unbind();
		}

		setToImage(img: HTMLImageElement): void {
			this._width = img.width;
			this._height = img.height;
			this._type = TextureType.RGBA;

			this._gltex = XD.GL.createTexture();
			this.bind();
			this.setFilter(XD.GL.NEAREST, XD.GL.NEAREST);

			if (!Texture.isPO2(img.width) || !Texture.isPO2(img.height)) {
				this.setWrap(XD.GL.CLAMP_TO_EDGE, XD.GL.CLAMP_TO_EDGE);
			} else {
				this.setWrap(XD.GL.REPEAT, XD.GL.REPEAT);
			}

			XD.GL.texImage2D(XD.GL.TEXTURE_2D, 0, XD.GL.RGBA, XD.GL.RGBA, XD.GL.UNSIGNED_BYTE, img);
			this.unbind();
		}

		bind(slot: number | null = null): void {
			if (slot != null) {
				XD.GL.activeTexture(XD.GL.TEXTURE0 + slot);
			}
			XD.GL.bindTexture(XD.GL.TEXTURE_2D, this._gltex);
		}

		unbind(): void {
			XD.GL.bindTexture(XD.GL.TEXTURE_2D, null);
		}

		generateMipMaps(): void {
			XD.GL.generateMipmap(XD.GL.TEXTURE_2D);
		}

		private static isPO2(x: number): boolean {
			return (x != 0) && ((x & (x - 1)) == 0);
		}
	}
}