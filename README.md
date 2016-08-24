XD.js Game Engine
==============
A tiny and simple 2D game engine for HTML5.

#### Features
- Component-based
- Tile Maps
- Basic collisions

Example:
```js
// Create a new game
var game = new Game();
game.registerState("game");

// Create a "player" entity
var player = game.states["game"].new("player");
player.position.set(100, 100);

// Asset Loading
xD.assets.queueAsset("player.png", "image");
xD.onload = function(assets) {
	var sprite = new Sprite(assets.getAsset("player.png"));
	player.addComponent(sprite);
};

// Start engine
xD.start(game, 512, 512);

```