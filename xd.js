"use strict"; 

var frameTime = 0.0166; // 60 fps
var xD = {};

/// Utility
var util = {
	clone: function(obj) {
		return JSON.parse(JSON.stringify(obj));
	},
	matrix: function(w, h) {
		var m = new Array(h);
		for (var i = 0; i < h; i++) {
			m[i] = new Array(w);
		}
		return m;
	}
};
var animationTimeout = (function () {
	return  window.requestAnimationFrame 		||
			window.webkitRequestAnimationFrame  ||
			window.mozRequestAnimationFrame 	||
			function(callback){ window.setTimeout(callback, frameTime); };
})();

Math.lerp = function(a,b,t) {
	return (1-t)*a+b*t;
};
Math.over = function(a,b) {
	return 	a[0] < b[0]+b[2] &&
			a[0]+a[2] > b[0] &&
			a[1] < b[1]+b[3] &&
			a[1]+a[3] > b[1];
};
Math.rand = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
///

class Vec2 {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}
	set(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}
	get length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	normalized() {
		var l = this.len();
		return new Vec2(this.x / l, this.y / l);
	}
	clone() {
		return new Vec2(this.x, this.y);
	}
}

/// Base component
class Component {
	constructor() {
		this.owner = null;
		this.active = true;
		this.zorder = 0;
		this.offset = new Vec2();
	}
	render(ctx) {}
	update(dt) {}
	die() {}
	size() { return [1, 1]; }
	clone() { 
		var c = new Component();
		c.active = this.active;
		c.zorder = this.zorder;
		c.offset = util.clone(this.offset);
		return c;
	}
}

/// Basic sprite
class Sprite extends Component {
	constructor(img) {
		super();
		this.region = [0, 0, 1, 1];
		this.image = img || null;
	}
	render(ctx) {
		if (this.owner == null) { return; }
		if (this.image == null) { return; }

		var pos = this.owner.position;
		var ori = this.owner.origin;
		var scl = this.owner.scale;
		var src = this.region;
		var w = ~~(src[2] * this.image.width);
		var h = ~~(src[3] * this.image.height);
		var orix = ~~(ori.x * w);
		var oriy = ~~(ori.y * h);
		
		var rsrc = [
			src[0] * this.image.width,
			src[1] * this.image.height,
			src[2] * this.image.width,
			src[3] * this.image.height
		];
		
		ctx.save();
		ctx.translate(~~(pos.x + this.offset.x), ~~(pos.y + this.offset.y));
		ctx.scale(scl.x, scl.y);
		ctx.rotate(this.owner.rotation);
		ctx.drawImage(this.image, rsrc[0], rsrc[1], rsrc[2], rsrc[3], -orix, -oriy, w, h);
		ctx.restore();
	}
	size() {
		return this.image != null ? [this.image.width, this.image.height] : [1, 1];
	}
	clone() {
		var sup = super.clone();
		var s = Object.assign(new Sprite(this.image), sup.prototype);
		s.region = util.clone(this.region);
		return s;
	}
}

/// Basic tile map
class TileMap extends Component {
	constructor(img) {
		super();

		this.map = null;
		this.mapWidth = 0;
		this.mapHeight = 0;
		this.rows = 0;
		this.cols = 0;
		this.image = img;
	}
	setup(mapW, mapH, rows, cols) {
		this.mapWidth = mapW;
		this.mapHeight = mapH;
		this.rows = rows;
		this.cols = cols;

		this.map = util.matrix(mapW, mapH);
		return this;
	}
	setMap(map, rows, cols) {
		this.mapWidth = map[0].length;
		this.mapHeight = map.length;
		this.rows = rows;
		this.cols = cols;
		this.map = map;
		return this;
	}
	put(x, y, index) {
		this.map[y][x] = index;
		return this;
	}
	render(ctx) {
		if (this.owner == null) { return; }
		if (this.image == null) { return; }
		var pos = this.owner.position;
		var scl = this.owner.scale;
		var w = this.image.width;
		var h = this.image.height;
		
		var tw = w / this.cols;
		var th = h / this.rows;
		
		ctx.save();
		ctx.translate(~~(pos.x), ~~(pos.y));
		ctx.scale(scl.x, scl.y);
		ctx.rotate(this.owner.rotation);

		for (var ty = 0; ty < this.mapHeight; ty++) {
			for (var tx = 0; tx < this.mapWidth; tx++) {
				var i = this.map[ty][tx];
				if (i == -1) { continue; }
				var ux = (i % this.cols) * tw;
				var uy = Math.floor(i / this.cols) * th;
				ctx.drawImage(this.image, ux, uy, tw, th, tx * tw, ty * th, tw, th);
			}
		}
		ctx.restore();
	}
	clone() {
		var sup = super.clone();
		var c = Object.assign(new TileMap(this.image), sup.prototype);
		c.map = util.clone(this.map);
		c.mapWidth = this.mapWidth;
		c.mapHeight = this.mapHeight;
		c.rows = this.rows;
		c.cols = this.cols;
		return c;
	}
}

/// Animated Sprite
class AnimatedSprite extends Sprite {
	constructor(img) {
		super(img);
		this.animations = {};
		this.animation = "";
		this.conf = [0, 0];
	}
	setup(rows, cols) {
		this.conf = [cols, rows];
		return this;
	}
	addAnim(name, speed, loop, frames) {
		this.animations[name] = {
			speed: speed,
			loop: loop,
			frames: frames || [],
			time: 0.0,
			index: 0
		};
		this.animation = this.animation == "" ? name : this.animation;
		return this;
	}
	getAnim(name) {
		return this.animations[name];
	}
	update(dt) {
		if (this.animation != "") {
			var anim = this.animations[this.animation];
			anim.time += dt;
			if (anim.time >= anim.speed) {
				anim.time = 0;
				var len = anim.frames.length == 0 ? this.conf[0] * this.conf[1] : anim.frames.length;
				if (anim.index++ >= len - 1) {
					anim.index = anim.loop ? 0 : len - 1;
				}
			}
			var index = anim.frames.length > 0 ? anim.frames[anim.index] : anim.index;
			var w = 1.0 / this.conf[0];
			var h = 1.0 / this.conf[1];
			var x = (index % this.conf[0]) * w;
			var y = Math.floor(index / this.conf[0]) * h;
			this.region = [x, y, w, h];
		}
	}
	clone() {
		var sup = super.clone();
		var s = Object.assign(new AnimatedSprite(this.image), sup.prototype);
		s.conf = util.clone(this.conf);
		s.animation = this.animation;
		s.animations = util.clone(this.animations);
		return s;
	}
}

/// Entity
class Entity {
	constructor(s) {
		this.components = [];
		this.colliders = [];
		this.position = new Vec2();
		this.rotation = 0;
		this.origin = new Vec2();
		this.scale = new Vec2(1, 1);
		this.stage = s;
		this.life = -1;
		this.dead = false;
		this.tag = "";
		this.zorder = 0;
	}
	addComponent(comp) {
		comp.owner = this;
		this.components.push(comp);
		return this;
	}
	hasComponent(type) {
		return this.getComp(type) != null;
	}
	getComponent(type) {
		for (var key in this.components) {
			var comp = this.components[key];
			if (comp instanceof type) {
				return comp;
			}
		}
		return null;
	}
	kill() {
		this.life = 0;
	}
	revive() {
		this.dead = false;
		this.life = -1;
	}
	collide(o) {
		if (o == this) { return false; }
		var p = this.position;
		var s = this.scale;
		var col = [false, new Vec2(), null];
		for (var akey in this.colliders) {
			var ca = this.colliders[akey];
			var cma = [ca[0] + p.x, ca[1] + p.y, ca[2] * Math.abs(s.x), ca[3] * Math.abs(s.y)];
			for (var bkey in o.colliders) {
				var cb = o.colliders[bkey];
				var cmb = [cb[0] + o.position.x, cb[1] + o.position.y, cb[2] * Math.abs(o.scale.x), cb[3] * Math.abs(o.scale.y)];
				if (Math.over(cma, cmb)) {
					col[0] = true;
					col[2] = o;
					var a_bottom = cma[1] + cma[3];
					var b_bottom = cmb[1] + cmb[3];
					var a_right = cma[0] + cma[2];
					var b_right = cmb[0] + cmb[2];

					var b_collision = b_bottom - cma[1];
					var t_collision = a_bottom - cmb[1];
					var l_collision = a_right - cmb[0];
					var r_collision = b_right - cma[0];

					if (t_collision < b_collision && t_collision < l_collision && t_collision < r_collision ) {                           
						col[1].set(0, 1);
					} else if (b_collision < t_collision && b_collision < l_collision && b_collision < r_collision) {
						col[1].set(0, -1);
					} else if (l_collision < r_collision && l_collision < t_collision && l_collision < b_collision) {
						col[1].set(-1, 0);
					} else if (r_collision < l_collision && r_collision < t_collision && r_collision < b_collision ) {
						col[1].set(1, 0);
					}
					break;
				}
			}
		}
		return col;
	}
	collideTag(tag) {
		for (var key in this.stage.entities) {
			var e = this.stage.entities[key];
			if (e.tag == tag && e != this) {
				return this.collide(e);
			}
		}
		return false;
	}
	render(ctx, lastZ) {
		lastZ = lastZ || 0;
		var comps = this.components.sort(function(a, b) {
			return a.zorder+lastZ > b.zorder+lastZ ? 1 : -1;
		});
		for (var key in comps) {
			var comp = comps[key];
			if (!comp.active) { continue; }
			comp.render(ctx);
		}
	}
	renderCollisions(ctx) {
		var p = this.position;
		var s = this.scale;
		for (var akey in this.colliders) {
			var ca = this.colliders[akey];
			var tc = [ca[0] + p.x, ca[1] + p.y, ca[2] * Math.abs(s.x), ca[3] * Math.abs(s.y)];
			ctx.beginPath();
			ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
			ctx.rect(tc[0], tc[1], tc[2], tc[3]);
			ctx.stroke();
		}
	}
	die() {
		for (var key in this.components) {
			var comp = this.components[key];
			if (!comp.active) { continue; }
			comp.die();
		}
	}
	update(dt) {
		if (this.life > -1) {
			if (this.life > 0) {
				this.life -= dt;
			} else {
				this.dead = true;
			}
		}
		for (var key in this.components) {
			var comp = this.components[key];
			if (!comp.active) { continue; }
			comp.update(dt);
		}
	}
	clone() {
		var ent = new Entity(this.stage);
		for (var key in this.components) {
			var comp = this.components[key].clone();
			ent.addComp(comp);
		}
		ent.tag = this.tag;
		ent.colliders = util.clone(this.colliders);
		ent.position = this.position.clone();
		ent.rotation = this.rotation;
		ent.origin = this.origin.clone();
		ent.scale = this.scale.clone();
		ent.life = -1;
		ent.dead = false;
		ent.zorder = this.zorder;
		return ent;
	}
}

/// Simple input manager
var Input = {
	c: null,
	keys: {},
	buttons: {},
	touches: [],
	mouse: new Vec2(0, 0),
	_kd: function(e) {
		if (!e.metaKey) { e.preventDefault(); }
		if ([27,32,9].indexOf(e.keyCode) != -1) {
			e.preventDefault();
		}
		Input.keys[e.keyCode] = true;
	},
	_ku: function(e) {
		Input.keys[e.keyCode] = false;
	},
	_md: function(e) {
		e.preventDefault();
		Input.buttons[e.button] = true;
	},
	_mu: function(e) {
		Input.buttons[e.button] = false;
	},
	_mm: function(e) {
		var r = Input.c.getBoundingClientRect();
		Input.mouse.x = e.clientX - r.left;
		Input.mouse.y = e.clientY - r.top;
	},
	_td: function(e) {
		e.preventDefault();
		var r = Input.c.getBoundingClientRect();
		for (var k in e.touches) {
			var t = e.touches[k];
			Input.touches[k] = {
				x: t.clientX - r.left,
				y: t.clientY - r.top,
				state: true
			};
		}
	},
	_tu: function(e) {
		e.preventDefault();
		for (var k in e.touches) {
			var t = e.touches[k];
			Input.touches[k] = {
				x: t.clientX - r.left,
				y: t.clientY - r.top,
				state: false
			};
		}
	},
	_tm: function(e) {
		e.preventDefault();
		var r = Input.c.getBoundingClientRect();
		for (var k in e.touches) {
			var t = e.touches[k];
			Input.touches[k].x = t.clientX - r.left;
			Input.touches[k].y = t.clientY - r.top;
		}
	},
	start: function(c) {
		Input.c = c;
		var w = window;
		w.focus();
		w.onkeydown = Input._kd;
		w.onkeyup = Input._ku;
		c.onmousedown = Input._md;
		c.onmouseup = Input._mu;
		c.onmousemove = Input._mm;
		c.ontouchstart = Input._td;
		c.ontouchend = Input._tu;
		c.ontouchmove = Input._tm;
	}
};

/// Stage. Here's where everything lives
class Stage {
	constructor(id) {
		this.entities = [];
		this._rem = [];
		this.id = id;
		this.camera = { x: 0, y: 0, zoom: 1 };
		this.backColor = "#000000";
		this.post_draw = [];
	}
	new(tag, life) {
		life = life || -1;
		var ent = new Entity(this);
		ent.tag = tag || "";
		ent.life = life;
		this.entities.push(ent);
		return ent;
	}
	spawn(entity, life) {
		life = life || -1;
		var ent = entity.clone();
		ent.revive();
		ent.life = life;
		this.entities.push(ent);
		return ent;
	}
	pull(tag) {
		for (var k in this.entities) {
			var e = this.entities[k];
			if (e.tag == tag) {
				return e;
			}
		}
		return null;
	}
	update(dt) {
		for (var key in this.entities) {
			var ent = this.entities[key];
			ent.update(dt);
			if (ent.dead) {	this._rem.push(key); }
		}
		for (var key in this._rem) {
			this.entities[this._rem[key]].die();
			delete this.entities[this._rem[key]];
		}
		this._rem = [];
	}
	render(ctx, cols) {
		var w = ctx.canvas.width/2;
		var h = ctx.canvas.height/2;
		var ents = this.entities.sort(function(a, b) {
			return a.zorder > b.zorder ? 1 : -1;
		});
		ctx.save();
		ctx.translate(~~(-this.camera.x + w), ~~(-this.camera.y + h));
		ctx.scale(this.camera.zoom, this.camera.zoom);
		for (var key in ents) {
			var ent = ents[key];
			ent.render(ctx, ent.zorder);
			if (cols) {
				ent.renderCollisions(ctx);
			}
		}
		ctx.restore();
		ctx.save();
		ctx.scale(this.camera.zoom, this.camera.zoom);
		for (var key in this.post_draw) {
			this.post_draw[key](ctx);
		}
		ctx.restore();
	}
}

/// State-based game
class Game {
	constructor() {
		this.states = {};
		this.stage = null;
		this.canvas = null;
		this.ctx = null;
		this.timeScale = 1.0;
		this.debug = false;
	}
	registerState(name) {
		this.states[name] = new Stage(name);
		if (this.stage == null) { this.stage = this.states[name]; }
	}
	setState(name) {
		this.stage = this.states[name];
	}
	init(c) {
		this.canvas = c;
		this.ctx = this.canvas.getContext("2d");
	}
	update(dt) {
		if (this.stage != null) {
			this.stage.update(dt * this.timeScale);
			this.ctx.fillStyle = this.stage.bg;
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.imageSmoothingEnabled = false;
			this.ctx.mozImageSmoothingEnabled = false;
			this.stage.render(this.ctx, this.debug);
		}
	}
}

/// Simple asset manager
class AssetManager {
	constructor() {
		this.queue = [];
		this.cache = {};
		this.e = 0;
		this.s = 0;
	}
	queueAsset(path, type) {
		this.queue.push([path, type]);
	}
	downloadAll(callback) {
		if (this.queue.length == 0) { callback(); }
		for (var k in this.queue) {
			var item = this.queue[k];
			var asset;
			var that = this;
			if (item[1] == "image") {
				asset = new Image();
				asset.onload = function() {
					that.s++;
					if (that.finished()) {
						callback();
					}
				};
			} else if (item[1] == "audio") {
				asset = new Audio();
				asset.onloadeddata = function() {
					that.s++;
					if (that.finished()) {
						callback();
					}
				};
			}
			asset.onerror = function() {
				that.e++;
				if (that.finished()) {
					callback();
				}
			};
			asset.src = item[0];
			this.cache[item[0]] = asset;
		}
	}
	finished() {
		return this.queue.length == this.e + this.s;
	}
	getAsset(path) {
		return this.cache[path];
	}
}

/// Engine
var t = (new Date()).getTime();
xD.engine = {
	current: t,
	last: t,
	init: false,
	onload: null,
	assets: new AssetManager(),
	_$: function(game, c) {
		if (!this.init) {
			Input.start(c);
			game.init(c);
			this.init = true;
		}
		animationTimeout(this._$.bind(this, game));
		this.current = (new Date()).getTime();
		var delta = (this.current - this.last) / 1000;
		this.last = this.current;
		game.update(Math.min(delta, frameTime));
	},
	start: function(game, w, h) {
		var that = this;
		this.assets.downloadAll(function() {
			var c = document.createElement("canvas");
			c.width = w;
			c.height = h;
			document.body.appendChild(c);
			game.canvas = c;
			if (that.onload != null) { that.onload(that.assets); }
			that._$(game, c);
		});
	}
};