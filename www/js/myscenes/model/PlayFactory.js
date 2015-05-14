var PlayFactory = (function (Level, Grid, GridHelper, GridViewHelper, DomainGridHelper, World, WorldView,
    PlayerController) {

    "use strict";

    return {
        createWorld: function (stage, timer, device, level) {
            var grid = new Grid(level);
            var gridHelper = new GridHelper(grid, grid.xTiles, grid.yTiles);
            var gridViewHelper = new GridViewHelper(stage, timer, device, grid.xTiles, grid.yTiles);
            var domainGridHelper = new DomainGridHelper(gridHelper, grid, grid.xTiles, grid.yTiles);
            var worldView = new WorldView(stage, gridViewHelper);
            return new World(worldView, grid, gridHelper, domainGridHelper, gridViewHelper);
        },
        createPlayerController: function (world) {
            return new PlayerController(world, world.gridViewHelper, world.gridHelper);
        }
    };
})(Level, Grid, GridHelper, GridViewHelper, DomainGridHelper, World, WorldView, PlayerController);