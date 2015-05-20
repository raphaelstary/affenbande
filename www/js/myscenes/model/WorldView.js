var WorldView = (function (calcCantorPairing) {
    "use strict";

    function WorldView(stage, gridViewHelper) {
        this.stage = stage;
        this.gridViewHelper = gridViewHelper;

        this.newParts = {};
        this.ground = [];
        this.spikes = [];
        this.bodyParts = {};
    }

    var colors = ['green', 'lightgreen', 'darkgreen', 'blue', 'lightblue', 'darkblue'];

    WorldView.prototype.drawLevel = function (snakes, groundTiles, newParts, spikes) {
        groundTiles.forEach(function (ground) {
            this.ground.push(this.gridViewHelper.createRect(ground.u, ground.v, 'brown'));
        }, this);

        newParts.forEach(function (newPart) {
            this.newParts[calcCantorPairing(newPart.u, newPart.v)] = this.gridViewHelper.createRect(newPart.u,
                newPart.v, 'grey');
        }, this);

        snakes.forEach(function (snakeParts, index) {
            snakeParts.forEach(function (part) {
                this.bodyParts[part.type] = this.gridViewHelper.createRect(part.u, part.v, colors[index]);
            }, this);
        }, this);

        spikes.forEach(function (spike) {
            this.spikes.push(this.gridViewHelper.createRect(spike.u, spike.v, 'red'));
        }, this);
    };

    WorldView.prototype.moveSnake = function (changeSet, callback) {
        var callbacks = 0;

        function itIsOver() {
            if (--callbacks == 0)
                if (callback)
                    callback();
        }

        changeSet.forEach(function (change, index, array) {
            if (change.type == 'reversed') {
                this.__reverseSnake(onlyChanged(array));

            } else if (change.type == 'changed') {
                this.gridViewHelper.move(this.bodyParts[change.tile], change.newU, change.newV, 30, itIsOver);
                callbacks++;

            } else if (change.type == 'removed') {
                var hash = calcCantorPairing(change.oldU, change.oldV);
                var forDeletion = this.newParts[hash];
                this.stage.remove(forDeletion);
                delete this.newParts[hash];

            } else if (change.type == 'new') {
                this.bodyParts[change.tile] = this.gridViewHelper.createRect(change.newU, change.newV, 'green');
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
                this.gridViewHelper.move(this.bodyParts[change.tile], change.oldU, change.oldV, 10, itIsOver);
                callbacks++;
            } else if (change.type == 'reversed') {
                this.__reverseSnake(onlyChanged(array));

            } else if (change.type == 'removed') {
                this.newParts[calcCantorPairing(change.oldU, change.oldV)] = this.gridViewHelper.createRect(change.oldU,
                    change.oldV, 'grey');

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
})(calcCantorPairing);