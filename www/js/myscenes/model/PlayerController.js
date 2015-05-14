var PlayerController = (function () {
    "use strict";

    function PlayerController(world, gridViewHelper, gridHelper) {
        this.world = world;
        this.gridViewHelper = gridViewHelper;
        this.gridHelper = gridHelper;

        this.doing = false;
    }

    PlayerController.prototype.handlePointer = function (x, y) {
        if (this.doing)
            return;
        this.doing = true;
        var self = this;

        function myCallback() {
            self.doing = false;
        }

        var target = this.gridViewHelper.getCoordinates(x, y);

        if (target.u == 0 && target.v == 0) {
            this.doing = true;
            var success = this.world.undoLastMove(myCallback);
            if (!success) {
                this.doing = false;
            }
            return;
        }

        var foundSmth = false;
        this.world.getHeads().forEach(function (snakeHead) {
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
            this.doing = false;
    };

    return PlayerController;
})();