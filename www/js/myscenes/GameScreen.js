var GameScreen = (function (Level, PlayFactory, Event) {
    "use strict";

    function GameScreen(services) {
        this.stage = services.stage;
        this.timer = services.timer;
        this.device = services.device;
        this.events = services.events;
        this.sceneStorage = services.sceneStorage;
    }

    GameScreen.prototype.show = function (next) {
        var level = Level[this.sceneStorage.currentLevel];
        var self = this;
        var world = PlayFactory.createWorld(this.stage, this.timer, this.device, level, function () {
            console.log('IT IS OVER :)');
            self.timer.doLater(nextScene, 30);
        });
        world.init();
        var playerController = PlayFactory.createPlayerController(world);
        var pointerHandler = this.events.subscribe(Event.POINTER, function (pointer) {
            if (pointer.type == 'down')
                playerController.handlePointerDown(pointer.x, pointer.y);
            if (pointer.type == 'up')
                playerController.handlePointerUp(pointer.x, pointer.y);
            if (pointer.type == 'move')
                playerController.handlePointerMove(pointer.x, pointer.y);
        });

        var itIsOver = false;

        function nextScene() {
            if (itIsOver)
                return;
            itIsOver = true;

            self.events.unsubscribe(pointerHandler);
            world.worldView.preDestroy();

            next();
        }
    };

    return GameScreen;
})(Level, PlayFactory, Event);