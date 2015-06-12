var DomainGridHelper = (function (iterateSomeEntries) {
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
        GOAL: 3,
        TREE_UP: 4,
        TREE_DOWN: 5,
        TREE_SMALL: 6,
        NEW_PART: 9
    };

    DomainGridHelper.prototype.getSpikes = function () {
        return this.__getTiles(Tile.SPIKE);
    };

    DomainGridHelper.prototype.getNewParts = function () {
        return this.__getTiles(Tile.NEW_PART);
    };

    DomainGridHelper.prototype.getGoal = function () {
        return this.__getTiles(Tile.GOAL)[0];
    };

    DomainGridHelper.prototype.getGround = function () {
        return this.__getTiles(Tile.GROUND);
    };

    DomainGridHelper.prototype.getTreeUpTiles = function () {
        return this.__getTiles(Tile.TREE_UP, true);
    };

    DomainGridHelper.prototype.getTreeDownTiles = function () {
        return this.__getTiles(Tile.TREE_DOWN, true);
    };

    DomainGridHelper.prototype.getTreeSmallTiles = function () {
        return this.__getTiles(Tile.TREE_SMALL, true);
    };

    DomainGridHelper.prototype.__getTiles = function (name, isBackground) {
        var parts = [];

        for (var y = 0; y < this.yTiles; y++) {
            for (var x = 0; x < this.xTiles; x++) {
                var tile = !isBackground ? this.grid.get(x, y) : this.grid.getBackground(x, y);
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

    DomainGridHelper.prototype.isSnakeInAir = function (snake) {
        var neighbors = this.gridHelper.getBottomNeighbors(snake);
        var isOutNext = neighbors.length < snake.length;
        if (isOutNext)
            return false;
        var complement = this.gridHelper.complement(neighbors, snake);
        return complement.length != 0 && complement.every(function (tile) {
                return tile.type === Tile.SKY;
            });
    };

    DomainGridHelper.prototype.getSnakesInAir = function (snakes) {
        var airSnakes = [];
        snakes.forEach(function (snake) {
            if (this.isSnakeInAir(snake))
                airSnakes.push(snake);
        }, this);
        return airSnakes;
    };

    DomainGridHelper.prototype.isSnakeJustOnSpike = function (snake) {
        var neighbors = this.gridHelper.getBottomNeighborsComplement(snake);
        return neighbors.every(function (tile) {
            return tile.type === Tile.SKY || tile.type === Tile.SPIKE;
        });
    };

    DomainGridHelper.prototype.isSnakeOutOfMapNext = function (snake) {
        var neighbors = this.gridHelper.getBottomNeighbors(snake);
        var isOut = neighbors.length < snake.length;
        return isOut && this.gridHelper.complement(neighbors, snake).every(function (tile) {
                return tile.type === Tile.SKY;
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
            var tailType = head.type == snake[0].type ? snake[snake.length - 1].type : snake[0].type;
            return tileType === Tile.SKY || tileType === Tile.NEW_PART || tileType === Tile.GOAL ||
                tileType === tailType;
        }
        return false;
    };

    DomainGridHelper.prototype.canSnakePushHead = function (snake, u, v, snakes) {
        return this.__canSnakePush(snake, snake[0], u, v, snakes);
    };

    DomainGridHelper.prototype.canSnakePushTail = function (snake, u, v, snakes) {
        return this.__canSnakePush(snake, snake[snake.length - 1], u, v, snakes);
    };

    DomainGridHelper.prototype.__canSnakePush = function (snake, head, u, v, snakes) {
        var isNeighborOfHead = this.gridHelper.isNeighbor(head.u, head.v, u, v);
        if (!isNeighborOfHead)
            return false;
        var isPushToBottom = v > head.v;
        if (isPushToBottom)
            return false;

        var tileType = this.grid.get(u, v);
        var foundOtherTileType = !iterateSomeEntries(Tile, function (type) {
            return tileType === type;
        });
        if (!foundOtherTileType)
            return false;

        var itIsNotMe = this.gridHelper.getTileFromSetByType(snake, tileType) === undefined;
        if (!itIsNotMe)
            return false;

        var otherSnake = this.gridHelper.getSetFromAllSetsByType(snakes, tileType);
        if (!otherSnake)
            return false;

        var snakesToPushNext = [];
        var pushedSnakes = [otherSnake];
        var usedHeads = {};
        usedHeads[snake[0].type] = true;
        usedHeads[otherSnake[0].type] = true;
        var neighborsFn;
        if (u < head.u) {
            neighborsFn = this.gridHelper.getLeftNeighborsComplement.bind(this.gridHelper);
        } else if (v < head.v) {
            neighborsFn = this.gridHelper.getTopNeighborsComplement.bind(this.gridHelper);
        } else if (u > head.u)
            neighborsFn = this.gridHelper.getRightNeighborsComplement.bind(this.gridHelper);

        var self = this;

        function checkAllNeighborsForPushing(givenSnake) {
            var neighborsOfGivenSnake = neighborsFn(givenSnake);
            var moveForGivenSnakeIsPossible = neighborsOfGivenSnake.every(function (neighbor) {
                var tileIsEmpty = neighbor.type === Tile.SKY;
                if (!tileIsEmpty) {
                    var possibleTouchingSnake = this.gridHelper.getSetFromAllSetsByTile(snakes, neighbor);
                    if (!possibleTouchingSnake)
                        return false;
                    if (!usedHeads[possibleTouchingSnake[0].type]) {
                        usedHeads[possibleTouchingSnake[0].type] = true;
                        snakesToPushNext.push(possibleTouchingSnake);
                        pushedSnakes.push(possibleTouchingSnake);
                    } else {
                        var itIsTheInitialPushingSnake = snake[0].type == possibleTouchingSnake[0].type;
                        var tailType = head.type == snake[0].type ? snake[snake.length - 1].type : snake[0].type;
                        var itIsNotItsTail = neighbor.type != tailType;
                        if (itIsTheInitialPushingSnake && itIsNotItsTail)
                            return false;
                    }
                }
                return true;
            }, self);

            if (moveForGivenSnakeIsPossible) {
                if (snakesToPushNext.length > 0)
                    return checkAllNeighborsForPushing(snakesToPushNext.shift());
                return true;
            }
            return false;
        }

        var success = checkAllNeighborsForPushing(otherSnake);
        if (success) {
            return pushedSnakes;
        }
        return false;
    };

    var History = {
        NEW: 'new',
        CHANGED: 'changed',
        REMOVED: 'removed',
        REVERSED: 'reversed'
    };
    var Interaction = {
        USER: 'user',
        GRAVITY: 'gravity',
        PUSH: 'push',
        REMOVE: 'remove'
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
        changeSet.changes.unshift(historyItem);
        return changeSet;
    };

    DomainGridHelper.prototype.moveSnake = function (snake, u, v) {
        var changeSet = [];
        var tileType = this.grid.get(u, v);
        var action = 'move';
        var snakeReachesGoal = tileType == Tile.GOAL;
        if (snakeReachesGoal) {
            action = 'goal';
            this.__moveToGoal(snake, u, v, changeSet);
        } else {
            var snakeIsJoining = tileType == Tile.NEW_PART;
            if (snakeIsJoining)
                action = 'join';
            this.__moveTiles(snake.slice(), u, v, changeSet, snake, snakeIsJoining);
        }
        return {
            type: Interaction.USER,
            entity: snake,
            changes: changeSet,
            action: action
        };
    };

    DomainGridHelper.prototype.removeSnakeFromGoalState = function (snake) {
        return {
            type: Interaction.REMOVE,
            entity: snake,
            changes: this.__remove(snake, []),
            action: 'remove'
        };
    };

    DomainGridHelper.prototype.__remove = function (tiles, changeSet) {
        tiles.forEach(function (tile) {
            changeSet.push({
                oldU: tile.u,
                oldV: tile.v,
                tile: tile.type,
                type: History.REMOVED
            });
        });
        return changeSet;
    };

    DomainGridHelper.prototype.__moveToGoal = function (tiles, u, v, changeSet) {
        tiles.forEach(function (tile) {
            changeSet.push({
                oldU: tile.u,
                oldV: tile.v,
                newU: u,
                newV: v,
                tile: tile.type,
                type: History.CHANGED
            });
            this.grid.set(tile.u, tile.v, Tile.SKY);
            tile.u = u;
            tile.v = v;
        }, this);
    };

    DomainGridHelper.prototype.__moveTiles = function (tiles, u, v, changeSet, snake, isSnakeJoining) {
        var head = tiles.shift();
        this.grid.set(u, v, head.type);
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
            this.__moveTiles(tiles, change.oldU, change.oldV, changeSet, snake, isSnakeJoining);
        } else {
            if (isSnakeJoining) {
                var newPart = {
                    u: change.oldU,
                    v: change.oldV,
                    type: head.type + 1
                };
                this.grid.set(newPart.u, newPart.v, newPart.type);
                snake.push(newPart);
                changeSet.push({
                    newU: newPart.u,
                    newV: newPart.v,
                    tile: newPart.type,
                    type: History.NEW
                });
                changeSet.push({
                    oldU: snake[0].u,
                    oldV: snake[0].v,
                    tile: Tile.NEW_PART,
                    type: History.REMOVED
                });
            } else if (this.grid.get(change.oldU, change.oldV) === change.tile) {
                this.grid.set(change.oldU, change.oldV, Tile.SKY);
            }
        }
    };

    DomainGridHelper.prototype.pushSnake = function (snake, deltaU, deltaV) {
        var changeSet = [];

        snake.forEach(function (tile) {
            if (tile.type === this.grid.get(tile.u, tile.v))
                this.grid.set(tile.u, tile.v, Tile.SKY);
        }, this);

        snake.forEach(function (tile) {
            var newU = tile.u + deltaU;
            var newV = tile.v + deltaV;
            changeSet.push({
                oldU: tile.u,
                oldV: tile.v,
                newU: newU,
                newV: newV,
                tile: tile.type,
                type: History.CHANGED
            });
            this.grid.set(newU, newV, tile.type);
            tile.u = newU;
            tile.v = newV;
        }, this);

        return {
            type: Interaction.PUSH,
            entity: snake,
            changes: changeSet
        };
    };

    DomainGridHelper.prototype.undo = function (changeSet, snake) {
        changeSet.forEach(function (change) {
            if (change.type != History.REVERSED && change.type != History.REMOVED && change.type != History.NEW) {
                if (change.tile === this.grid.get(change.newU, change.newV))
                    this.grid.set(change.newU, change.newV, Tile.SKY);
                var tile = this.gridHelper.getTileFromSetByType(snake, change.tile);
                tile.u = change.oldU;
                tile.v = change.oldV;
            }
        }, this);

        changeSet.slice().reverse().forEach(function (change) {
            if (change.type == History.NEW) {
                snake.pop();

            } else if (change.type == History.REMOVED) {
                if (change.tile == Tile.NEW_PART)
                    this.grid.set(change.oldU, change.oldV, change.tile);

            } else if (change.type == History.REVERSED) {
                this.__reverseSnake(snake);

            } else {
                this.grid.set(change.oldU, change.oldV, change.tile);
            }
        }, this);
    };

    DomainGridHelper.prototype.applyGravity = function (snake) {
        var changeSet = [];

        var self = this;
        snake.forEach(function (tile) {
            changeSet.push({
                oldU: tile.u,
                oldV: tile.v,
                newU: 0,
                newV: 0,
                tile: tile.type,
                type: History.CHANGED
            });
        });

        function getToGround(snake) {
            if (self.isSnakeInAir(snake)) {
                snake.forEach(function (tile) {
                    if (tile.type === self.grid.get(tile.u, tile.v))
                        self.grid.set(tile.u, tile.v, Tile.SKY);
                });
                snake.forEach(function (tile) {
                    tile.v++;
                    self.grid.set(tile.u, tile.v, tile.type);
                });
                getToGround(snake);
            }
        }

        getToGround(snake);

        changeSet.forEach(function (change, index) {
            change.newU = snake[index].u;
            change.newV = snake[index].v;
        });

        return {
            type: Interaction.GRAVITY,
            entity: snake,
            changes: changeSet
        };
    };

    return DomainGridHelper;
})(iterateSomeEntries);