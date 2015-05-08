var GameScreen = (function () {
    "use strict";

    function GameScreen(services) {
        this.stage = services.stage;
        this.timer = services.timer;
        this.device = services.device;
        this.events = services.events;
    }

    GameScreen.prototype.show = function (next) {
        var level = Level[1];
        var world = PlayFactory.createWorld(this.stage, this.timer, this.device, level);
        world.init();
        var playerController = PlayFactory.createPlayerController(world);
        var pointerHandler = this.events.subscribe(Event.POINTER, function (pointer) {
            if (pointer.type == 'down')
                playerController.handlePointer(pointer.x, pointer.y);
        });

    };

    return GameScreen;
})();