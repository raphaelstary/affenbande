var WorldView = (function (calcCantorPairing) {
    "use strict";

    function WorldView(gridViewHelper) {
        this.gridViewHelper = gridViewHelper;

        this.newParts = {};
        this.ground = [];
        this.spikes = [];
        this.snake = {};
    }

    WorldView.prototype.drawLevel = function (snakes, groundTiles, newParts, spikes) {
        groundTiles.forEach(function (ground) {
            this.ground.push(this.gridViewHelper.createRect(ground.u, ground.v, 'brown'));
        }, this);

        newParts.forEach(function (newPart) {
            this.newParts[calcCantorPairing(newPart.u, newPart.v)] = this.gridViewHelper.createRect(newPart.u,
                newPart.v, 'grey');
        }, this);

        snakes.forEach(function (snakeParts) {
            snakeParts.forEach(function (part) {
                this.snake[part.type] = this.gridViewHelper.createRect(part.u, part.v, 'green');
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
                this.__reverseSnake(array.slice(index + 1));

            } else if (change.type == 'changed') {
                this.gridViewHelper.move(this.snake[change.tile], change.newU, change.newV, 30, itIsOver);
                callbacks++;
            } else if (change.type == 'removed') {

            } else if (change.type == 'new') {

            }
        }, this);
    };

    WorldView.prototype.__reverseSnake = function (changeSetCopy) {
        var head = changeSetCopy.shift();
        var tail = changeSetCopy.pop();
        var temp = this.snake[head.tile];
        this.snake[head.tile] = this.snake[tail.tile];
        this.snake[tail.tile] = temp;
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
                this.gridViewHelper.move(this.snake[change.tile], change.oldU, change.oldV, 10, itIsOver);
                callbacks++;
            } else if (change.type == 'reversed') {
                this.__reverseSnake(array.slice(0, index));
            }
        }, this);
    };

    return WorldView;
})(calcCantorPairing);