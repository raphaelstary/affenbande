var PlayerController = (function () {
    "use strict";

    function PlayerController(world, gridViewHelper, gridHelper) {
        this.world = world;
        this.gridViewHelper = gridViewHelper;
        this.gridHelper = gridHelper;

        this.moving = false;
    }

    PlayerController.prototype.handlePointer = function (x, y) {
        if (this.moving)
            return;
        this.moving = true;
        var self = this;

        function myCallback() {
            self.moving = false;
        }

        var target = this.gridViewHelper.getCoordinates(x, y);
        var snakeHead = this.world.getHeadCoordinates();
        if (this.gridHelper.isNeighbor(target.u, target.v, snakeHead.u, snakeHead.v)) {
            if (snakeHead.u == target.u + 1) {
                this.world.moveSnakeLeft(myCallback);
            } else if (snakeHead.u == target.u - 1) {
                this.world.moveSnakeRight(myCallback);
            } else if (snakeHead.v == target.v + 1) {
                this.world.moveSnakeTop(myCallback);
            } else if (snakeHead.v == target.v - 1) {
                this.world.moveSnakeBottom(myCallback);
            } else {
                this.moving = false;
            }
        } else {
            this.moving = false;
        }
    };

    return PlayerController;
})();