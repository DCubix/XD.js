namespace core {
	export enum AssetType {
		TEXTURE = 0,
		AUDIO = 1
	}

	export class Assets {
		private _success: number;
		private _error: number;
		private _queue: Array<[string, AssetType]>;
		private _cache: core.Dict<any>;

		constructor() {
			this._cache = new core.Dict<any>();
			this._queue = [];
			this._error = 0;
			this._success = 0;
		}

		get finished(): boolean {
			return this._queue.length == this._error + this._success;
		}

		addAsset(path: string, type: AssetType): void {
			this._queue.push([path, type]);
		}

		getAsset(path: string): any {
			return this._cache[path];
		}

		load(onload: () => void): void {
			if (this._queue.length == 0) { onload(); }
			for (let [path, type] of this._queue) {
				let that = this;
				switch (type) {
					case AssetType.TEXTURE: {
						let img = new Image();
						img.onload = function () {
							that._success++;
							let tex = new gfx.Texture();
							tex.setToImage(img);
							that._cache[path] = tex;
							if (that.finished) {
								onload();
							}
						};
						img.onerror = function () {
							that._error++;
							if (that.finished) {
								onload();
							}
						};
						img.src = path;
					} break;
					case AssetType.AUDIO: {
						let aud = new Audio();
						aud.onloadeddata = function () {
							that._success++;
							that._cache[path] = aud;
							if (that.finished) {
								onload();
							}
						};
						aud.onerror = function () {
							that._error++;
							if (that.finished) {
								onload();
							}
						};
						aud.src = path;
					} break;
				}
			}
		}

	}
}