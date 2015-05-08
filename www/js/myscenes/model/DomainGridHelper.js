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
        NEW_PART: 2,
        SNAKE_HEAD: 3
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

    DomainGridHelper.prototype.getSnake = function () {
        var self = this;

        function findHead() {
            for (var y = 0; y < self.yTiles; y++) {
                for (var x = 0; x < self.xTiles; x++) {
                    var tile = self.grid.get(x, y);
                    if (tile == Tile.SNAKE_HEAD)
                        return {
                            u: x,
                            v: y
                        };
                }
            }
        }

        var head = findHead();
        var snake = [
            {
                u: head.u,
                v: head.v,
                type: Tile.SNAKE_HEAD
            }
        ];

        function getNextBodyPart(snake, currentPart, x, y) {
            var nextPart = currentPart + 1;
            self.gridHelper.getNeighbors(x, y).forEach(function (neighbor) {
                if (neighbor.type == nextPart) {
                    snake.push(neighbor);
                    getNextBodyPart(snake, nextPart, neighbor.u, neighbor.v);
                }
            });
        }

        getNextBodyPart(snake, Tile.SNAKE_HEAD, head.u, head.v);

        return snake;
    };

    DomainGridHelper.prototype.hasSnakeGround = function (snake) {
        return this.gridHelper.getBottomNeighbors(snake).some(function (tile) {
            return tile.type === Tile.GROUND;
        });
    };

    DomainGridHelper.prototype.canSnakeMove = function (snake, u, v) {
        var head = snake[0];
        var isNeighbor = this.gridHelper.isNeighbor(head.u, head.v, u, v);
        if (isNeighbor) {
            var tileType = this.grid.get(u, v);
            return tileType === Tile.SKY || tileType === Tile.NEW_PART;
        }
        return false;
    };

    var History = {
        NEW: 'new',
        CHANGED: 'changed',
        REMOVED: 'removed'
    };

    DomainGridHelper.prototype.moveSnake = function (snake, u, v) {
        var snakeIsJoining = this.grid.get(u, v) == Tile.NEW_PART;
        var changeSet = [];
        var self = this;

        function moveTiles(tiles, u, v) {
            var head = tiles.shift();
            self.grid.set(u, v, head.type);
            changeSet.push({
                oldU: head.u,
                oldV: head.v,
                newU: u,
                newV: v,
                tile: head.type,
                type: History.CHANGED
            });

            if (tiles.length > 0) {
                moveTiles(tiles, head.u, head.v);
            } else {
                if (snakeIsJoining) {
                    var newPart = {
                        u: head.u,
                        v: head.v,
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
                } else {
                    self.grid.set(head.u, head.v, Tile.SKY);
                }
            }
        }

        if (snakeIsJoining) {
            changeSet.push({
                oldU: u,
                oldV: v,
                tile: Tile.NEW_PART,
                type: History.REMOVED
            });
        }
        moveTiles(snake.slice(), u, v);

        return changeSet;
    };

    DomainGridHelper.prototype.undo = function (changeSet) {
        changeSet.forEach(function (change) {
            if (change.type == History.NEW)
                return;
            this.grid.set(change.oldU, change.oldV, change.tile);

        }, this);
    };

    return DomainGridHelper;
})();