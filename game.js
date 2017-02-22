// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
    this.facing = Facing.RIGHT;
	this.name = previousName;
}

Player.prototype.setName = function(name) {
    this.name = name;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.movingOnverticalPlatform = function() {
    var node = svgdoc.getElementById("verticalPlatform");
    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    var h = parseFloat(node.getAttribute("height"));
    if (parseInt(node.getAttribute('direction')) == motionType.UP) {
        if (intersect(new Point(x, y - 1), new Size(w, 1), this.position, PLAYER_SIZE)) {
            this.position.y--;
        } else if (intersect(new Point(x, y + h), new Size(w, 1), this.position, PLAYER_SIZE)) {
            this.position.y = y + h + 1;
            this.verticalSpeed = 0;
        }
    } else {
        if (this.position.y < y) {
            if (intersect(new Point(x, y - 1), new Size(w, 1), this.position, PLAYER_SIZE)) {
                this.position.y++;
            } else if (intersect(new Point(x, y + h), new Size(w, 1), this.position, PLAYER_SIZE)) {
                this.position.y = y + h + 1;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}


Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(100, 560);   // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10);
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet
var monsterCanShoot = true;
var MAX_BULLET = 8;

var MONSTER_SIZE = new Size(60, 60);
var MONSTER_SPEED = 1;

var GOOD_THING_SIZE = new Size(40, 40);
var DEFAULT_TIME_LEFT = 120;

var EXIT_SIZE = new Size(40, 60);

var GOOD_THING_SCORE = 10;
var LEVEL_BONUS = 100;

var PORTAL_SIZE = new Size(20, 40);

var BGM = null;
var SHOOTING_SOUND = null;
var EXIT_SOUND = null;
var MONSTER_DIE_SOUND = null;
var GAMEOVER_SOUND = null;


//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2, UP:3, DOWN:4}; // Motion enum
var Facing = {LEFT: 0, RIGHT:1};   // Facing Direction enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              // The score of the game
var level = 0;
var monsterCnt = 6;
var timeLeft = 0;
var timeLeftTimer = null;
var previousName = "";
var cheatMode = false;
var platform1 = null;
var platform2 = null;
var platform3 = null;
var bulletCnt = 0;
var numOfGoodThing = 8;
var goodThingRemaining = 0;


//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
	
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    // Load the sound
    BGM = document.createElement("AUDIO");
    BGM.setAttribute("src", "./sounds/bgm.mp3");
    BGM.volume = 0.7;
    document.body.appendChild(BGM);

    SHOOTING_SOUND = document.createElement("AUDIO");
    SHOOTING_SOUND.setAttribute("src", "./sounds/shoot.mp3");
    document.body.appendChild(SHOOTING_SOUND);

    EXIT_SOUND = document.createElement("AUDIO");
    EXIT_SOUND.setAttribute("src", "./sounds/exit.mp3");
    document.body.appendChild(EXIT_SOUND);

    GAMEOVER_SOUND = document.createElement("AUDIO");
    GAMEOVER_SOUND.setAttribute("src", "./sounds/gameover.mp3");
    document.body.appendChild(GAMEOVER_SOUND);

    MONSTER_DIE_SOUND = document.createElement("AUDIO");
    MONSTER_DIE_SOUND.setAttribute("src", "./sounds/monsterdie.mp3");
    document.body.appendChild(MONSTER_DIE_SOUND);

}

function gameStart() {
	
	clearInterval(gameInterval);
    clearInterval(timeLeftTimer);

    cleanUpGroup("monsters", false);
    cleanUpGroup("bullets", false);
    cleanUpGroup("monsterBullets", false);
    cleanUpGroup("goodThings", false);

	level++;
	if (!(level == 1)) monsterCnt += 4;

	cheatMode = false;
	svgdoc.getElementById("level").firstChild.data = level;

    bulletCnt = MAX_BULLET;

    svgdoc.getElementById("numBull").firstChild.data = bulletCnt;
    svgdoc.getElementById("cheatMode").firstChild.data = "Off"; 
    if (level != 1) {
        canShoot = true;
    }
	
    // Create the player
    player = new Player();

    if (level == 1) {
        // Ask player what is your name
        previousName = window.prompt("What is your name?", previousName);

        if (previousName == null || previousName.length == 0 || previousName == '') {
            previousName = 'Anonymous';
        }
    
        // Set the player name
        svgdoc.getElementById('player_name').firstChild.data = previousName;

        // Create the player
        player.setName(previousName);

        BGM.currentTime = 0;
        BGM.play();
    }

    // Create the monsters
	createMonsters(monsterCnt);

    // Create disappearing platform
    createDissappearingPlatform();

    // Create the good things
    createGoodThings(numOfGoodThing);
	
	timeLeft = DEFAULT_TIME_LEFT;
	svgdoc.getElementById("verticalPlatform").setAttribute("speed", 2);
	
	timeLeftTimer = setInterval("countDown()", 1000);
    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
}


//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}

function createDissappearingPlatform() {
    var platforms = svgdoc.getElementById("platforms");
    
    platform1 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    platform1.setAttribute("x", 260);
    platform1.setAttribute("y", 60);
    platform1.setAttribute("width", 60);
    platform1.setAttribute("height", 20);
    platform1.setAttribute("type", "disappearing");
    platform1.setAttribute("opacity", 1);
    platform1.setAttribute("style", "fill:black;");
    platforms.appendChild(platform1);
    
    platform2 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    platform2.setAttribute("x", 500);
    platform2.setAttribute("y", 300);
    platform2.setAttribute("width", 100);
    platform2.setAttribute("height", 20);
    platform2.setAttribute("type", "disappearing");
    platform2.setAttribute("opacity", 1);
    platform2.setAttribute("style", "fill:black;");
    platforms.appendChild(platform2);
    
    platform3 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    platform3.setAttribute("x", 0);
    platform3.setAttribute("y", 220);
    platform3.setAttribute("width", 80);
    platform3.setAttribute("height", 20);
    platform3.setAttribute("type", "disappearing");
    platform3.setAttribute("opacity", 1);
    platform3.setAttribute("style", "fill:black;");
    platforms.appendChild(platform3);
}
//
// This function creates the monsters in the game
//
function createMonsters(numOfMonsters) {
    for (var i = 0; i < numOfMonsters; i++) {
        var x = 0, y = 0;
        
        var monsterInitPos;
        do {
            x = Math.floor(Math.random() * 500);
            y = Math.floor(Math.random() * 400);
            monsterInitPos = new Point(x, y);
        } while (intersect(PLAYER_INIT_POS, PLAYER_SIZE, monsterInitPos, MONSTER_SIZE));
        
        if (i == 0) {
            createBoss(x, y);
        } else {
            createMonster(x, y);    
        }
    }
}

function createMonster(x, y) {
    var monster = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'use');
    svgdoc.getElementById('monsters').appendChild(monster);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    monster.setAttribute("x", 0);
    monster.setAttribute("y", 0);
    monster.setAttribute("currX", x);
    monster.setAttribute("currY", y);
    monster.setAttribute("oriX", x);
    monster.setAttribute("oriY", y);
    monster.setAttribute("tarX", x);
    monster.setAttribute("tarY", y);
    monster.setAttribute("transform", "translate(" + x + "," + y + ")");
    monster.setAttribute("direction", Facing.LEFT);
}

function createBoss(x, y) {
    var monster = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'use');
    svgdoc.getElementById('monsters').appendChild(monster);
    monster.setAttribute('id', 'boss');
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    monster.setAttribute("x", 0);
    monster.setAttribute("y", 0);
    monster.setAttribute("currX", x);
    monster.setAttribute("currY", y);
    monster.setAttribute("oriX", x);
    monster.setAttribute("oriY", y);
    monster.setAttribute("tarX", x);
    monster.setAttribute("tarY", y);
    monster.setAttribute("transform", "translate(" + x + "," + y + ")");
    monster.setAttribute("direction", Facing.LEFT);
    monster.setAttribute("shooting", 1);
}

function moveMonster() {
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var node = monsters.childNodes.item(i);
        var currX = parseInt(node.getAttribute("currX"));
        var currY = parseInt(node.getAttribute("currY"));
        var oriX = parseInt(node.getAttribute("oriX"));
        var oriY = parseInt(node.getAttribute("oriY"));
        var tarX = parseInt(node.getAttribute("tarX"));
        var tarY = parseInt(node.getAttribute("tarY"));
        var disp = MONSTER_SPEED;

        // flip
        if (tarX >= currX){
            node.setAttribute("transform", "translate(" + (currX + MONSTER_SIZE.w) + "," + currY + ") scale (-1, 1)");
            node.setAttribute("direction", Facing.RIGHT);
        } else{
            node.setAttribute("transform", "translate(" + currX + "," + currY + ")");
            node.setAttribute("direction", Facing.LEFT);
        }

        node.setAttribute("currX", tarX > currX ? currX + disp : currX - disp);
        node.setAttribute("currY", tarY > currY ? currY + disp : currY - disp);
        // need a new destination if reached
        if ((oriX <= tarX && parseInt(node.getAttribute("currX")) >= tarX) || (oriY <= tarY && parseInt(node.getAttribute("currY")) >= tarY) || (oriX >= tarX && parseInt(node.getAttribute("currX")) <= tarX) || (oriY >= tarY && parseInt(node.getAttribute("currY")) <= tarY)) {
            node.setAttribute("tarX", Math.floor(Math.random() * (SCREEN_SIZE.w - MONSTER_SIZE.w)));
            node.setAttribute("tarY", Math.floor(Math.random() * (SCREEN_SIZE.h - MONSTER_SIZE.h)));
            node.setAttribute("oriX", currX);
            node.setAttribute("oriY", currY);
        }
    }
}

function createGoodThings(numOfGoodThing) {
    goodThingRemaining = numOfGoodThing;

    for (var i = 0; i < numOfGoodThing; i++) {
        var x = 0, y = 0;
        do {
            x = Math.floor(Math.random() * 500);
            y = Math.floor(Math.random() * 400);
            goodThingPos = new Point(x, y);
        } while (intersect(PLAYER_INIT_POS, PLAYER_SIZE, goodThingPos, GOOD_THING_SIZE) || collidePlatform(goodThingPos, GOOD_THING_SIZE) || collideGoodThing(goodThingPos, GOOD_THING_SIZE));
        
        createGoodThing(x, y);
    }
}

function createGoodThing(x, y) {
    var goodThing = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'use');
    svgdoc.getElementById('goodThings').appendChild(goodThing);
    goodThing.setAttribute("x", x);
    goodThing.setAttribute("y", y);
    goodThing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#goodThing");
}


//
// This function shoots a bullet from the player
//
function shootBullet() {

    SHOOTING_SOUND.currentTime = 0;
    SHOOTING_SOUND.play();
    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);

    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
	
    bullet.setAttribute("direction", player.facing);

    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    svgdoc.getElementById("bullets").appendChild(bullet);

    if (!cheatMode) {
        bulletCnt--;
        svgdoc.getElementById("numBull").firstChild.data =  bulletCnt;
    }
}

function bossShootBullet() {
    if (monsterCanShoot && Math.floor(Math.random() * 300) % 100 == 0) {
        monsterCanShoot = false;
        var monster = svgdoc.getElementById("boss");
        if (monster != null) {
            var bullet = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'use');
            var x = parseInt(monster.getAttribute("currX")) + MONSTER_SIZE.w / 2;
            var y = parseInt(monster.getAttribute("currY")) + MONSTER_SIZE.h / 2;
            bullet.setAttribute("x", x);
            bullet.setAttribute("y", y);
            bullet.setAttribute('direction', parseInt(monster.getAttribute("direction")));
            bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monsterBullet");
            svgdoc.getElementById("monsterBullets").appendChild(bullet);
        }
        setTimeout("monsterCanShoot = true", SHOOT_INTERVAL);
    }
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.facing = Facing.LEFT;
            break;

        case "M".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.facing = Facing.RIGHT;
            break;
			
        case "Z".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;

        case 32:
            if (bulletCnt <= 0) {
                canShoot = false;
            }
            if (canShoot) {
                shootBullet();
            }
            break;

        case "C".charCodeAt(0):
            cheatMode = true;
            svgdoc.getElementById("cheatMode").firstChild.data = 'On';
            svgdoc.getElementById("numBull").firstChild.data = 'Infinite';
            bulletCnt = 8;
            canShoot = true;
            break;

        case "V".charCodeAt(0):
            cheatMode = false;
            svgdoc.getElementById("cheatMode").firstChild.data = 'Off';
            svgdoc.getElementById("numBull").firstChild.data = bulletCnt;
            break;

        default:
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "M".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");

    if (!cheatMode) {
        for (var i = 0; i < monsters.childNodes.length; i++) {
            var monster = monsters.childNodes.item(i);
            var x = parseInt(monster.getAttribute("currX"));
            var y = parseInt(monster.getAttribute("currY"));

            if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
                gameOver();

                return;
            }
        }
    }
    

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("currX"));
            var my = parseInt(monster.getAttribute("currY"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;
                MONSTER_DIE_SOUND.currentTime = 0;
                MONSTER_DIE_SOUND.play();
                //write some code to update the score
				score += 10;
				svgdoc.getElementById("score").firstChild.data = score;
            }
        }
    }

    if (!cheatMode) {
        var monsterBullets = svgdoc.getElementById("monsterBullets");
        for (var i = 0; i < monsterBullets.childNodes.length; i++) {
            var bullet = monsterBullets.childNodes.item(i);
            var bulletX = parseInt(bullet.getAttribute("x"));
            var bulletY = parseInt(bullet.getAttribute("y"));
            var bulletPosition = new Point(bulletX, bulletY);
            if (intersect(bulletPosition, BULLET_SIZE, player.position, PLAYER_SIZE)) {
                monsterBullets.removeChild(bullet);
                gameOver();
                return;
            }
        }
    }

    // Check whether the player collides with a good thing
    var goodThings = svgdoc.getElementById("goodThings");
    for (var i = 0; i < goodThings.childNodes.length; i++) {
        var goodThing = goodThings.childNodes.item(i);
        var goodThingX = parseInt(goodThing.getAttribute("x"));
        var goodThingY = parseInt(goodThing.getAttribute("y"));
        var goodThingPosition = new Point(goodThingX, goodThingY);
        if (intersect(player.position, PLAYER_SIZE, goodThingPosition, GOOD_THING_SIZE)) {
            goodThings.removeChild(goodThing);
            i--;
            goodThingRemaining--;
            score += GOOD_THING_SCORE;

            svgdoc.getElementById("score").firstChild.data = score;
        }
    }

    // portal
    var portal1 = svgdoc.getElementById("portal1");
    var portal1X = parseInt(portal1.getAttribute("x"));
    var portal1Y = parseInt(portal1.getAttribute("y"));
    var portal1Position = new Point(portal1X, portal1Y);
    if (intersect(player.position, PLAYER_SIZE, portal1Position, PORTAL_SIZE)) {
        player.position = new Point(540, 500);
    }

    var portal2 = svgdoc.getElementById("portal2");
    var portal2X = parseInt(portal2.getAttribute("x"));
    var portal2Y = parseInt(portal2.getAttribute("y"));
    var portal2Position = new Point(portal2X, portal2Y);
    if (intersect(player.position, PLAYER_SIZE, portal2Position, PORTAL_SIZE)) {
        player.position = new Point(20, 440);
    }

    // exit
    var exit = svgdoc.getElementById("theExit");
    var exitX = parseInt(exit.getAttribute("x"));
    var exitY = parseInt(exit.getAttribute("y"));
    var exitPosition = new Point(exitX, exitY);
    if (intersect(player.position, PLAYER_SIZE, exitPosition, EXIT_SIZE)) {
        if (goodThingRemaining == 0) {
            EXIT_SOUND.play();
            levelUp();
        }
    }
}


//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        
        if (parseInt(node.getAttribute('direction')) == Facing.LEFT) {
            node.setAttribute("x", parseInt(node.getAttribute("x")) - BULLET_SPEED);
        } else {
            node.setAttribute("x", parseInt(node.getAttribute("x")) + BULLET_SPEED);
        }

        // If the bullet is not inside the screen delete it from the group
        if (parseInt(node.getAttribute("x")) > SCREEN_SIZE.w || parseInt(node.getAttribute("x")) < 0) {
            bullets.removeChild(node);
            i--;
        }
    }

    var monsterBullets = svgdoc.getElementById("monsterBullets");
    for (var i = 0; i < monsterBullets.childNodes.length; i++) {
        var node = monsterBullets.childNodes.item(i);

        // Update the position of the bullet
        if (parseInt(node.getAttribute('direction')) == Facing.LEFT) {
            node.setAttribute("x", parseInt(node.getAttribute("x")) - BULLET_SPEED);
        } else {
            node.setAttribute("x", parseInt(node.getAttribute("x")) + BULLET_SPEED);
        }

        // If the bullet is not inside the screen delete it from the group
        if (parseInt(node.getAttribute("x")) > SCREEN_SIZE.w || parseInt(node.getAttribute("x")) < 0) {
            monsterBullets.removeChild(node);
            i--;
        }
    }
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {

    if (timeLeft <= 0) {
        gameOver();
    }
    // Check collisions
    //collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();
	var position = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;
	
	var platforms = svgdoc.getElementById("platforms");
    if(isOnPlatform && platforms.childNodes.length > 0){
        for (var i = 0; i < platforms.childNodes.length; i++) {
            var platform = platforms.childNodes.item(i);
            if (platform.nodeName != "rect") continue;
            if (platform.getAttribute("type") == "disappearing") {
            	if((parseInt(platform.getAttribute("y")) == (player.position.y + PLAYER_SIZE.h))
                    && ((player.position.x + PLAYER_SIZE.w) > parseInt(platform.getAttribute("x")))
                    && (player.position.x < (parseInt(platform.getAttribute("x")) + parseInt(platform.getAttribute("width"))))){
                    var platformOpacity = parseFloat((platform.getAttribute("opacity") * 10 - 1) / 10);
                    platform.setAttribute("opacity" , platformOpacity);
                    if( parseFloat(platform.getAttribute("opacity"))== 0)
                        platforms.removeChild(platform);
                }
            }
        }
    }

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;
    player.movingOnverticalPlatform();
    moveVerticalPlatform();

	// Move the monsters
	moveMonster();
	
    // Move the bullets
    moveBullets();
    bossShootBullet();
    collisionDetection();

    updateScreen();
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
	
	// flip
	var transform;
    if (player.facing == Facing.LEFT) {
        transform = "translate(" + (player.position.x + PLAYER_SIZE.w)  + "," + player.position.y + ") scale(-1, 1)";
    } else {
        transform = "translate(" + player.position.x + "," + player.position.y + ")";
    }

    svgdoc.getElementById("player_name").setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    player.node.setAttribute("transform", transform);
            
    // Calculate the scaling and translation factors	
    var scale = new Point(zoom, zoom);
    var translate = new Point();
    
    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0) 
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0) 
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;
            
    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");	
}

function moveVerticalPlatform() {
    var verticalPlatform = svgdoc.getElementById('verticalPlatform');
    if (parseInt(verticalPlatform.getAttribute('direction')) == motionType.UP) {
        var yPos = parseInt(verticalPlatform.getAttribute("y"));
        yPos--;
        if (yPos <= parseInt(verticalPlatform.getAttribute('minY'))) {
            yPos = parseInt(verticalPlatform.getAttribute('minY'));
            verticalPlatform.setAttribute('direction', motionType.DOWN);
        }
    } else {
        var yPos = parseInt(verticalPlatform.getAttribute("y"));
        yPos++;
        if (yPos >= parseInt(verticalPlatform.getAttribute('maxY'))) {
            yPos = parseInt(verticalPlatform.getAttribute('maxY'));
            verticalPlatform.setAttribute('direction', motionType.UP);
        }
    }

    verticalPlatform.setAttribute("y", yPos);
}

function countDown() {

	timeLeft--;
	svgdoc.getElementById("time_left").firstChild.data = timeLeft;

}

function levelUp() {
    clearInterval(gameInterval);
    clearInterval(timeLeftTimer);

    score += level * LEVEL_BONUS;

    score += timeLeft;

    svgdoc.getElementById("score").firstChild.data = score;

    gameStart();

}

function gameOver() {

	clearInterval(timeLeftTimer);
    clearInterval(gameInterval);

    BGM.pause();
    GAMEOVER_SOUND.play();

    // Get the high score table from cookies
    table = getHighScoreTable();

    // Create the new score record
    var record = new ScoreRecord(player.name, score);

    // Insert the new score record
    var pos = table.length;
    for (var j = 0; j < table.length; j++) {
        if (record.score > table[j].score) {
            pos = j;
            record.highlight = true;
            break;
        }
    }
    table.splice(pos, 0, record);

    // Store the new high score table
    setHighScoreTable(table);

    // Show the high score table
    showHighScoreTable(table, pos);
}

function startAgain() {
	
	cleanUpGroup("monsters", false);
	cleanUpGroup("bullets", false);
    cleanUpGroup("monsterBullets", false);
	cleanUpGroup("highscoretext", false);
    cleanUpGroup("goodThings", false);
	
	svgdoc.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
	level=0;
	score=0;
    monsterCnt=6;
    numOfGoodThing=6;
	cheatMode = false;
	svgdoc.getElementById("score").firstChild.data = score;
	
	gameStart();
}

function collidePlatform(position, thingSize) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, thingSize, pos, size)) {
            return true;
        }
    }
    return false;
}

function collideGoodThing(position, thingSize) {
    var goodThings = svgdoc.getElementById('goodThings');
    for (var i = 0; i< goodThings.childNodes.length; i++) {
        var node = goodThings.childNodes.item(i);
        if (node.nodeName != 'use') continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var pos = new Point(x, y);
        if (intersect(position, thingSize, pos, GOOD_THING_SIZE)) return true;
    }
    return false;
}
