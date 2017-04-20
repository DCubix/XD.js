namespace core {
	export const EOF = "\0";

	export class StringReader {
		readonly length: number;
		private _data: string;
		private _pos: number;

		constructor(data: string) {
			this._data = data;
			this.length = data != null ? data.length : 0;
			this._pos = 0;
		}

		peek(): string {
			if (this._pos == this.length) { return EOF; }
			return this._data.charAt(this._pos + 1);
		}

		read(): string {
			if (this._pos == this.length) { return EOF; }
			return this._data.charAt(this._pos++);
		}
	}
}