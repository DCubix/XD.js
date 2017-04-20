namespace math {
	export class Vector4 {
		x: number;
		y: number;
		z: number;
		w: number;

		constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
		}

		dot(b: Vector4): number {
			return this.x * b.x + this.y * b.y + this.z * b.z + this.w * b.w;
		}

		get lengthSqr(): number {
			return this.dot(this);
		}

		get length(): number {
			return Math.sqrt(this.lengthSqr);
		}

		add(b: Vector4 | number): Vector4 {
			let v: Vector4;
			if (b instanceof Vector4) {
				v = b;
			} else {
				v = new Vector4(b, b, b, b);
			}
			return new Vector4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
		}

		sub(b: Vector4 | number): Vector4 {
			let v: Vector4;
			if (b instanceof Vector4) {
				v = b;
			} else {
				v = new Vector4(b, b, b);
			}
			return new Vector4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
		}

		mul(b: Vector4 | number): Vector4 {
			let v: Vector4;
			if (b instanceof Vector4) {
				v = b;
			} else {
				v = new Vector4(b, b, b, b);
			}
			return new Vector4(this.x * v.x, this.y * v.y, this.z * v.z, this.w * v.w);
		}

	}
}