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
        this.snake = this.domainGridHelper.getSnake();
        this.head = this.snake[0];
        this.ground = this.domainGridHelper.getGround();
        this.newParts = this.domainGridHelper.getNewParts();
        this.worldView.drawLevel(this.snake, this.ground, this.newParts);
    };

    World.prototype.moveSnakeLeft = function () {
        this.__moveSnake(this.head.u - 1, this.head.v);
    };

    World.prototype.moveSnakeRight = function () {
        this.__moveSnake(this.head.u + 1, this.head.v);
    };

    World.prototype.moveSnakeTop = function () {
        this.__moveSnake(this.head.u, this.head.v - 1);
    };

    World.prototype.moveSnakeBottom = function () {
        this.__moveSnake(this.head.u, this.head.v + 1);
    };

    World.prototype.__moveSnake = function (u, v) {
        if (!this.domainGridHelper.canSnakeMove(this.snake, u, v))
            return;

        var changeSet = this.domainGridHelper.moveSnake(this.snake, u, v);
        this.history.push(changeSet);
        this.worldView.moveSnake(changeSet);
    };

    World.prototype.getHeadCoordinates = function () {
        return this.head;
    };

    return World;
})();