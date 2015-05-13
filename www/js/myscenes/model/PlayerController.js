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
        var foundSmth = false;
        this.world.heads.forEach(function (snakeHead) {
            if (foundSmth)
                return;

            if (this.gridHelper.isNeighbor(target.u, target.v, snakeHead.u, snakeHead.v)) {
                if (snakeHead.u == target.u + 1) {
                    foundSmth = this.world.moveSnakeLeft(snakeHead, myCallback);
                } else if (snakeHead.u == target.u - 1) {
                    foundSmth = this.world.moveSnakeRight(snakeHead, myCallback);
                } else if (snakeHead.v == target.v + 1) {
                    foundSmth = this.world.moveSnakeTop(snakeHead, myCallback);
                } else if (snakeHead.v == target.v - 1) {
                    foundSmth = this.world.moveSnakeBottom(snakeHead, myCallback);
                }
            }
        }, this);

        if (!foundSmth)
            this.moving = false;
    };

    return PlayerController;
})();