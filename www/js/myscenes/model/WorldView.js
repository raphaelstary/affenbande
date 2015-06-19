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
            this.stage.remove(part);
        }, this);
        iterateEntries(this.bodyParts, function (part) {
            this.stage.remove(part);
        }, this);
        this.ground.forEach(function (tile) {
            this.stage.remove(tile);
        }, this);
        iterateEntries(this.spikes, function (part) {
            this.stage.remove(part);
        }, this);
        this.stage.remove(this.goal);
        this.tree.forEach(this.stage.remove.bind(this.stage));
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
                    this.stage.remove(forDeletion);
                    delete this.newParts[hash];
                } else {
                    this.stage.remove(this.bodyParts[change.tile]);
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
                this.stage.remove(forRemoval);
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
            var white = this.stage.drawFresh(wrap(drawable, 'x'), wrap(drawable, 'y'), 'monkey_white', 6, dep);
            white.scale = drawable.scale;
            var black = this.stage.drawFresh(wrap(drawable, 'x'), wrap(drawable, 'y'), 'monkey_black', 7, dep, 0);
            black.scale = drawable.scale;
            this.stage.animateAlphaPattern(black, [
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
                self.stage.remove(white);
                self.stage.remove(black);
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

            var white = this.stage.drawFresh(getX, getY, 'spike_white', 6, [spike], 0);
            white.scale = spike.scale;
            this.stage.animateAlphaPattern(white, [
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