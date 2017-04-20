namespace gfx {
	export class Color {
		r: number;
		g: number;
		b: number;
		a: number;

		constructor(r: number, g: number, b: number, a: number=1) {
			this.r = r;
			this.g = g;
			this.b = b;
			this.a = a;
		}

		fromHex(hex: number): void {
			let a = (hex & 0xFF000000) >> 24;
			let r = (hex & 0x00FF0000) >> 16;
			let g = (hex & 0x0000FF00) >> 8;
			let b = (hex & 0x000000FF);
			this.a = a / 255.0;
			this.r = r / 255.0;
			this.g = g / 255.0;
			this.b = b / 255.0;
		}

		fromHexStr(hex: string): void {
			// #FFFFFFFF 32 bit
			let hex_i = parseInt(hex.replace(/^#/, ''), 24);
			this.fromHex(hex_i);
		}

		hex(): number {
			let a = this.a * 255;
			let r = this.r * 255;
			let g = this.g * 255;
			let b = this.b * 255;
			return ((a & 0xFF) << 24) |
					((r & 0xFF) << 16) |
					((g & 0xFF) << 8) |
					((b & 0xFF));
		}
	}
}