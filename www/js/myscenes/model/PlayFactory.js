var PlayFactory = (function (Grid, GridHelper, GridViewHelper, DomainGridHelper, World, WorldView,
    PlayerController) {

    "use strict";

    return {
        createWorld: function (stage, timer, device, level, gameOverCallback) {
            var grid = new Grid(level);
            var gridHelper = new GridHelper(grid, grid.xTiles, grid.yTiles);
            var gridViewHelper = new GridViewHelper(stage, timer, device, grid.xTiles, grid.yTiles);
            var domainGridHelper = new DomainGridHelper(gridHelper, grid, grid.xTiles, grid.yTiles);
            var worldView = new WorldView(stage, gridViewHelper);
            return new World(worldView, grid, gridHelper, domainGridHelper, gridViewHelper, gameOverCallback);
        },
        createPlayerController: function (world) {
            return new PlayerController(world, world.gridViewHelper, world.gridHelper, world.worldView);
        }
    };
})(Grid, GridHelper, GridViewHelper, DomainGridHelper, World, WorldView, PlayerController);