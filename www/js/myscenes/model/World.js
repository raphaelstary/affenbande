var World = (function () {
    "use strict";

    function World(worldView, grid, gridHelper, domainGridHelper, gridViewHelper) {
        this.worldView = worldView;
        this.grid = grid;
        this.gridHelper = gridHelper;
        this.domainGridHelper = domainGridHelper;
        this.gridViewHelper = gridViewHelper;

        this.history = [];
    }

    World.prototype.init = function () {
        this.updateModel();
        this.worldView.drawLevel(this.snake, this.ground, this.newParts);
    };

    World.prototype.updateModel = function () {
        this.snake = this.domainGridHelper.getSnake();
        this.head = this.snake[0];
        this.ground = this.domainGridHelper.getGround();
        this.newParts = this.domainGridHelper.getNewParts();
    };

    World.prototype.moveSnakeLeft = function (callback) {
        this.__moveSnake(this.head.u - 1, this.head.v, callback);
    };

    World.prototype.moveSnakeRight = function (callback) {
        this.__moveSnake(this.head.u + 1, this.head.v, callback);
    };

    World.prototype.moveSnakeTop = function (callback) {
        this.__moveSnake(this.head.u, this.head.v - 1, callback);
    };

    World.prototype.moveSnakeBottom = function (callback) {
        this.__moveSnake(this.head.u, this.head.v + 1, callback);
    };

    World.prototype.__moveSnake = function (u, v, callback) {
        if (!this.domainGridHelper.canSnakeMove(this.snake, u, v))
            return;

        var self = this;

        function extendedCallback() {
            if (!self.domainGridHelper.hasSnakeGround(self.snake)) {
                var lastChangeSet = self.history.pop();
                self.domainGridHelper.undo(lastChangeSet);
                self.updateModel();
                self.worldView.undoMove(lastChangeSet, callback);
            } else {
                if (callback)
                    callback();
            }
        }

        var changeSet = this.domainGridHelper.moveSnake(this.snake, u, v);
        this.history.push(changeSet);
        this.worldView.moveSnake(changeSet, extendedCallback);
    };

    World.prototype.getHeadCoordinates = function () {
        return this.head;
    };

    return World;
})();