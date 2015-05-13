var DomainGridHelper = (function () {
    "use strict";

    function DomainGridHelper(gridHelper, grid, xTiles, yTiles) {
        this.gridHelper = gridHelper;
        this.grid = grid;
        this.xTiles = xTiles;
        this.yTiles = yTiles;
    }

    var Tile = {
        SKY: 0,
        GROUND: 1,
        SPIKE: 2,
        NEW_PART: 9
    };

    DomainGridHelper.prototype.getSpikes = function () {
        return this.__getTiles(Tile.SPIKE);
    };

    DomainGridHelper.prototype.getNewParts = function () {
        return this.__getTiles(Tile.NEW_PART);
    };

    DomainGridHelper.prototype.getGround = function () {
        return this.__getTiles(Tile.GROUND);
    };

    DomainGridHelper.prototype.__getTiles = function (name) {
        var parts = [];

        for (var y = 0; y < this.yTiles; y++) {
            for (var x = 0; x < this.xTiles; x++) {
                var tile = this.grid.get(x, y);
                if (tile === name)
                    parts.push({
                        u: x,
                        v: y,
                        type: name
                    });
            }
        }

        return parts;
    };

    DomainGridHelper.prototype.getSnakes = function () {
        var self = this;

        function findHeads() {
            var heads = [];
            for (var y = 0; y < self.yTiles; y++) {
                for (var x = 0; x < self.xTiles; x++) {
                    var tile = self.grid.get(x, y);
                    if (tile > 0 && tile % 20 == 0)
                        heads.push({
                            u: x,
                            v: y,
                            type: tile
                        });
                }
            }
            return heads;
        }

        function getNextBodyPart(snake, currentPart, x, y) {
            var nextPart = currentPart + 1;
            self.gridHelper.getNeighbors(x, y).forEach(function (neighbor) {
                if (neighbor.type == nextPart) {
                    snake.push(neighbor);
                    getNextBodyPart(snake, nextPart, neighbor.u, neighbor.v);
                }
            });
        }

        var snakes = [];
        findHeads().forEach(function (head) {
            var snake = [
                {
                    u: head.u,
                    v: head.v,
                    type: head.type
                }
            ];

            getNextBodyPart(snake, head.type, head.u, head.v);
            snakes.push(snake);
        });

        return snakes;
    };

    DomainGridHelper.prototype.hasSnakeGround = function (snake) {
        return this.gridHelper.getBottomNeighbors(snake).some(function (tile) {
            return tile.type === Tile.GROUND;
        });
    };

    DomainGridHelper.prototype.canSnakeMoveHead = function (snake, u, v) {
        return this.__canSnakeMove(snake, snake[0], u, v);
    };

    DomainGridHelper.prototype.canSnakeMoveTail = function (snake, u, v) {
        return this.__canSnakeMove(snake, snake[snake.length - 1], u, v);
    };

    DomainGridHelper.prototype.__canSnakeMove = function (snake, head, u, v) {
        var isNeighborOfHead = this.gridHelper.isNeighbor(head.u, head.v, u, v);
        if (isNeighborOfHead) {
            var tileType = this.grid.get(u, v);
            return tileType === Tile.SKY || tileType === Tile.NEW_PART;
        }
        return false;
    };

    var History = {
        NEW: 'new',
        CHANGED: 'changed',
        REMOVED: 'removed',
        REVERSED: 'reversed'
    };

    DomainGridHelper.prototype.__reverseSnake = function (snake) {
        var self = this;

        function swapCoordinates(snake) {
            var head = snake.shift();
            var tail = snake.pop();
            var tempU = head.u;
            var tempV = head.v;
            head.u = tail.u;
            head.v = tail.v;
            self.grid.set(head.u, head.v, head.type);
            tail.u = tempU;
            tail.v = tempV;
            self.grid.set(tail.u, tail.v, tail.type);

            if (snake.length > 1)
                swapCoordinates(snake);
        }

        swapCoordinates(snake.slice());

        return {type: History.REVERSED};
    };

    DomainGridHelper.prototype.moveSnakeReverse = function (snake, u, v) {
        var historyItem = this.__reverseSnake(snake);
        var changeSet = this.moveSnake(snake, u, v);
        changeSet.unshift(historyItem);
        return changeSet;
    };

    DomainGridHelper.prototype.moveSnake = function (snake, u, v) {
        var snakeIsJoining = this.grid.get(u, v) == Tile.NEW_PART;
        var changeSet = [];
        var self = this;

        function moveTiles(tiles, u, v) {
            var head = tiles.shift();
            self.grid.set(u, v, head.type);
            var change = {
                oldU: head.u,
                oldV: head.v,
                newU: u,
                newV: v,
                tile: head.type,
                type: History.CHANGED
            };
            changeSet.push(change);
            head.u = u;
            head.v = v;

            if (tiles.length > 0) {
                moveTiles(tiles, change.oldU, change.oldV);
            } else {
                if (snakeIsJoining) {
                    var newPart = {
                        u: change.oldU,
                        v: change.oldV,
                        type: head.type + 1
                    };
                    self.grid.set(newPart.u, newPart.v, newPart.type);
                    snake.push(newPart);
                    changeSet.push({
                        newU: newPart.u,
                        newV: newPart.v,
                        tile: newPart.type,
                        type: History.NEW
                    });
                    changeSet.push({
                        oldU: u,
                        oldV: v,
                        tile: Tile.NEW_PART,
                        type: History.REMOVED
                    });
                } else {
                    self.grid.set(change.oldU, change.oldV, Tile.SKY);
                }
            }
        }

        moveTiles(snake.slice(), u, v);

        return changeSet;
    };

    DomainGridHelper.prototype.undo = function (changeSet) {
        changeSet.reverse().forEach(function (change, index, array) {
            if (change.type == History.NEW)
                return;
            this.grid.set(change.oldU, change.oldV, change.tile);
            if (index == array.length - 1) {
                this.grid.set(change.newU, change.newV, 0);
            }

        }, this);
    };

    return DomainGridHelper;
})();