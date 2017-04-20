namespace XD {
	export var GL: WebGLRenderingContext;
	export var assets: core.Assets;
	export var engine: Engine;
	export var currentState: core.State;

	export class Engine {
		static readonly MAX_FPS_SAMPLES: number = 24;

		// Timing
		private _frameCap: number;
		private _frameTime: number;
		private _current: number;
		private _accum: number;
		private _last: number;
		private _fpsSamples: Array<number> = new Array(Engine.MAX_FPS_SAMPLES);
		private _fps: number;
		private _frames: number;

		private _game: core.Game;

		// Callbacks
		onpreload: (am: core.Assets) => void;
		onload: (am: core.Assets, ge: Engine) => void;

		constructor(fps: number=60.0) {
			this._frameTime = 1.0 / fps;
			this._frameCap = fps;
			this._game = new core.Game();
			this._accum = 0;
			this._fps = 0;
			this._frames = 0;
		}

		get fps(): number {
			return this._fps;
		}

		start(canvas: HTMLCanvasElement): void {
			XD.GL = canvas.getContext("webgl");
			XD.assets = new core.Assets();
			XD.engine = this;

			if (this.onpreload) {
				this.onpreload(XD.assets);
			}

			let that: Engine = this;
			XD.assets.load(function() {
				that._current = (new Date()).getTime();
				that._last = that._current;
				that._game.onStart();

				if (that.onload) {
					that.onload(XD.assets, that);
				}

				that.mainloop(canvas);
			});
		}

		private mainloop(canvas: HTMLCanvasElement): void {
			this._current = (new Date()).getTime();
			let delta = (this._current - this._last) / 1000.0;

			this._fpsSamples[this._frames % Engine.MAX_FPS_SAMPLES] = 1.0 / Math.max(delta, this._frameTime);
			for (var i = 0; i < Engine.MAX_FPS_SAMPLES; i++) {
				this._fps += this._fpsSamples[i];
			}
			this._fps /= Engine.MAX_FPS_SAMPLES;

			this._last = this._current;
			this._accum += delta;

			if (this._accum >= this._frameTime) {
				this._accum -= this._frameTime;
				this._game.onUpdate(this._frameTime);
			}

			this._game.onRender();
			this._frames++;

			WebUtil.requestAnimationFrame(this.mainloop.bind(this, canvas));
		}

	}
}