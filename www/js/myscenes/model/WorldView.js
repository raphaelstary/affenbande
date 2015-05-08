var WorldView = (function () {
    "use strict";

    function WorldView(gridViewHelper) {
        this.gridViewHelper = gridViewHelper;

        this.newParts = [];
        this.ground = [];
        this.snake = [];
    }

    WorldView.prototype.drawLevel = function (snakeParts, groundTiles, newParts) {
        groundTiles.forEach(function (ground) {
            this.ground.push(this.gridViewHelper.createRect(ground.u, ground.v, 'brown'));
        }, this);

        newParts.forEach(function (newPart) {
            this.newParts.push(this.gridViewHelper.createRect(newPart.u, newPart.v, 'grey'));
        }, this);

        snakeParts.forEach(function (part) {
            this.snake.push(this.gridViewHelper.createRect(part.u, part.v, 'green'));
        }, this);
    };

    return WorldView;
})();