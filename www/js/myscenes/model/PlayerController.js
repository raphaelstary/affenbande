var PlayerController = (function () {
    "use strict";

    function PlayerController(world, gridViewHelper, gridHelper, worldView) {
        this.world = world;
        this.gridViewHelper = gridViewHelper;
        this.gridHelper = gridHelper;
        this.worldView = worldView;

        this.pressedHead = false;
        this.selectedHead = undefined;

        this.moving = false;
    }

    PlayerController.prototype.handlePointerMove = function (x, y) {
        if (this.moving)
            return;

        if (!this.pressedHead) {
            this.handlePointerDown(x, y);
            if (!this.pressedHead)
                return;
        }

        var self = this;

        function myCallback() {
            self.moving = false;
        }

        var target = this.gridViewHelper.getCoordinates(x, y);
        var newHead;
        if (this.gridHelper.isNeighbor(target.u, target.v, this.selectedHead.u, this.selectedHead.v)) {
            if (this.selectedHead.u == target.u + 1) {
                newHead = this.world.moveSnakeLeft(this.selectedHead, myCallback);
            } else if (this.selectedHead.u == target.u - 1) {
                newHead = this.world.moveSnakeRight(this.selectedHead, myCallback);
            } else if (this.selectedHead.v == target.v + 1) {
                newHead = this.world.moveSnakeTop(this.selectedHead, myCallback);
            } else if (this.selectedHead.v == target.v - 1) {
                newHead = this.world.moveSnakeBottom(this.selectedHead, myCallback);
            }
            if (newHead) {
                this.moving = true;
                this.worldView.deselectHead(this.selectedHead);
                this.selectedHead = newHead;
                this.worldView.selectHead(this.selectedHead);
            }
        }
    };

    PlayerController.prototype.handlePointerUp = function (x, y) {
        if (!this.pressedHead)
            return;

        this.pressedHead = false;
        this.worldView.deselectHead(this.selectedHead);
        this.selectedHead = undefined;
    };

    PlayerController.prototype.handlePointerDown = function (x, y) {
        if (this.pressedHead)
            return;

        var target = this.gridViewHelper.getCoordinates(x, y);
        this.pressedHead = this.world.getHeads().some(function (snakeHead) {
            var isMatch = target.u == snakeHead.u && target.v == snakeHead.v;
            if (isMatch) {
                this.selectedHead = snakeHead;
            }
            return isMatch;
        }, this);

        if (this.pressedHead) {
            this.worldView.selectHead(this.selectedHead);
        }
    };

    return PlayerController;
})();