namespace math {
	export class Vector2 {
		x: number;
		y: number;

		constructor(x: number = 0, y: number = 0) {
			this.x = x;
			this.y = y;
		}

		dot(b: Vector2): number {
			return this.x * b.x + this.y * b.y;
		}

		get lengthSqr(): number {
			return this.dot(this);
		}

		get length(): number {
			return Math.sqrt(this.lengthSqr);
		}

		add(b: Vector2 | number): Vector2 {
			let v: Vector2;
			if (b instanceof Vector2) {
				v = b;
			} else {
				v = new Vector2(b, b);
			}
			return new Vector2(this.x + v.x, this.y + v.y);
		}

		sub(b: Vector2 | number): Vector2 {
			let v: Vector2;
			if (b instanceof Vector2) {
				v = b;
			} else {
				v = new Vector2(b, b);
			}
			return new Vector2(this.x - v.x, this.y - v.y);
		}

		mul(b: Vector2 | number): Vector2 {
			let v: Vector2;
			if (b instanceof Vector2) {
				v = b;
			} else {
				v = new Vector2(b, b);
			}
			return new Vector2(this.x * v.x, this.y * v.y);
		}

		div(b: Vector2 | number): Vector2 {
			let v: Vector2;
			if (b instanceof Vector2) {
				v = b;
			} else {
				v = new Vector2(b, b);
			}
			return new Vector2(this.x / v.x, this.y / v.y);
		}

	}
}