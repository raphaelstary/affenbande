var WorldView = (function () {
    "use strict";

    function WorldView(gridViewHelper) {
        this.gridViewHelper = gridViewHelper;

        this.newParts = [];
        this.ground = [];
        this.spikes = [];
        this.snake = {};
    }

    WorldView.prototype.drawLevel = function (snakes, groundTiles, newParts, spikes) {
        groundTiles.forEach(function (ground) {
            this.ground.push(this.gridViewHelper.createRect(ground.u, ground.v, 'brown'));
        }, this);

        newParts.forEach(function (newPart) {
            this.newParts.push(this.gridViewHelper.createRect(newPart.u, newPart.v, 'grey'));
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

        changeSet.forEach(function (change) {
            if (change.type == 'changed') {
                this.gridViewHelper.move(this.snake[change.tile], change.newU, change.newV, 30, itIsOver);
                callbacks++;
            }
        }, this);
    };

    WorldView.prototype.undoMove = function (changeSet, callback) {
        var callbacks = 0;

        function itIsOver() {
            if (--callbacks == 0)
                if (callback)
                    callback();
        }

        changeSet.forEach(function (change) {
            if (change.type == 'changed') {
                this.gridViewHelper.move(this.snake[change.tile], change.oldU, change.oldV, 10, itIsOver);
                callbacks++;
            }
        }, this);
    };

    return WorldView;
})();