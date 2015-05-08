var PlayerController = (function () {
    "use strict";

    function PlayerController(world, gridViewHelper, gridHelper) {
        this.world = world;
        this.gridViewHelper = gridViewHelper;
        this.gridHelper = gridHelper;
    }

    PlayerController.prototype.handlePointer = function (x, y) {
        var target = this.gridViewHelper.getCoordinates(x, y);
        var snakeHead = this.world.getHeadCoordinates();
        if (this.gridHelper.isNeighbor(target.u, target.v, snakeHead.u, snakeHead.v)) {
            if (snakeHead.u == target.u + 1) {
                this.world.moveSnakeLeft();
            } else if (snakeHead.u == target.u - 1) {
                this.world.moveSnakeRight();
            } else if (snakeHead.v == target.v + 1) {
                this.world.moveSnakeTop();
            } else if (snakeHead.v == target.v - 1) {
                this.world.moveSnakeBottom();
            }
        }
    };

    return PlayerController;
})();