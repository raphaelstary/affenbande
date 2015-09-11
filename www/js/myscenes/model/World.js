var World = (function () {
    "use strict";

    function World(worldView, grid, gridHelper, domainGridHelper, gridViewHelper, gameOverFn) {
        this.worldView = worldView;
        this.grid = grid;
        this.gridHelper = gridHelper;
        this.domainGridHelper = domainGridHelper;
        this.gridViewHelper = gridViewHelper;
        this.gameOver = gameOverFn;

        this.history = [];
    }

    World.prototype.init = function () {
        this.snakes = this.domainGridHelper.getSnakes();
        this.worldView.drawLevel(this.snakes, this.domainGridHelper.getGround(), this.domainGridHelper.getNewParts(),
            this.domainGridHelper.getSpikes(), this.domainGridHelper.getGoal(), this.domainGridHelper.getTreeUpTiles(),
            this.domainGridHelper.getTreeDownTiles(), this.domainGridHelper.getTreeSmallTiles());
    };

    World.prototype.getHeads = function () {
        var heads = [];
        this.snakes.forEach(function (snake) {
            heads.push(snake[0]);
            heads.push(snake[snake.length - 1]);
        }, this);
        return heads;
    };

    World.prototype.moveSnakeLeft = function (head, callback) {
        for (var i = 0; i < this.snakes.length; i++) {
            var snake = this.snakes[i];
            var reversed = this.gridHelper.equals(snake[snake.length - 1], head);
            if (this.gridHelper.equals(snake[0], head) || reversed) {
                var success = this.__moveSnake(head.u - 1, head.v, snake, reversed, callback);
                if (success)
                    return snake[0];
                return false;
            }
        }
        return false;
    };

    World.prototype.moveSnakeRight = function (head, callback) {
        for (var i = 0; i < this.snakes.length; i++) {
            var snake = this.snakes[i];
            var reversed = this.gridHelper.equals(snake[snake.length - 1], head);
            if (this.gridHelper.equals(snake[0], head) || reversed) {
                var success = this.__moveSnake(head.u + 1, head.v, snake, reversed, callback);
                if (success)
                    return snake[0];
                return false;
            }
        }
        return false;
    };

    World.prototype.moveSnakeTop = function (head, callback) {
        for (var i = 0; i < this.snakes.length; i++) {
            var snake = this.snakes[i];
            var reversed = this.gridHelper.equals(snake[snake.length - 1], head);
            if (this.gridHelper.equals(snake[0], head) || reversed) {
                var success = this.__moveSnake(head.u, head.v - 1, snake, reversed, callback);
                if (success)
                    return snake[0];
                return false;
            }
        }
        return false;
    };

    World.prototype.moveSnakeBottom = function (head, callback) {
        for (var i = 0; i < this.snakes.length; i++) {
            var snake = this.snakes[i];
            var reversed = this.gridHelper.equals(snake[snake.length - 1], head);
            if (this.gridHelper.equals(snake[0], head) || reversed) {
                var success = this.__moveSnake(head.u, head.v + 1, snake, reversed, callback);
                if (success)
                    return snake[0];
                return false;
            }
        }
        return false;
    };

    World.prototype.__moveSnake = function (u, v, snake, reversed, callback) {
        var headMove = this.domainGridHelper.canSnakeMoveHead(snake, u, v);
        var tailMove = this.domainGridHelper.canSnakeMoveTail(snake, u, v);
        if (!(headMove || tailMove)) {
            var snakesToPushByHead = this.domainGridHelper.canSnakePushHead(snake, u, v, this.snakes);
            var snakesToPushByTail = this.domainGridHelper.canSnakePushTail(snake, u, v, this.snakes);

            if (!(snakesToPushByHead || snakesToPushByTail))
                return false;
        }

        var self = this;
        var counter = 0;
        var movedSnakes = [snake];

        var extendedCallback = function () {
            self.domainGridHelper.triggerEvents(movedSnakes);

            if (callback)
                callback();
        };

        function getCallbackWithCounter(callback) {
            counter++;
            return function () {
                if (--counter === 0 && callback) {
                    counter = 0;
                    callback();
                }
            };
        }

        function postMove() {
            var airSnakes = self.domainGridHelper.getSnakesInAir(self.snakes);
            if (airSnakes.length > 0) {
                airSnakes.forEach(function (airSnake) {
                    self.__applyGravity(airSnake, getCallbackWithCounter(postMove));
                    if (movedSnakes.length == 0 || movedSnakes[0].type != airSnake[0].type)
                        movedSnakes.push(airSnake);
                });

            } else {
                var badSnake;
                var badSpikes = false;
                var someUndo = movedSnakes.some(function (snake) {
                    badSpikes = self.domainGridHelper.isSnakeJustOnSpike(snake);
                    var undoWillHappen = badSpikes || self.domainGridHelper.isSnakeOutOfMapNext(snake);
                    if (undoWillHappen)
                        badSnake = snake;
                    return undoWillHappen;
                });
                if (someUndo) {
                    if (badSpikes) {
                        self.worldView.highlightSpikes(self.domainGridHelper.getHurtingSpikes(badSnake), undefined);
                        self.worldView.flashHighlightSnake(badSnake, function () {
                            self.undoLastMove(extendedCallback);
                        });
                    } else {
                        self.undoLastMove(extendedCallback);
                    }

                } else if (extendedCallback)
                    extendedCallback();
            }
        }

        var deltaU;
        var deltaV;
        var historyEntry;
        if (headMove && !reversed) {
            historyEntry = this.domainGridHelper.moveSnake(snake, u, v);
            this.history.push(historyEntry);
            if (historyEntry.action == 'goal') {
                this.worldView.moveSnake(historyEntry.changes, function () {
                    var historyEntry = self.domainGridHelper.removeSnakeFromGoalState(snake);
                    self.history.push(historyEntry);
                    movedSnakes = [];
                    self.snakes.some(function (mySnake, index, array) {
                        var found = mySnake[0].type == snake[0].type;
                        if (found)
                            array.splice(index, 1);
                        return found;
                    });
                    if (self.snakes.length == 0) {
                        self.__gameOver();
                    } else {
                        self.worldView.moveSnake(historyEntry.changes, postMove);
                    }
                });
            } else {
                this.worldView.moveSnake(historyEntry.changes, postMove);
            }

        } else if (tailMove && reversed) {
            historyEntry = this.domainGridHelper.moveSnakeReverse(snake, u, v);
            this.history.push(historyEntry);
            if (historyEntry.action == 'goal') {
                this.worldView.moveSnake(historyEntry.changes, function () {
                    var historyEntry = self.domainGridHelper.removeSnakeFromGoalState(snake);
                    self.history.push(historyEntry);
                    movedSnakes = [];
                    self.snakes.some(function (mySnake, index, array) {
                        var found = mySnake[0].type == snake[0].type;
                        if (found)
                            array.splice(index, 1);
                        return found;
                    });
                    if (self.snakes.length == 0) {
                        self.__gameOver();
                    } else {
                        self.worldView.moveSnake(historyEntry.changes, postMove);
                    }
                });
            } else {
                this.worldView.moveSnake(historyEntry.changes, postMove);
            }

        } else if (snakesToPushByHead && !reversed) {
            deltaU = u - snake[0].u;
            deltaV = v - snake[0].v;
            historyEntry = this.domainGridHelper.moveSnake(snake, u, v);
            this.history.push(historyEntry);
            this.worldView.moveSnake(historyEntry.changes, getCallbackWithCounter(postMove));
            snakesToPushByHead.forEach(function (snakeToPush) {
                var historyEntry = this.domainGridHelper.pushSnake(snakeToPush, deltaU, deltaV);
                movedSnakes.push(snakeToPush);
                this.history.push(historyEntry);
                this.worldView.moveSnake(historyEntry.changes, getCallbackWithCounter(postMove));
            }, this);

        } else if (snakesToPushByTail && reversed) {
            deltaU = u - snake[snake.length - 1].u;
            deltaV = v - snake[snake.length - 1].v;
            historyEntry = this.domainGridHelper.moveSnakeReverse(snake, u, v);
            this.history.push(historyEntry);
            this.worldView.moveSnake(historyEntry.changes, getCallbackWithCounter(postMove));
            snakesToPushByTail.forEach(function (snakeToPush) {
                var historyEntry = this.domainGridHelper.pushSnake(snakeToPush, deltaU, deltaV);
                movedSnakes.push(snakeToPush);
                this.history.push(historyEntry);
                this.worldView.moveSnake(historyEntry.changes, getCallbackWithCounter(postMove));
            }, this);

        }

        return true;
    };

    World.prototype.__applyGravity = function (snake, callback) {
        var gravityHistory = this.domainGridHelper.applyGravity(snake);
        this.history.push(gravityHistory);
        if (this.domainGridHelper.isSnakeOutOfMapNext(snake)) {
            this.worldView.fallDown(gravityHistory.changes, callback);
        } else {
            this.worldView.moveSnake(gravityHistory.changes, callback);
        }
    };

    World.prototype.undoLastMove = function (callback) {
        if (this.history.length < 1)
            return false;

        var self = this;
        var last;

        function extendedCallback() {
            if (last.action == 'goal')
                self.snakes.push(last.entity);
            if (last.type != 'user') {
                undo();
            } else if (callback)
                callback();
        }

        function undo() {
            last = self.history.pop();
            self.domainGridHelper.undo(last.changes, last.entity);
            self.worldView.undoMove(last.changes, extendedCallback);
        }

        undo();
        return true
    };

    World.prototype.__gameOver = function () {
        this.gameOver();
    };

    return World;
})();