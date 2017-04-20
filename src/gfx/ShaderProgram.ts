namespace gfx {
	export enum ShaderType {
		VERTEX = XD.GL.VERTEX_SHADER,
		FRAGMENT = XD.GL.FRAGMENT_SHADER
	}

	function createShader(src: string, type: ShaderType): WebGLShader {
		let s: WebGLShader = XD.GL.createShader(type);
		XD.GL.shaderSource(s, src);
		XD.GL.compileShader(s);
		
		let status = XD.GL.getShaderParameter(s, XD.GL.COMPILE_STATUS);
		if (!status) {
			console.error(XD.GL.getShaderInfoLog(s));
			XD.GL.deleteShader(s);
			return null;
		}
		return s;
	}

	export class ShaderProgram {
		private _uniforms: core.Dict<WebGLUniformLocation>;
		private _attributes: core.Dict<number>;
		private _sources: Array<string>;
		private _program: WebGLProgram;
		private _valid: boolean;

		constructor() {
			this._uniforms = new core.Dict<WebGLUniformLocation>();
			this._attributes = new core.Dict<number>();
			this._sources = new Array();
			this._program = XD.GL.createProgram();
			this._valid = false;
		}

		get valid() {
			return this._valid;
		}

		bind(): void {
			if (this.valid) {
				XD.GL.useProgram(this._program);
			} else {
				console.error("Trying to bind an invalid shader.");
			}
		}

		unbind(): void {
			XD.GL.useProgram(null);
		}

		addShader(src: string, type: ShaderType): void {
			if (src == null) {
				console.error(`The shader source must not be null (${type.toString()}).`);
				return;
			}
			if (src.length == 0) {
				console.error(`The shader source must not be empty (${type.toString()}).`);
				return;
			}

			let shader: WebGLShader = createShader(src, type);
			if (shader) {
				XD.GL.attachShader(this._program, shader);
				this._sources.push(src);
			} else {
				this._valid = false;
			}
		}

		link(): void {
			if (!this._valid) {
				console.error("Could not link an invalid shader.");
				return;
			}

			XD.GL.linkProgram(this._program);

			let status = XD.GL.getProgramParameter(this._program, XD.GL.LINK_STATUS);
			if (!status) {
				console.error(XD.GL.getProgramInfoLog(this._program));
				this._valid = false;
			} else {
				for (let src of this._sources) {
					this.parseUniforms(src);
				}
			}
		}

		getAttributeLocation(name: string): number {
			if (!this._attributes.containsKey(name)) {
				this._attributes[name] = XD.GL.getAttribLocation(this._program, name);
			}
			return this._attributes[name];
		}

		addUniform(name: string): boolean {
			let loc: WebGLUniformLocation = XD.GL.getUniformLocation(this._program, name);
			if (loc) {
				this._uniforms[name] = loc;
				return true;
			}
			return false;
		}

		addUniformArray(name: string, n: number): boolean {
			let ok: boolean = true;
			for (var i = 0; i < n; i++) {
				ok = this.addUniform(`${name}[${i}]`);
			}
			return ok;
		}

		hasUniform(name: string): boolean {
			return this._uniforms.containsKey(name);
		}

		getUniform(name: string): WebGLUniformLocation {
			if (!this.hasUniform(name)) {
				return null;
			}
			return this._uniforms[name];
		}

		private parseUniforms(src: string): void {
			let sr: core.StringReader = new core.StringReader(src);
			let stop: boolean = false;
			let c: string = sr.read();

			while (c != core.EOF) {
				if (stop) { break; }
				if (Chars.isLetterOrDigit(c)) {
					let str = "";
					let found = false;
					while (c != ";" && c != core.EOF) {
						str += c;
						c = sr.read();
						if (str == "uniform") {
							found = true;
						} else if (str == "void") {
							stop = true;
							break;
						}
						str = str.trim();

						if (found) {
							let raw_name: string[] = str.split(" ");
							let rname: string = raw_name[2];
							if (rname.indexOf("[") != -1) {
								let name = rname.substr(0, rname.indexOf("[")-1);
								let countstr = rname.substr(rname.indexOf("[")+1)
													.replace("[", "")
													.replace("]", "");
								let count = Number(countstr);
								if (count == NaN) { count = 0; }
								this.addUniformArray(name, count);
							} else {
								this.addUniform(rname);
							}
						}
					}
				} else if (Chars.isSymbol(c) || Chars.isWhitespace(c)) {
					c = sr.read();
				}
			}
		}
	}
}