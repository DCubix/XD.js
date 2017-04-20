namespace gfx {
	export class Renderer {
		private _vbo: WebGLBuffer;
		private _shapes: Array<Shape>;
		private _batches: Array<Batch>;
		private _prevVBOSize: number;

		private _projection: math.Matrix4;
		private _view: math.Matrix4;
		private _screenWidth: number;
		private _screenHeight: number;

		private _shader: ShaderProgram;

		private _state: RendererState;

		constructor(width: number, height: number) {
			this._state = new RendererState();

			this._vbo = XD.GL.createBuffer();
			this._prevVBOSize = 0;

			this._shapes = new Array();
			this._batches = new Array();

			let vs = `
			precision highp float;
			attribute vec3 v_position;
			attribute vec2 v_uv;
			attribute vec4 v_color;
			uniform mat4 view;
			uniform mat4 projection;
			varying vec2 vs_uv;
			varying vec4 vs_color;
			void main() {
				gl_Position = projection * view * vec4(v_position, 1.0);
				vs_uv = v_uv;
				vs_color = v_color;
			}
			`;
			let fs = `
			precision mediump float;
			varying vec2 vs_uv;
			varying vec4 vs_color;
			uniform sampler2D tex0;
			uniform float hasTex0;
			void main() {
				if (hasTex0 > 0.0) {
					gl_FragColor = texture2D(tex0, vs_uv) * vs_color;
				} else {
					gl_FragColor = vs_color;
				}
			}
			`;
			this._shader = new ShaderProgram();
			this._shader.addShader(vs, ShaderType.VERTEX);
			this._shader.addShader(fs, ShaderType.FRAGMENT);
			this._shader.link();

			this._screenWidth = width;
			this._screenHeight = height;
			this._projection = new math.Matrix4().ortho2D(width, height);
			this._view = new math.Matrix4().setIdentity();

			XD.GL.disable(XD.GL.DEPTH_TEST);
			XD.GL.disable(XD.GL.CULL_FACE);
			XD.GL.enable(XD.GL.BLEND);
			XD.GL.blendFunc(XD.GL.SRC_ALPHA, XD.GL.ONE_MINUS_SRC_ALPHA);

			XD.GL.viewport(0, 0, width, height);

			// TODO: PostFX
		}

		get screenWidth(): number {
			return this._screenWidth;
		}

		get screenHeight(): number {
			return this._screenHeight;
		}

		get viewMatrix(): math.Matrix4 {
			return this._view;
		}

		set viewMatrix(view: math.Matrix4) {
			this._view = view;
		}

		resize(width: number, height: number): void {
			this._screenWidth = width;
			this._screenHeight = height;
			this._projection = new math.Matrix4().ortho2D(width, height);
			XD.GL.viewport(0, 0, width, height);

			// TODO: PostFX
		}

		unproject(screen: math.Vector3, vx: number, vy: number, vw: number, vh: number): math.Vector3 {
			let finalMat = (this._view.mul(this._projection)).inverse();
			let x = screen.x, y = screen.y;
			x = x - vx;
			y = this._screenHeight - y - 1;
			y = y - vy;
			screen.x = (2 * x) / vw - 1;
			screen.y = (2 * y) / vh - 1;
			screen.z = 2 * screen.z - 1;
			let out = finalMat.mulVec4(new math.Vector4(screen.x, screen.y, screen.z, 1));
			if (out.w == 0) {
				return;
			}
			out.x /= out.w;
			out.y /= out.w;
			out.z /= out.w;

			return new math.Vector3(out.x, out.y, out.z);
		}

		drawSprite(texture: Texture) {
			if (!texture) {
				return;
			}

			let state = this._state;
			let z = state.position.z;
			let dst = new math.Rect(
				state.position.x,
				state.position.y,
				state.scale.x * texture.width,
				state.scale.y * texture.height
			);
			let uv = state.uv;
			let origin = state.origin;
			let color = state.color;
			let rotation = state.rotation;

			let width = dst.w * uv.w;
			let height = dst.h * uv.h;

			let cx = origin.x * width;
			let cy = origin.y * height;
			
			let tl = new math.Vector2(-cx, -cy);
			let tr = new math.Vector2(width - cx, -cy);
			let br = new math.Vector2(width - cx, height - cy);
			let bl = new math.Vector2(-cx, height - cy);

			let pos = new math.Vector2(dst.x, dst.y);
			let tlr = Renderer.rotatePoint(tl, rotation).add(pos);
			let trr = Renderer.rotatePoint(tr, rotation).add(pos);
			let brr = Renderer.rotatePoint(br, rotation).add(pos);
			let blr = Renderer.rotatePoint(bl, rotation).add(pos);

			let u1 = uv.x;
			let v1 = uv.y;
			let u2 = uv.x + uv.w;
			let v2 = uv.y + uv.h;

			let shp = new Shape();
			let TL = new Vertex();
			TL.position = new math.Vector3(tlr.x, tlr.y, z);
			TL.uv = new math.Vector2(u1, v1);
			TL.color = color;

			let TR = new Vertex();
			TR.position = new math.Vector3(trr.x, trr.y, z);
			TR.uv = new math.Vector2(u2, v1);
			TR.color = color;

			let BR = new Vertex();
			BR.position = new math.Vector3(brr.x, brr.y, z);
			BR.uv = new math.Vector2(u2, v2);
			BR.color = color;

			let BL = new Vertex();
			BL.position = new math.Vector3(blr.x, blr.y, z);
			BL.uv = new math.Vector2(u1, v2);
			BL.color = color;
			
			shp.vertices.push(TL);
			shp.vertices.push(TR);
			shp.vertices.push(BR);
			shp.vertices.push(BR);
			shp.vertices.push(BL);
			shp.vertices.push(TL);
			
			shp.texture = texture;
			shp.primitive = PrimitiveType.TRIANGLES;
			
			shp.blendMode = state.blendMode;
			
			this.submit(shp);
		}

		submit(shape: Shape): void {
			if (shape) {
				this._shapes.push(shape);
			}
		}

		set clearColor(color: Color) {
			XD.GL.clearColor(color.r, color.g, color.b, color.a);
		}

		clear(): void {
			XD.GL.clear(XD.GL.COLOR_BUFFER_BIT);
		}

		begin(): void {
			this._shapes.length = 0;
			this._batches.length = 0;
		}

		end(): void {
			this.updateBuffer();
		}

		render(): void {
			this.renderGeometry(this._shader);
		}

		renderGeometry(shader: ShaderProgram): void {
			shader.bind();
			shader.setMatrix4("projection", this._projection);
			shader.setMatrix4("view", this._view);
			shader.setInt("tex0", 0);

			this._batches.sort((a: Batch, b: Batch): number => {
				return a.z < b.z ? -1 : 1; 
			});

			let pos = shader.getAttributeLocation("v_position");
			let uv = shader.getAttributeLocation("v_uv");
			let color = shader.getAttributeLocation("v_color");

			XD.GL.bindBuffer(XD.GL.ARRAY_BUFFER, this._vbo);
			XD.GL.enableVertexAttribArray(pos);
			XD.GL.vertexAttribPointer(pos, 3, XD.GL.FLOAT, false, Vertex.SIZE_BYTES, 0);
			XD.GL.enableVertexAttribArray(uv);
			XD.GL.vertexAttribPointer(uv, 2, XD.GL.FLOAT, false, Vertex.SIZE_BYTES, 12);
			XD.GL.enableVertexAttribArray(color);
			XD.GL.vertexAttribPointer(color, 4, XD.GL.FLOAT, true, Vertex.SIZE_BYTES, 20);

			for (let b of this._batches) {
				if (b.texture) {
					b.texture.bind(0);
					shader.setFloat("hasTex0", 1.0);
				} else {
					shader.setFloat("hasTex0", 0.0);
				}

				switch (b.blendMode) {
					case BlendMode.NORMAL: XD.GL.blendFunc(XD.GL.SRC_ALPHA, XD.GL.ONE_MINUS_SRC_ALPHA); break;
					case BlendMode.ADD: XD.GL.blendFunc(XD.GL.SRC_ALPHA, XD.GL.ONE); break;
					case BlendMode.SCREEN: XD.GL.blendFunc(XD.GL.SRC_ALPHA, XD.GL.ONE_MINUS_SRC_COLOR); break;
				}
				let prim = -1
				switch (b.primitive) {
					case PrimitiveType.TRIANGLE_FAN: prim = XD.GL.TRIANGLE_FAN; break;
					case PrimitiveType.TRIANGLE_STRIP: prim = XD.GL.TRIANGLE_STRIP; break;
					case PrimitiveType.TRIANGLES: prim = XD.GL.TRIANGLES; break;
				}

				XD.GL.drawArrays(prim, b.offset, b.vertexCount);

				if (b.texture) {
					b.texture.unbind();
				}
			}

			XD.GL.bindBuffer(XD.GL.ARRAY_BUFFER, null);
			shader.unbind();
		}

		save(): RendererState {
			let tmp = this._state.copy();
			this._state = new RendererState();
			return tmp;
		}

		setPosition(position: math.Vector3): void {
			this._state.position = position;
		}

		setScale(scale: math.Vector2): void {
			this._state.scale = scale;
		}

		setOrigin(origin: math.Vector2): void {
			this._state.origin = origin;
		}

		setUV(uv: math.Rect): void {
			this._state.uv = uv;
		}

		setColor(color: Color): void {
			this._state.color = color;
		}

		setRotation(rotation: number): void {
			this._state.rotation = rotation;
		}

		setBlendMode(blendMode: BlendMode): void {
			this._state.blendMode = blendMode;
		}

		restore(state: RendererState): void {
			this._state = state;
		}

		private static rotatePoint(p: math.Vector2, rad: number): math.Vector2 {
			let c = Math.cos(rad);
			let s = Math.sin(rad);
			return new math.Vector2(c * p.x - s * p.y, s * p.x + c * p.y);
		}

		private updateBuffer(): void {
			if (this._shapes.length == 0) {
				return;
			}

			this._shapes.sort((a: Shape, b: Shape): number => {
				if (a.texture == null || b.texture == null) { return 0; }
				return a.texture != a.texture ? -1 : 1;
			});

			let vertices: Array<Vertex> = new Array();

			let first: Shape = this._shapes[0];
			vertices = vertices.concat(first.vertices);
			this._batches.push(new Batch(
				0,
				first.vertices.length,
				first.texture,
				first.primitive,
				first.blendMode,
				first.vertices[0].position.z
			));

			let offset = 0;
			for (var i = 1; i < this._shapes.length; i++) {
				let a = this._shapes[i];
				let b = this._shapes[i - 1];
				let za = a.vertices.length == 0 ? 0 : a.vertices[0].position.z;
				let zb = b.vertices.length == 0 ? 0 : b.vertices[0].position.z;
				if (a.texture != b.texture ||
					za != zb ||
					a.primitive != b.primitive ||
					a.blendMode != b.blendMode)
				{
					offset += this._batches[this._batches.length-1].vertexCount;
					this._batches.push(new Batch(
						offset,
						a.vertices.length,
						a.texture,
						a.primitive,
						a.blendMode,
						za
					));
				} else {
					this._batches[this._batches.length-1].vertexCount += a.vertices.length;
				}

				vertices = vertices.concat(a.vertices);
			}

			let vsize = Vertex.SIZE;
			let vdata = new Float32Array(vertices.length * vsize);
			let k = 0;
			for (let v of vertices) {
				vdata[k + 0] = v.position.x;
				vdata[k + 1] = v.position.y;
				vdata[k + 2] = v.position.z;
				vdata[k + 3] = v.uv.x;
				vdata[k + 4] = v.uv.y;
				vdata[k + 5] = v.color.r;
				vdata[k + 6] = v.color.g;
				vdata[k + 7] = v.color.b;
				vdata[k + 8] = v.color.a;
				k += vsize;
			}
			
			XD.GL.bindBuffer(XD.GL.ARRAY_BUFFER, this._vbo);
			let vboSize = vertices.length * vsize;
			if (vboSize > this._prevVBOSize) {
				XD.GL.bufferData(XD.GL.ARRAY_BUFFER, new Float32Array(vboSize), XD.GL.DYNAMIC_DRAW);
				this._prevVBOSize = vboSize;
			}
			XD.GL.bufferSubData(XD.GL.ARRAY_BUFFER, 0, vdata);

			XD.GL.bindBuffer(XD.GL.ARRAY_BUFFER, null);
		}
	}
}