var GameScreen = (function () {
    "use strict";

    function GameScreen(services) {
        this.stage = services.stage;
        this.timer = services.timer;
        this.device = services.device;
    }

    GameScreen.prototype.show = function (next) {
        var level = Level[1];
        var world = PlayFactory.createWorld(this.stage, this.timer, this.device, level);
        world.drawLevel();
    };

    return GameScreen;
})();