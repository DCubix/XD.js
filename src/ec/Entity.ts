namespace ec {
	export class Entity {
		position: math.Vector3;
		rotation: number;
		scale: math.Vector2;

		tag: string;

		private _components: Array<Component>;
		private _state: core.State;

		constructor(state: core.State) {
			this.reset(state);
		}

		get state(): core.State {
			return this._state;
		}

		get components(): Array<Component> {
			return this._components;
		}

		reset(state: core.State, model: Entity = null): void {
			if (model) {
				this.position = new math.Vector3(model.position.x, model.position.y, model.position.z);
				this.rotation = model.rotation;
				this.scale = new math.Vector2(model.scale.x, model.scale.y);
				this.tag = model.tag;
				for (let comp of model._components) {
					this.add(comp.clone());
				}
				this._state = state;
			} else {
				this.position = new math.Vector3();
				this.rotation = 0;
				this.scale = new math.Vector2(1.0, 1.0);
				this.tag = "";
				this._components = new Array();
				this._state = state;
			}
		}

		destroy(timeout: number): void {
			this._state.destroy(this, timeout);
		}

		add(comp: Component): Entity {
			comp.owner = this;
			this._components.push(comp);
			return this;
		}

		has<T extends Component>(c: { new (): T; }): boolean {
			return this.get(c) != null;
		}

		get<T extends Component>(c: { new (): T; }): T {
			for (let comp of this._components) {
				if (comp instanceof c) {
					return comp as T;
				}
			}
			return null;
		}

		onStart(): void {
			for (let comp of this._components) {
				if (!comp.started) {
					comp.onStart();
					comp.started = true;
				}
			}
		}

		onRender(): void {
			for (let comp of this._components) {
				comp.onRender();
			}
		}

		onUpdate(dt: number): void {
			for (let comp of this._components) {
				if (!comp.started) {
					comp.onStart();
					comp.started = true;
				}
				comp.onUpdate(dt);
			}
		}

		clone(): Entity {
			let cpy = new Entity(this._state);
			for (let comp of this._components) {
				cpy.add(comp.clone());
			}
			cpy.position = new math.Vector3(this.position.x, this.position.y, this.position.z);
			cpy.rotation = this.rotation;
			cpy.scale = new math.Vector2(this.scale.x, this.scale.y);
			cpy.tag = this.tag;
			return cpy;
		}

	}
}