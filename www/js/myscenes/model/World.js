var World = (function () {
    "use strict";

    function World(grid, gridHelper, domainGridHelper, gridViewHelper) {
        this.grid = grid;
        this.gridHelper = gridHelper;
        this.domainGridHelper = domainGridHelper;
        this.gridViewHelper = gridViewHelper;
    }

    World.prototype.drawLevel = function () {
        var groundTiles = this.domainGridHelper.getGround();
        var groundDrawables = [];
        groundTiles.forEach(function (ground) {
            groundDrawables.push(this.gridViewHelper.createRect(ground.u, ground.v, 'brown'));
        }, this);
        var newParts = this.domainGridHelper.getNewParts();
        var newPartDrawables = [];
        newParts.forEach(function (newPart) {
            newPartDrawables.push(this.gridViewHelper.createRect(newPart.u, newPart.v, 'grey'));
        }, this);
        var snakeParts = this.domainGridHelper.getSnake();
        var snakeDrawables = [];
        snakeParts.forEach(function (part) {
            snakeDrawables.push(this.gridViewHelper.createRect(part.u, part.v, 'green'));
        }, this)
    };

    return World;
})();