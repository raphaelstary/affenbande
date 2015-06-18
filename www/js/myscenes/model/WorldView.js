var WorldView = (function (calcCantorPairing, iterateEntries) {
    "use strict";

    function WorldView(stage, gridViewHelper) {
        this.stage = stage;
        this.gridViewHelper = gridViewHelper;

        this.newParts = {};
        this.ground = [];
        this.spikes = [];
        this.bodyParts = {};

        this.tree = [];

        this.moveSpeed = 10;
        this.revertSpeed = 10;
    }

    var colors = ['green', 'lightgreen', 'darkgreen', 'blue', 'lightblue', 'darkblue'];

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
        this.spikes.forEach(function (tile) {
            this.stage.remove(tile);
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

        snakes.forEach(function (snakeParts, index) {
            snakeParts.forEach(function (part) {
                this.bodyParts[part.type] = this.gridViewHelper.create(part.u, part.v, 'monkey');
            }, this);
        }, this);

        spikes.forEach(function (spike) {
            this.spikes.push(this.gridViewHelper.create(spike.u, spike.v, 'spike'));
        }, this);

        this.goal = this.gridViewHelper.create(goal.u, goal.v, 'coconut');

        treeUpTiles.forEach(function (treeUpTile) {
            this.tree.push(this.gridViewHelper.createBackground(treeUpTile.u, treeUpTile.v, 'tree_up', 3));
        }, this);

        treeDownTiles.forEach(function (treeDownTile) {
            this.tree.push(this.gridViewHelper.createBackground(treeDownTile.u, treeDownTile.v, 'tree_down', 3));
        }, this);

        treeSmallTiles.forEach(function (treeSmallTile) {
            this.tree.push(this.gridViewHelper.createBackground(treeSmallTile.u, treeSmallTile.v, 'tree_small', 2));
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
                this.bodyParts[change.tile] = this.gridViewHelper.create(change.newU, change.newV, 'monkey');
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

    return WorldView;
})(calcCantorPairing, iterateEntries);