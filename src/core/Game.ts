namespace core {
	export class Game {
		private _states: core.Dict<State>;
		private _switching: boolean;
		private _nextState: string;
		private _currentState: string;

		constructor() {
			this._states = new core.Dict<State>();
			this._currentState = "";
			this._nextState = "";
			this._switching = false;
		}

		registerState(name: string): State {
			if (!this._states.containsKey(name)) {
				let s = new State();
				this._states[name] = s;
				return s;
			}
			return this._states[name];
		}

		setState(name: string): void {
			if (this._nextState != name) {
				this._switching = true;
				this._nextState = name;
			}
		}

		onStart(): void {
			
		}

		onRender(renderer: gfx.Renderer): void {
			if (!this._switching && this._currentState.length > 0) {
				let c: State = this._states[this._currentState];
				c.onRender(renderer);
			}
		}

		onUpdate(dt: number): void {
			if (this._switching && this._nextState.length > 0) {
				this._currentState = this._nextState;
				let c: State = this._states[this._currentState];
				XD.currentState = c;
				c.onStart();
				this._switching = false;
			} else {
				if (this._currentState.length > 0) {
					let c: State = this._states[this._currentState];
					c.onUpdate(dt);
				}
			}
		}
	}
}