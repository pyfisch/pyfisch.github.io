/* Game 0
 * ======
 * 
 * Links:
 * * [A Detailed Explanation of JavaScript Game Loops and Timing](http://www.isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing)
 * * [The guide to implementing 2D platformers](http://higherorderfun.com/blog/2012/05/20/the-guide-to-implementing-2d-platformers/)
 */

"use strict";

const TILE_SIZE = 16;
const GRAVITY = 0.25;
const SLOWDOWN = 0.9;
const TIMESTEP = 1000 / 30;

function tile(pos) {
    return Math.floor(pos / TILE_SIZE);
}

class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

class TileMap {
    constructor() {
        this.width = 40;
        this.height = 40;
    }

    get(col, row) {
        if (col == 0 || col == 39 || row == 0 || row == 39) {
            return "solid";
        }
        if (row == 30 && (col < 25 || col > 28)) {
            return "solid"
        }
        if (row == 24 && col >= 10 && col <= 20) {
            return "solid";
        }
        if ((row == 37 || row == 38) && (col > 25 && col < 28)) {
            return "solid";
        }
        return null;
    }

    draw(ctx, offsetX, offsetY) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 10000, 10000)
        for (let column = 0; column < this.width; column++) {
            for (let row = 0; row < this.height; row++) {
                let tile = this.get(column, row);
                switch (tile) {
                    case "solid":
                        ctx.fillStyle = "black";
                        break;
                    default:
                        ctx.fillStyle = "white";
                        break;
                }
                ctx.fillRect(column * TILE_SIZE + offsetX - 0.5, row * TILE_SIZE + offsetY - 0.5, TILE_SIZE + 1, TILE_SIZE + 1);
            }
        }
    }
}

class Player {
    constructor(map) {
        this.map = map;

        this.x = 100;
        this.y = 200;
        this.width = 24;
        this.height = 40;
        this.speedX = 0;
        this.speedY = 0;

        this.onGround = false;
    }

    draw(ctx, canvasWidth, canvasHeight) {
        ctx.fillStyle = "red";
        let originX = (canvasWidth + this.width) / 2;
        let originY = (canvasHeight + this.height) / 2;
        ctx.fillRect(originX, originY, this.width, this.height)
    }

    getMapOffset(canvasWidth, canvasHeight) {
        return [canvasWidth / 2 - this.x + this.width / 2, canvasHeight / 2 - this.y + this.height / 2]
    }

    moveDown(offset) {
        let dest = this.y + this.height + offset;
        let startX = tile(this.x + 1);
        let endX = tile(this.x + this.width - 1);
        let startY = tile(this.y + this.height);
        let endY = tile(dest);

        for (let col = startX; col <= endX; col++) {
            for (let row = startY; row <= endY; row++) {
                if (this.map.get(col, row) === "solid") {
                    dest = Math.min(dest, row * TILE_SIZE);
                    this.speedY = 0;
                    this.onGround = true;
                }
            }
        }
        this.y = dest - this.height;
    }

    moveUp(offset) {
        let dest = this.y - offset;
        let startX = tile(this.x + 1);
        let endX = tile(this.x + this.width - 1);
        let startY = tile(this.y);
        let endY = tile(dest);

        for (let col = startX; col <= endX; col++) {
            for (let row = startY; row >= endY; row--) {
                if (this.map.get(col, row) === "solid") {
                    dest = Math.max(dest, (row + 1) * TILE_SIZE);
                    this.speedY = 0;
                }
            }
        }
        this.y = dest;
    }

    moveRight(offset) {
        let dest = this.x + this.width + offset;
        let startX = tile(this.x + this.width);
        let endX = tile(dest);
        let startY = tile(this.y + 1);
        let endY = tile(this.y + this.height - 1);

        for (let row = startY; row <= endY; row++) {
            for (let col = startX; col <= endX; col++) {
                if (this.map.get(col, row) === "solid") {
                    dest = Math.min(dest, col * TILE_SIZE);
                    this.speedX = 0;
                }
            }
        }

        this.x = dest - this.width;
    }

    moveLeft(offset) {
        let dest = this.x - offset;

        let startX = tile(this.x);
        let endX = tile(dest);
        let startY = tile(this.y + 1);
        let endY = tile(this.y + this.height - 1);

        for (let row = startY; row <= endY; row++) {
            for (let col = startX; col >= endX; col--) {
                if (this.map.get(col, row) === "solid") {
                    dest = Math.max(dest, (col + 1) * TILE_SIZE);
                }
            }
        }

        this.x = dest;
    }

    tick() {
        this.speedY += GRAVITY;
        if (this.speedY > 0) {
            this.moveDown(this.speedY);
        } else {
            this.moveUp(-this.speedY);
        }
        if (this.speedX > 0) {
            this.moveRight(this.speedX);
        } else {
            this.moveLeft(-this.speedX)
        }
    }
}

class Game {
    constructor(canvas) {
        this.map = new TileMap();
        this.player = new Player(this.map);

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.lastFrame = null;
        this.delta = 0;
    }

    start() {
        window.requestAnimationFrame(this.update.bind(this));

        window.addEventListener("keydown", this.keydown.bind(this));
        window.addEventListener("keyup", this.keyup.bind(this));
    }

    update(timestamp) {
        if (!this.lastFrame) {
            this.tick();
        } else {
            this.delta += timestamp - lastFrame;
            while (this.delta >= TIMESTEP) {
                this.tick();
                this.delta -= TIMESTEP;
            }
        }
        this.draw();
        window.requestAnimationFrame(this.update.bind(this));
    }

    keydown(event) {
        if (event.key === "w" && this.player.onGround) {
            this.player.speedY = -8;
            this.player.onGround = false;
        } else if (event.key === "a") {
            this.player.speedX = -5;
        } else if (event.key === "d") {
            this.player.speedX = 5;
        }
    }

    keyup(event) {
        if (event.key === "w") {
            this.player.speedY = Math.max(-4, this.player.speedY);
        } else if (event.key === "a") {
            this.player.speedX = 0;
        } else if (event.key === "d") {
            this.player.speedX = 0;
        }
    }

    tick() {
        this.player.tick();
    }

    draw() {
        this.map.draw(this.ctx, ...this.player.getMapOffset(this.canvas.width, this.canvas.height));
        this.player.draw(this.ctx, this.canvas.width, this.canvas.height);
    }
}

function main() {
    let canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let game = new Game(canvas);
    game.start();
}

window.addEventListener("load", main);
