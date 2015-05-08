var World = (function () {
    "use strict";

    function World(worldView, grid, gridHelper, domainGridHelper, gridViewHelper) {
        this.worldView = worldView;
        this.grid = grid;
        this.gridHelper = gridHelper;
        this.domainGridHelper = domainGridHelper;
        this.gridViewHelper = gridViewHelper;
    }

    World.prototype.init = function () {
        this.snake = this.domainGridHelper.getSnake();
        this.ground = this.domainGridHelper.getGround();
        this.newParts = this.domainGridHelper.getNewParts();
        this.worldView.drawLevel(this.snake, this.ground, this.newParts);
    };

    World.prototype.moveSnakeLeft = function () {

    };

    World.prototype.moveSnakeRight = function () {

    };

    World.prototype.moveSnakeTop = function () {

    };

    World.prototype.moveSnakeBottom = function () {

    };

    World.prototype.getHeadCoordinates = function () {
        return this.snake[0];
    };

    return World;
})();