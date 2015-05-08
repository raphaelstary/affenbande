var GridViewHelper = (function (Width, Height, Transition, Math) {
    "use strict";

    function GridViewHelper(stage, timer, device, xTilesCount, yTilesCount) {
        this.stage = stage;
        this.timer = timer;
        this.device = device;
        this.xTiles = xTilesCount;
        this.yTiles = yTilesCount;
    }

    GridViewHelper.prototype.getCoordinates = function (x, y) {
        var length = this.__edgeLength(this.device.height);
        return {
            u: Math.floor(x / length) - this.__xOffset(this.device.width, length),
            v: Math.floor(y / length)
        };
    };

    GridViewHelper.prototype.getPosition = function (u, v) {
        return {
            x: this.__getX(u)(this.device.width, this.device.height),
            y: this.__getY(v)(this.device.height)
        };
    };

    GridViewHelper.prototype.create = function (u, v, name) {
        return this.stage.drawFresh(this.__getX(u), this.__getY(v), name);
    };

    GridViewHelper.prototype.createRect = function (u, v, color) {
        var self = this;

        function getWidth(width, height) {
            return self.__edgeLength(height);
        }

        return this.stage.drawRectangle(this.__getX(u), this.__getY(v), getWidth, this.__edgeLength.bind(this), color,
            true);
    };

    GridViewHelper.prototype.move = function (drawable, u, v) {
        return this.stage.move(drawable, this.__getX(u), this.__getY(v), 30, Transition.LINEAR)
    };

    GridViewHelper.prototype.__edgeLength = function (height) {
        return Height.get(this.yTiles)(height);
    };

    GridViewHelper.prototype.__xOffset = function (width, length) {
        return Width.HALF(width) - length * Math.floor(this.xTiles / 2);
    };

    GridViewHelper.prototype.__getX = function (u) {
        var self = this;
        return function (width, height) {
            var length = self.__edgeLength(height);
            var start = self.__xOffset(width, length);
            return start + u * length;
        };
    };

    GridViewHelper.prototype.__getY = function (v) {
        var self = this;
        return function (height) {
            var length = self.__edgeLength(height);
            return v * length;
        };
    };

    return GridViewHelper;
})(Width, Height, Transition, Math);