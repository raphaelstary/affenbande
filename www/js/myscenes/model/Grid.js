var Grid = (function () {
    "use strict";

    function Grid(level) {
        this.map = [];
        for (var y = 0; y < level.length; y++) {
            var levelRow = level[y];
            var row = [];
            for (var x = 0; x < levelRow.length; x++) {
                row.push(levelRow[x]);
            }
            this.map.push(row);
        }

        this.xTiles = level[0].length;
        this.yTiles = level.length;
    }

    Grid.prototype.get = function (u, v) {
        if (u < 0 || u >= this.xTiles || v < 0 || v >= this.yTiles)
            return;
        return this.map[v][u];
    };

    Grid.prototype.set = function (u, v, load) {
        this.map[v][u] = load;
    };

    return Grid;
})();