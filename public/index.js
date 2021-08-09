let config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	backgroundColor: '#eeca84',
	pixelArt: true,
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};

let players = {}; 
let gamestate;

let Socket = new WebSocket("https://multiplayer-backend.cyxcl6xqlpy.ca-tor.codeengine.appdomain.cloud/game") // TODO

Socket.onmessage = function (event) {
	gamestate = JSON.parse(event.data);
	for (let id in gamestate) {

		// if moving left, flip the sprite
		players[id].flipX = false;
		if (players[id].x > gamestate[id].x) {
			players[id].flipX = true;
		}

		// if moving horizontallly
		if (players[id].x !== gamestate[id].x) {
			if (players[id].y == gamestate[id].y) {
				players[id].anims.play("move_right", true);
			}
			else if (players[id].y > gamestate[id].y) {
				players[id].anims.play("move_upright", true);
			} else {
				players[id].anims.play("move_downright", true);
			}
		}
		// if not moving horizontally
		else if (players[id].x === gamestate[id].x) {
			if (players[id].y == gamestate[id].y) {
				players[id].anims.play("down", true);
			}
			else if (players[id].y < gamestate[id].y) {
				players[id].anims.play("move_down", true);
			} else {
				players[id].anims.play("move_up", true);
			}
		}

		// update local state from network state
		players[id].x = gamestate[id].x;
		players[id].y = gamestate[id].y

		// set the depth based on the y position
		players[id].setDepth(players[id].y)
	}
}

var game = new Phaser.Game(config);

function preload ()
{
	this.load.spritesheet(
		"cowboy", "assets/cowboy.png", 
		{frameWidth: 48, frameHeight: 44}
	);
}

function create ()
{
	this.anims.create({
		key: "down",
		frames: this.anims.generateFrameNumbers("cowboy", {start:0, end:4}),
		frameRate: 8,
		repeat: -1
	})
	this.anims.create({
		key: "move_down",
		frames: this.anims.generateFrameNumbers("cowboy", {start:17, end:23}),
		frameRate: 8,
		repeat: -1
	})
	this.anims.create({
		key: "move_up",
		frames: this.anims.generateFrameNumbers("cowboy", {start:96, end:103}),
		frameRate: 8,
		repeat: -1
	})
	this.anims.create({
		key: "move_right",
		frames: this.anims.generateFrameNumbers("cowboy", {start:144, end:151}),
		frameRate: 8,
		repeat: -1
	})
	this.anims.create({
		key: "move_downright",
		frames: this.anims.generateFrameNumbers("cowboy", {start:192, end:199}),
		frameRate: 8,
		repeat: -1
	})
	this.anims.create({
		key: "move_upright",
		frames: this.anims.generateFrameNumbers("cowboy", {start:240, end:247}),
		frameRate: 8,
		repeat: -1
	})
	cursors = this.input.keyboard.createCursorKeys();
}

function update () {

	if (!gamestate) {
		return;
	}

	let inputs = [];

	if (cursors.left.isDown) 
	{
		inputs.push('left');
	}
	else if (cursors.right.isDown)
	{
		inputs.push('right');
	}

	if (cursors.up.isDown)
	{
		inputs.push('up');
	}
	else if (cursors.down.isDown)
	{
		inputs.push('down');
	}

	if (inputs.length > 0) {
		Socket.send(JSON.stringify(inputs));
	}

	for (let id in players) {
		players[id].checked = false;
	}

	for (let id in gamestate) {
		// create if player does not exist
		if (!players[id]) {
			players[id] = this.add.sprite(0, 0, "cowboy").setScale(2);
		}
		players[id].checked = true;
	}

	// delete player if they have disconnected
	for (let id in players) {
		if (!players[id].checked) {
			players[id].destroy(true);
		}
	}
}
