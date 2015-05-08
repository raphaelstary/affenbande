var GridHelper = (function (Math) {
    "use strict";

    function GridHelper(grid, xTiles, yTiles) {
        this.grid = grid;
        this.xTiles = xTiles;
        this.yTiles = yTiles;
    }

    GridHelper.prototype.getNeighbors = function (u, v) {
        var neighbors = [];
        var n1 = this.grid.get(u, v + 1);
        if (n1)
            neighbors.push({
                u: u,
                v: v + 1,
                type: n1
            });
        var n2 = this.grid.get(u + 1, v);
        if (n2)
            neighbors.push({
                u: u + 1,
                v: v,
                type: n2
            });
        var n3 = this.grid.get(u, v - 1);
        if (n3)
            neighbors.push({
                u: u,
                v: v - 1,
                type: n3
            });
        var n4 = this.grid.get(u - 1, v);
        if (n4)
            neighbors.push({
                u: u - 1,
                v: v,
                type: n4
            });

        return neighbors;
    };

    GridHelper.prototype.getBottomNeighbor = function (u, v) {
        var n1 = this.grid.get(u, v + 1);
        if (n1)
            return {
                u: u,
                v: v + 1,
                type: n1
            };
    };

    GridHelper.prototype.getBottomNeighbors = function (tiles) {
        var neighbors = [];
        tiles.forEach(function (tile) {
            var bottom = this.getBottomNeighbor(tile.u, tile.v);
            if (bottom)
                neighbors.push(bottom);
        }, this);
        return neighbors;
    };

    GridHelper.prototype.isNeighbor = function (a_u, a_v, b_u, b_v) {
        var deltaX = Math.abs(a_u - b_u);
        if (deltaX > 1)
            return false;
        var deltaY = Math.abs(a_v - b_v);
        if (deltaY > 1 || deltaX + deltaY > 1)
            return false;
        var neighbor = this.grid.get(b_u, b_v);
        return neighbor !== undefined;
    };

    return GridHelper;
})(Math);