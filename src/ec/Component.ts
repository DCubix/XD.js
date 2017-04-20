namespace ec {
	export class Component {
		enabled: boolean;
		started: boolean;
		owner: Entity;

		constructor() {
			this.enabled = true;
			this.started = false;
			this.owner = null;
		}

		onStart(): void { }
		onRender(/* Renderer */): void { }
		onUpdate(dt: number): void { }
		onDestroy(): void { }

		clone() {
			let cpy = new Component();
			cpy.enabled = this.enabled;
			return cpy;
		}
	}
}