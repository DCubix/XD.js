namespace core {
	class TimedDestructor {
		constructor(public entity: ec.Entity, public time: number) { }
	}

	export class State {
		private _entities: Array<ec.Entity>;
		private _inactive: Array<ec.Entity>;
		private _delete: Array<TimedDestructor>;

		constructor() {
			this._entities = new Array();
			this._inactive = new Array();
			this._delete = new Array();
		}

		create(): ec.Entity {
			let e: ec.Entity = null;
			if (this._inactive.length == 0) {
				e = new ec.Entity(this);
			} else {
				e = this._inactive[0];
				e.reset(this);
				this._inactive.splice(0, 1);
			}
			if (e) {
				this._entities.push(e);
			}
			return e;
		}

		spawn(model: ec.Entity): ec.Entity {
			let e: ec.Entity = null;
			if (this._inactive.length == 0) {
				e = model.clone();
			} else {
				e = this._inactive[0];
				e.reset(this, model);
				this._inactive.splice(0, 1);
			}
			if (e) {
				this._entities.push(e);
			}
			return e;
		}

		destroy(entity: ec.Entity, timeout: number = 0): void {
			for (let d of this._delete) {
				if (d.entity == entity) {
					return;
				}
			}

			if (entity.state != this) {
				return;
			}

			this._delete.push(new TimedDestructor(entity, timeout));
		}

		get<T extends ec.Component>(c: {new(): T}): ec.Entity {
			for (let e of this._entities) {
				for (let comp of e.components) {
					if (comp instanceof c) {
						return e;
					}
				}
			}
			return null;
		}

		onStart(): void {
			for (let e of this._entities) {
				e.onStart();
			}
		}

		onRender(renderer: gfx.Renderer): void {
			for (let e of this._entities) {
				e.onRender(renderer);
			}
		}

		onUpdate(dt: number): void {
			for (let t of this._delete) {
				if (t.time > 0) {
					t.time -= dt;
				} else {
					for (let c of t.entity.components) {
						c.onDestroy();
					}
					this._inactive.push(t.entity);
					this._entities.splice(this._entities.indexOf(t.entity, 0), 1);
					this._delete.splice(this._delete.indexOf(t, 0), 1);
				}
			}

			for (let e of this._entities) {
				e.onUpdate(dt);
			}
		}

	}
}