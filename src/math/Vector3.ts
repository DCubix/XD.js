namespace math {
	export class Vector3 {
		x: number;
		y: number;
		z: number;

		constructor(x: number = 0, y: number = 0, z: number = 0) {
			this.x = x;
			this.y = y;
			this.z = z;
		}

		dot(b: Vector3): number {
			return this.x * b.x + this.y * b.y + this.z * b.z;
		}

		cross(b: Vector3): Vector3 {
			return new Vector3(
				this.y * b.z - this.z * b.y,
				this.z * b.x - this.x * b.z,
				this.x * b.y - this.y * b.x
			);
		}

		get lengthSqr(): number {
			return this.dot(this);
		}

		get length(): number {
			return Math.sqrt(this.lengthSqr);
		}

		add(b: Vector3 | number): Vector3 {
			let v: Vector3;
			if (b instanceof Vector3) {
				v = b;
			} else {
				v = new Vector3(b, b, b);
			}
			return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
		}

		sub(b: Vector3 | number): Vector3 {
			let v: Vector3;
			if (b instanceof Vector3) {
				v = b;
			} else {
				v = new Vector3(b, b, b);
			}
			return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
		}

		mul(b: Vector3 | number): Vector3 {
			let v: Vector3;
			if (b instanceof Vector3) {
				v = b;
			} else {
				v = new Vector3(b, b, b);
			}
			return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
		}

		div(b: Vector3 | number): Vector3 {
			let v: Vector3;
			if (b instanceof Vector3) {
				v = b;
			} else {
				v = new Vector3(b, b);
			}
			return new Vector3(this.x / v.x, this.y / v.y, this.z / v.z);
		}

	}
}