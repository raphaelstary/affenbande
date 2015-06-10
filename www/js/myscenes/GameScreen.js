var GameScreen = (function (Level, PlayFactory, Event, drawIcons, ScreenShaker) {
    "use strict";

    function GameScreen(services) {
        this.stage = services.stage;
        this.timer = services.timer;
        this.device = services.device;
        this.events = services.events;
        this.sceneStorage = services.sceneStorage;
        this.buttons = services.buttons;
        this.messages = services.messages;
        this.sounds = services.sounds;
        this.tap = services.tap;
    }

    GameScreen.prototype.show = function (next) {
        var self = this;
        var drawables = [];
        var taps = [];
        var buttons = [];
        var icons = drawIcons(self.stage, self.sceneStorage, self.events, self.buttons, self.messages, self.device,
            self.sounds, self.tap, true);

        icons.drawables.forEach(function (elem) {
            drawables.push(elem);
        });
        icons.taps.forEach(function (elem) {
            taps.push(elem);
        });

        function getButtonWidth(width, height) {
            if (width < height) {
                return Width.get(32, 7)(width);
            }
            return Width.get(32, 4)(width);
        }

        var back = self.buttons.createPrimaryButton(Width.get(32, 7), Height.get(48, 2),
            self.messages.get('play', 'back_to_map'), function () {
                self.timer.doLater(nextScene, 6);
            }, 3, false, getButtonWidth);
        back.background.scale = 0.75;
        buttons.push(back);
        var undo = self.buttons.createPrimaryButton(Width.HALF, Height.get(48, 2), self.messages.get('play', 'undo'),
            function () {
                undo.used = true;
                if (!world.undoLastMove(function () {
                        undo.background.alpha = 0.5;
                        undo.used = false;
                    })) {
                    undo.background.alpha = 0.5;
                    undo.used = false;
                    shaker.startSmallShake();
                }
            }, 3, true, getButtonWidth);
        buttons.push(undo);
        undo.background.scale = 0.9;
        undo.reset = false;
        var shaker = new ScreenShaker(self.device);
        var shakerResizeId = self.events.subscribe(Event.RESIZE, shaker.resize.bind(shaker));
        var shakerTickId = self.events.subscribe(Event.TICK_MOVE, shaker.update.bind(shaker));
        shaker.add(undo.background);
        shaker.add(undo.text);

        var level = Level[this.sceneStorage.currentLevel];
        var world = PlayFactory.createWorld(this.stage, this.timer, this.device, level, function () {
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
            self.events.unsubscribe(shakerTickId);
            self.events.unsubscribe(shakerResizeId);
            world.worldView.preDestroy();
            taps.forEach(self.tap.remove.bind(self.tap));
            drawables.forEach(self.stage.remove.bind(self.stage));
            buttons.forEach(self.buttons.remove.bind(self.buttons));

            next();
        }
    };

    return GameScreen;
})(Level, PlayFactory, Event, drawIcons, ScreenShaker);