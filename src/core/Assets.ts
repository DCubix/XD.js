namespace core {
	export enum AssetType {
		TEXTURE,
		AUDIO
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
				let asset;
				let that = this;
				switch (type) {
					case AssetType.TEXTURE: {
						asset = new Image();
						asset.onload = function () {
							that._success++;
							// TODO: Gen Texture
							if (that.finished) {
								onload();
							}
						};
					} break;
					case AssetType.AUDIO: {
						asset = new Audio();
						asset.onloadeddata = function () {
							that._success++;
							if (that.finished) {
								onload();
							}
						};
					} break;
				}
				asset.onerror = function () {
					that._error++;
					if (that.finished) {
						onload();
					}
				};
				asset.src = path;
				this._cache[path] = asset;
			}
		}

	}
}