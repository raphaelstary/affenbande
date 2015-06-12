var GridViewHelper = (function (Height, Transition, Math) {
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
            u: Math.floor((x - this.__xOffset(this.device.width, length) + length / 2) / length),
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
        return this.stage.drawFresh(this.__getX(u), this.__getY(v), name, 4);
    };

    GridViewHelper.prototype.createBackground = function (u, v, name, zIndex, scale) {
        return this.stage.drawFresh(this.__getX(u), this.__getY(v), name, zIndex, undefined, undefined, undefined,
            scale);
    };

    GridViewHelper.prototype.createRect = function (u, v, color) {
        var self = this;

        function getWidth(width, height) {
            return self.__edgeLength(height);
        }

        return this.stage.drawRectangle(this.__getX(u), this.__getY(v), getWidth, this.__edgeLength.bind(this), color,
            true);
    };

    GridViewHelper.prototype.move = function (drawable, u, v, speed, callback) {
        return this.stage.move(drawable, this.__getX(u), this.__getY(v), speed, Transition.LINEAR, false, callback)
    };

    GridViewHelper.prototype.__edgeLength = function (height) {
        return Height.get(this.yTiles)(height);
    };

    GridViewHelper.prototype.__xOffset = function (width, length) {
        return Math.floor(width / 2 - length * this.xTiles / 2 + length / 2);
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
            return v * length + Math.floor(length / 2);
        };
    };

    return GridViewHelper;
})(Height, Transition, Math);