var WorldView = (function (calcCantorPairing, iterateEntries, Transition, wrap) {
    "use strict";

    function WorldView(stage, timer, gridViewHelper, is30fps) {
        this.stage = stage;
        this.timer = timer;
        this.gridViewHelper = gridViewHelper;

        this.newParts = {};
        this.ground = [];
        this.spikes = {};
        this.bodyParts = {};

        this.tree = [];

        this.moveSpeed = is30fps ? 5 : 10;
        this.revertSpeed = is30fps ? 5 : 10;
        this.highlightFadeInSpeed = is30fps ? 4 : 8;
        this.highlightFadeOutSpeed = is30fps ? 14 : 29;
        this.flashFadeInSpeed = is30fps ? 1 : 2;
        this.flashFadeOutSpeed = is30fps ? 2 : 4;
        this.flashDuration = is30fps ? 10 : 20;
    }

    WorldView.prototype.preDestroy = function () {
        iterateEntries(this.newParts, function (part) {
            part.remove();
        });
        iterateEntries(this.bodyParts, function (part) {
            part.remove();
        });
        this.ground.forEach(function (tile) {
            tile.remove();
        });
        iterateEntries(this.spikes, function (part) {
            part.remove();
        });
        this.goal.remove();
        this.tree.forEach(function (part) {
            part.remove();
        });
    };

    WorldView.prototype.setAlphaOfAll = function () {
        iterateEntries(this.newParts, function (part) {
            part.setAlpha(0.5);
        });
        iterateEntries(this.bodyParts, function (part) {
            part.setAlpha(0.5);
        });
        this.ground.forEach(function (tile) {
            tile.setAlpha(0.5);
        });
        iterateEntries(this.spikes, function (part) {
            part.setAlpha(0.5);
        });
        this.goal.setAlpha(0.5);
        this.tree.forEach(function (part) {
            part.setAlpha(0.5);
        });
    };

    WorldView.prototype.drawLevel = function (snakes, groundTiles, newParts, spikes, goal, treeUpTiles, treeDownTiles,
        treeSmallTiles) {
        groundTiles.forEach(function (ground) {
            this.ground.push(this.gridViewHelper.create(ground.u, ground.v, 'leave'));
        }, this);

        newParts.forEach(function (newPart) {
            this.newParts[calcCantorPairing(newPart.u, newPart.v)] = this.gridViewHelper.create(newPart.u, newPart.v,
                'monkey_grey');
        }, this);

        snakes.forEach(function (snake) {
            snake.forEach(function (part, index, array) {
                if (index == 0 || index == array.length - 1) {
                    this.bodyParts[part.type] = this.gridViewHelper.create(part.u, part.v, 'monkey_head');
                } else {
                    this.bodyParts[part.type] = this.gridViewHelper.create(part.u, part.v, 'monkey');
                }
            }, this);
        }, this);

        spikes.forEach(function (newPart) {
            this.spikes[calcCantorPairing(newPart.u, newPart.v)] = this.gridViewHelper.create(newPart.u, newPart.v,
                'spike');
        }, this);

        this.goal = this.gridViewHelper.create(goal.u, goal.v, 'coconut');

        treeUpTiles.forEach(function (treeUpTile) {
            this.tree.push(this.gridViewHelper.createBackground(treeUpTile.u, treeUpTile.v, 'tree_up', 2));
        }, this);

        treeDownTiles.forEach(function (treeDownTile) {
            this.tree.push(this.gridViewHelper.createBackground(treeDownTile.u, treeDownTile.v, 'tree_down', 2));
        }, this);

        treeSmallTiles.forEach(function (treeSmallTile) {
            this.tree.push(this.gridViewHelper.createBackground(treeSmallTile.u, treeSmallTile.v, 'tree_small', 1));
        }, this);

    };

    WorldView.prototype.selectHead = function (head) {
        var drawable = this.bodyParts[head.type];
        drawable.scale = 1.2 * this.gridViewHelper.getMonkeyBaseScale();
    };

    WorldView.prototype.deselectHead = function (head) {
        var drawable = this.bodyParts[head.type];
        drawable.scale = this.gridViewHelper.getMonkeyBaseScale();
    };

    WorldView.prototype.fallDown = function (changeSet, callback) {
        var callbacks = 0;

        function itIsOver() {
            if (--callbacks == 0 && callback)
                callback();
        }

        changeSet.forEach(function (change) {
            this.gridViewHelper.move(this.bodyParts[change.tile], change.newU, change.newV + 10, this.moveSpeed + 10,
                itIsOver);
            callbacks++;

        }, this);
    };

    WorldView.prototype.moveSnake = function (changeSet, callback) {
        var callbacks = 0;

        function itIsOver() {
            if (--callbacks == 0 && callback)
                callback();
        }

        changeSet.forEach(function (change, index, array) {
            if (change.type == 'reversed') {
                this.__reverseSnake(onlyChanged(array));

            } else if (change.type == 'changed') {
                this.gridViewHelper.move(this.bodyParts[change.tile], change.newU, change.newV, this.moveSpeed,
                    itIsOver);
                callbacks++;

            } else if (change.type == 'removed') {
                if (change.tile == 9) {
                    var hash = calcCantorPairing(change.oldU, change.oldV);
                    var forDeletion = this.newParts[hash];
                    forDeletion.remove();
                    delete this.newParts[hash];
                } else {
                    this.bodyParts[change.tile].remove();
                    delete this.bodyParts[change.tile];
                    if (array.length - 1 == index && callback)
                        callback();
                }

            } else if (change.type == 'new') {
                this.bodyParts[change.tile] = this.gridViewHelper.create(change.newU, change.newV, 'monkey_head');
                if (change.tile - 1 % 20 != 0)
                    this.bodyParts[change.tile - 1].data = this.stage.getGraphic('monkey');
            }
        }, this);
    };

    WorldView.prototype.__reverseSnake = function (changeSetCopy) {
        var head = changeSetCopy.shift();
        var tail = changeSetCopy.pop();
        var temp = this.bodyParts[head.tile];
        this.bodyParts[head.tile] = this.bodyParts[tail.tile];
        this.bodyParts[tail.tile] = temp;
        if (changeSetCopy.length > 1)
            this.__reverseSnake(changeSetCopy);
    };

    WorldView.prototype.undoMove = function (changeSet, callback) {
        var callbacks = 0;

        function itIsOver() {
            if (--callbacks == 0)
                if (callback)
                    callback();
        }

        changeSet.slice().reverse().forEach(function (change, index, array) {
            if (change.type == 'changed') {
                this.gridViewHelper.move(this.bodyParts[change.tile], change.oldU, change.oldV, this.revertSpeed,
                    itIsOver);
                callbacks++;
            } else if (change.type == 'reversed') {
                this.__reverseSnake(onlyChanged(array));

            } else if (change.type == 'removed') {
                if (change.tile == 9) {
                    this.newParts[calcCantorPairing(change.oldU, change.oldV)] = this.gridViewHelper.create(change.oldU,
                        change.oldV, 'monkey_grey');
                } else {
                    this.bodyParts[change.tile] = this.gridViewHelper.create(change.oldU, change.oldV, 'monkey');
                    if (array.length - 1 == index && callback)
                        callback();
                }

            } else if (change.type == 'new') {
                var forRemoval = this.bodyParts[change.tile];
                this.bodyParts[change.tile - 1].data = this.stage.getGraphic('monkey_head');
                forRemoval.remove();
                delete this.bodyParts[change.tile];
            }
        }, this);
    };

    function onlyChanged(changeSet) {
        return changeSet.filter(function (change) {
            return change.type == 'changed';
        });
    }

    WorldView.prototype.flashHighlightSnake = function (snake, callback) {
        var counter = 0;

        function getCallbackWithCounter(callback) {
            counter++;
            return function () {
                if (--counter === 0 && callback) {
                    counter = 0;
                    callback();
                }
            };
        }

        snake.forEach(function (tile) {
            var drawable = this.bodyParts[tile.type];
            var dep = [drawable];
            var white = this.stage.createImage('monkey_white').setPosition(wrap(drawable, 'x'), wrap(drawable, 'y'),
                dep).setZIndex(6).setScale(drawable.scale);
            var black = this.stage.createImage('monkey_black').setZIndex(7).setPosition(wrap(drawable, 'x'),
                wrap(drawable, 'y'), dep).setAlpha(0).setScale(drawable.scale);
            black.opacityPattern([
                {
                    value: 1,
                    duration: this.flashFadeInSpeed,
                    easing: Transition.LINEAR
                }, {
                    value: 0,
                    duration: this.flashFadeOutSpeed,
                    easing: Transition.LINEAR
                }
            ], true);
            var myCallback = getCallbackWithCounter(callback);
            var self = this;
            this.timer.doLater(function () {
                white.remove();
                black.remove();
                myCallback();
            }, this.flashDuration);
        }, this);
    };

    WorldView.prototype.highlightSpikes = function (spikes, callback) {
        var counter = 0;

        function getCallbackWithCounter(callback) {
            counter++;
            return function () {
                if (--counter === 0 && callback) {
                    counter = 0;
                    if (callback)
                        callback();
                }
            };
        }

        spikes.forEach(function (spikeTile) {
            var spike = this.spikes[calcCantorPairing(spikeTile.u, spikeTile.v)];

            function getX() {
                return spike.x;
            }

            function getY() {
                return spike.y;
            }

            var white = this.stage.createImage('spike_white').setPosition(getX, getY,
                [spike]).setZIndex(6).setAlpha(0).setScale(spike.scale);
            white.opacityPattern([
                {
                    value: 1,
                    duration: this.highlightFadeInSpeed,
                    easing: Transition.LINEAR
                }, {
                    value: 0,
                    duration: this.highlightFadeOutSpeed,
                    easing: Transition.LINEAR,
                    callback: getCallbackWithCounter(callback)
                }
            ]);
        }, this);
    };

    return WorldView;
})(calcCantorPairing, iterateEntries, Transition, wrap);