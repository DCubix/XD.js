namespace math {
	export class Rect {
		x: number;
		y: number;
		w: number;
		h: number;

		constructor(x: number, y: number, w: number, h: number) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
		}

		intersects(b: Rect): boolean {
			return this.x < b.x + b.w &&
					this.x + this.w > b.x &&
					this.y < b.y + b.h &&
					this.y + this.h > b.y;
		}

		inflate(ifx: number, ify: number): void {
			this.x -= ifx;
			this.y -= ify;
			this.w += ifx * 2;
			this.h += ify * 2;
		}

		contains(p: Vector2): boolean {
			return this.intersects(new Rect(p.x, p.y, 1, 1));
		}

		intersectsSide(b: Rect): Vector2 {
			let AcenterX: number = this.w / 2 + this.x;
			let AcenterY: number = this.h / 2 + this.y;
			let BcenterX: number = b.w / 2 + b.x;
			let BcenterY: number = b.h / 2 + b.y;
			let rw: number = 0.5 * (this.w + b.w);
			let rh: number = 0.5 * (this.h + b.h);
			let dx: number = AcenterX - BcenterX;
			let dy: number = AcenterY - BcenterY;
			if (Math.abs(dx) <= rw && Math.abs(dy) <= rh) {
				let wy: number = rw * dy;
				let hx: number = rw * dx;
				if (wy > hx) {
					if (wy > -hx) {
						return new Vector2(0, -1);
					} else {
						return new Vector2(-1, 0);
					}
				} else if (wy > -hx) {
					return new Vector2(1, 0);
				} else {
					return new Vector2(0, 1);
				}
			}
			return new Vector2(0);
		}

		getIntersection(r: Rect): Rect {
			let tx1: number = this.x;
			let ty1: number = this.y;
			let rx1: number = r.x;
			let ry1: number = r.y;
			let tx2: number = tx1;
			tx2 += this.w;
			let ty2: number = ty1;
			ty2 += this.h;
			let rx2: number = rx1;
			rx2 += r.w;
			let ry2: number = ry1;
			ry2 += r.h;
			if (tx1 < rx1) {
				tx1 = rx1;
			}
			if (ty1 < ry1) {
				ty1 = ry1;
			}
			if (tx2 > rx2) {
				tx2 = rx2;
			}
			if (ty2 > ry2) {
				ty2 = ry2;
			}
			tx2 -= tx1;
			ty2 -= ty1;
			if (tx2 < Number.MIN_VALUE) {
				tx2 = Number.MIN_VALUE;
			}
			if (ty2 < Number.MIN_VALUE) {
				ty2 = Number.MIN_VALUE;
			}
			return new Rect(tx1, ty1, tx2, ty2);
		}
	}
}