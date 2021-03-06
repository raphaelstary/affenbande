var GridViewHelper = (function (Height, Transition, Math) {
    "use strict";

    function GridViewHelper(stage, timer, device, xTilesCount, yTilesCount, topOffset) {
        this.stage = stage;
        this.timer = timer;
        this.device = device;
        this.xTiles = xTilesCount;
        this.yTiles = yTilesCount;
        this.topOffset = topOffset;

        this.monkeyBaseScale = 1;
    }

    GridViewHelper.prototype.getCoordinates = function (x, y) {

        var length = this.__edgeLength(this.device.height);
        return {
            u: Math.floor((x - this.__xOffset(this.device.width, length) + length / 2) / length),
            v: Math.floor((y - this.__getTopOffset(this.device.height)) / length)
        };
    };

    GridViewHelper.prototype.getPosition = function (u, v) {
        return {
            x: this.__getX(u)(this.device.width, this.device.height),
            y: this.__getY(v)(this.device.height)
        };
    };

    GridViewHelper.prototype.create = function (u, v, name) {
        var drawable = this.stage.createImage(name).setPosition(this.__getX(u), this.__getY(v)).setZIndex(4);
        if (name == 'monkey' || name == 'monkey_head' || name == 'monkey_white' || name == 'monkey_black') {
            drawable.scale = this.__calcBaseScale(drawable.getHeight() * 0.9);
            this.monkeyBaseScale = drawable.scale;
        } else {
            drawable.scale = this.__calcBaseScale(drawable.getHeight());
        }
        return drawable;
    };

    GridViewHelper.prototype.createBackground = function (u, v, name, zIndex) {
        var drawable = this.stage.createImage(name).setPosition(this.__getX(u), this.__getY(v)).setZIndex(zIndex);
        if (name == 'tree_up' || name == 'tree_down') {
            drawable.scale = this.__calcBaseScale(drawable.getHeight()) * 1.1;
        } else if (name == 'tree_small') {
            drawable.scale = this.__calcBaseScale(drawable.getHeight()) * 0.75;
        } else {
            drawable.scale = this.__calcBaseScale(drawable.getHeight());
        }
        return drawable;
    };

    GridViewHelper.prototype.__calcBaseScale = function (drawableHeight) {
        var length = this.__edgeLength(this.device.height);
        return length / drawableHeight;
    };

    GridViewHelper.prototype.createRect = function (u, v, color) {
        var self = this;

        function getWidth(width, height) {
            return self.__edgeLength(height);
        }

        return this.stage.createRectangle(true).setPosition(this.__getX(u),
            this.__getY(v)).setWidth(getWidth).setHeight(this.__edgeLength.bind(this)).setColor(color);
    };

    GridViewHelper.prototype.move = function (drawable, u, v, speed, callback) {
        return drawable.moveTo(this.__getX(u), this.__getY(v)).setDuration(speed).setCallback(callback);
    };

    GridViewHelper.prototype.__edgeLength = function (height) {
        return Height.get(this.yTiles)(height - this.__getTopOffset(height));
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
            return v * length + Math.floor(length / 2) + self.__getTopOffset(height);
        };
    };

    GridViewHelper.prototype.__getTopOffset = function (height) {
        return this.topOffset(height);
    };

    GridViewHelper.prototype.getMonkeyBaseScale = function () {
        return this.monkeyBaseScale;
    };

    return GridViewHelper;
})(Height, Transition, Math);