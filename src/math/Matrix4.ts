namespace math {
	export class Matrix4 {
		m: Float32Array = new Float32Array(16);

		constructor(m: number[] = null) {
			if (!m) {
				this.setIdentity();
			} else {
				for (var i = 0; i < 16; i++) {
					this.m.set(i, m[i]);
				}
			}
		}

		determinant(): number {
			let a00 = this.m[0], a01 = this.m[1], a02 = this.m[2], a03 = this.m[3],
				a10 = this.m[4], a11 = this.m[5], a12 = this.m[6], a13 = this.m[7],
				a20 = this.m[8], a21 = this.m[9], a22 = this.m[10], a23 = this.m[11],
				a30 = this.m[12], a31 = this.m[13], a32 = this.m[14], a33 = this.m[15];

			let det00 = a00 * a11 - a01 * a10,
				det01 = a00 * a12 - a02 * a10,
				det02 = a00 * a13 - a03 * a10,
				det03 = a01 * a12 - a02 * a11,
				det04 = a01 * a13 - a03 * a11,
				det05 = a02 * a13 - a03 * a12,
				det06 = a20 * a31 - a21 * a30,
				det07 = a20 * a32 - a22 * a30,
				det08 = a20 * a33 - a23 * a30,
				det09 = a21 * a32 - a22 * a31,
				det10 = a21 * a33 - a23 * a31,
				det11 = a22 * a33 - a23 * a32;

			return (det00 * det11 - det01 * det10 + det02 * det09 + det03 * det08 - det04 * det07 + det05 * det06);
		}

		transpose(): Matrix4 {
			let temp01 = this.m[1], temp02 = this.m[2],
				temp03 = this.m[3], temp12 = this.m[6],
				temp13 = this.m[7], temp23 = this.m[11];

			this.m[1] = this.m[4];
			this.m[2] = this.m[8];
			this.m[3] = this.m[12];
			this.m[4] = temp01;
			this.m[6] = this.m[9];
			this.m[7] = this.m[13];
			this.m[8] = temp02;
			this.m[9] = temp12;
			this.m[11] = this.m[14];
			this.m[12] = temp03;
			this.m[13] = temp13;
			this.m[14] = temp23;

			return this;
		}

		inverse(): Matrix4 {
			let a00 = this.m[0], a01 = this.m[1], a02 = this.m[2], a03 = this.m[3],
				a10 = this.m[4], a11 = this.m[5], a12 = this.m[6], a13 = this.m[7],
				a20 = this.m[8], a21 = this.m[9], a22 = this.m[10], a23 = this.m[11],
				a30 = this.m[12], a31 = this.m[13], a32 = this.m[14], a33 = this.m[15];

			let det00 = a00 * a11 - a01 * a10,
				det01 = a00 * a12 - a02 * a10,
				det02 = a00 * a13 - a03 * a10,
				det03 = a01 * a12 - a02 * a11,
				det04 = a01 * a13 - a03 * a11,
				det05 = a02 * a13 - a03 * a12,
				det06 = a20 * a31 - a21 * a30,
				det07 = a20 * a32 - a22 * a30,
				det08 = a20 * a33 - a23 * a30,
				det09 = a21 * a32 - a22 * a31,
				det10 = a21 * a33 - a23 * a31,
				det11 = a22 * a33 - a23 * a32;

			let det = (det00 * det11 - det01 * det10 + det02 * det09 + det03 * det08 - det04 * det07 + det05 * det06);

			if (!det)
				return null;

			det = 1.0 / det;

			this.m[0] = (a11 * det11 - a12 * det10 + a13 * det09) * det;
			this.m[1] = (-a01 * det11 + a02 * det10 - a03 * det09) * det;
			this.m[2] = (a31 * det05 - a32 * det04 + a33 * det03) * det;
			this.m[3] = (-a21 * det05 + a22 * det04 - a23 * det03) * det;
			this.m[4] = (-a10 * det11 + a12 * det08 - a13 * det07) * det;
			this.m[5] = (a00 * det11 - a02 * det08 + a03 * det07) * det;
			this.m[6] = (-a30 * det05 + a32 * det02 - a33 * det01) * det;
			this.m[7] = (a20 * det05 - a22 * det02 + a23 * det01) * det;
			this.m[8] = (a10 * det10 - a11 * det08 + a13 * det06) * det;
			this.m[9] = (-a00 * det10 + a01 * det08 - a03 * det06) * det;
			this.m[10] = (a30 * det04 - a31 * det02 + a33 * det00) * det;
			this.m[11] = (-a20 * det04 + a21 * det02 - a23 * det00) * det;
			this.m[12] = (-a10 * det09 + a11 * det07 - a12 * det06) * det;
			this.m[13] = (a00 * det09 - a01 * det07 + a02 * det06) * det;
			this.m[14] = (-a30 * det03 + a31 * det01 - a32 * det00) * det;
			this.m[15] = (a20 * det03 - a21 * det01 + a22 * det00) * det;

			return this;
		}

		mul(r: Matrix4): Matrix4 {
			let res = new Matrix4();
			for (var i = 0; i < 4; i++) {
				for (var j = 0; j < 4; j++) {
					res.set(j, i, this.get(0, i) * r.get(j, 0)
						+ this.get(1, i) * r.get(j, 1)
						+ this.get(2, i) * r.get(j, 2)
						+ this.get(3, i) * r.get(j, 3));
				}
			}
			return res;
		}

		mulVec3(v: Vector3): Vector3 {
			var x = v.x,
				y = v.y,
				z = v.z;

			return new Vector3(
				this.m[0] * x + this.m[4] * y + this.m[8] * z + this.m[12],
				this.m[1] * x + this.m[5] * y + this.m[9] * z + this.m[13],
				this.m[2] * x + this.m[6] * y + this.m[10] * z + this.m[14]
			);
		}

		mulVec4(v: Vector4, dest: Vector4 = null): Vector4 {
			if (!dest) dest = new Vector4();

			var x = v.x,
				y = v.y,
				z = v.z,
				w = v.w;

			dest.x = this.m[0] * x + this.m[4] * y + this.m[8] * z + this.m[12] * w;
			dest.y = this.m[1] * x + this.m[5] * y + this.m[9] * z + this.m[13] * w;
			dest.z = this.m[2] * x + this.m[6] * y + this.m[10] * z + this.m[14] * w;
			dest.w = this.m[3] * x + this.m[7] * y + this.m[11] * z + this.m[15] * w;

			return dest;
		}

		get(col: number, row: number): number {
			return this.m[row * 4 + col];
		}

		set(row: number, col: number, value: number) {
			this.m[row * 4 + col] = value;
		}

		setIdentity(): Matrix4 {
			this.set(0, 0, 1);
			this.set(1, 1, 1);
			this.set(2, 2, 1);
			this.set(3, 3, 1);
			return this;
		}

		perspective(fov: number, aspect: number, n: number, f: number): Matrix4 {
			var tan = Math.tan(fov / 2);
			var A = -(f + n) / (f - n);
			var B = (-2 * f * n) / (f - n);

			this.set(0, 0, 0.5 / tan);
			this.set(1, 1, 0.5 * aspect / tan);
			this.set(2, 2, A);
			this.set(2, 3, B);
			this.set(3, 2, -1);
			this.set(3, 3, 0);

			return this;
		}

		ortho(left: number, right: number, bottom: number, top: number, n: number, f: number): Matrix4 {
			this.set(0, 0, 2 / (right - left));
			this.set(1, 1, 2 / (top - bottom));
			this.set(2, 2, -2 / (f - n));
			this.set(3, 0, -((right + left) / (right - left)));
			this.set(3, 1, -((top + bottom) / (top - bottom)));
			this.set(3, 2, -((f + n) / (f - n)));

			return this;
		}

		ortho2D(width: number, height: number): Matrix4 {
			return this.ortho(0, width, height, 0, -1, 1);
		}

		translation(t: Vector3): Matrix4 {
			this.set(3, 0, t.x);
			this.set(3, 1, t.y);
			this.set(3, 2, t.z);
			return this;
		}

		scaling(s: Vector3): Matrix4 {
			this.set(0, 0, s.x);
			this.set(1, 1, s.y);
			this.set(2, 2, s.z);
			return this;
		}

		rotation(angle: number, axis: Vector3): Matrix4 {
			var x = axis.x,
				y = axis.y,
				z = axis.z;

			var length = Math.sqrt(x * x + y * y + z * z);

			if (!length)
				return null;

			if (length !== 1) {
				length = 1 / length;
				x *= length;
				y *= length;
				z *= length;
			}

			var s = Math.sin(angle);
			var c = Math.cos(angle);

			var t = 1.0 - c;

			var a00 = this.m[0], a01 = this.m[1], a02 = this.m[2], a03 = this.m[3],
				a10 = this.m[4], a11 = this.m[5], a12 = this.m[6], a13 = this.m[7],
				a20 = this.m[8], a21 = this.m[9], a22 = this.m[10], a23 = this.m[11];

			var b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s,
				b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s,
				b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;

			this.m[0] = a00 * b00 + a10 * b01 + a20 * b02;
			this.m[1] = a01 * b00 + a11 * b01 + a21 * b02;
			this.m[2] = a02 * b00 + a12 * b01 + a22 * b02;
			this.m[3] = a03 * b00 + a13 * b01 + a23 * b02;

			this.m[4] = a00 * b10 + a10 * b11 + a20 * b12;
			this.m[5] = a01 * b10 + a11 * b11 + a21 * b12;
			this.m[6] = a02 * b10 + a12 * b11 + a22 * b12;
			this.m[7] = a03 * b10 + a13 * b11 + a23 * b12;

			this.m[8] = a00 * b20 + a10 * b21 + a20 * b22;
			this.m[9] = a01 * b20 + a11 * b21 + a21 * b22;
			this.m[10] = a02 * b20 + a12 * b21 + a22 * b22;
			this.m[11] = a03 * b20 + a13 * b21 + a23 * b22;

			return this;
		}

	}
}