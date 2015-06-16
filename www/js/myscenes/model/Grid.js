var Grid = (function () {
    "use strict";

    function Grid(level) {
        this.map = [];
        var foreground = level.front;
        for (var y = 0; y < foreground.length; y++) {
            var levelRow = foreground[y];
            var row = [];
            for (var x = 0; x < levelRow.length; x++) {
                row.push(levelRow[x]);
            }
            this.map.push(row);
        }

        this.xTiles = foreground[0].length;
        this.yTiles = foreground.length;

        this.backgroundMap = [];
        var background = level.back;
        for (y = 0; y < background.length; y++) {
            levelRow = background[y];
            row = [];
            for (x = 0; x < levelRow.length; x++) {
                row.push(levelRow[x]);
            }
            this.backgroundMap.push(row);
        }
    }

    Grid.prototype.get = function (u, v) {
        if (u < 0 || u >= this.xTiles || v < 0 || v >= this.yTiles)
            return;
        return this.map[v][u];
    };

    Grid.prototype.getBackground = function (u, v) {
        if (u < 0 || u >= this.xTiles || v < 0 || v >= this.yTiles)
            return;
        return this.backgroundMap[v][u];
    };

    Grid.prototype.set = function (u, v, load) {
        this.map[v][u] = load;
    };

    return Grid;
})();