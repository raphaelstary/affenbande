var LevelOverview = (function (drawIcons, drawClouds, Width, Height, GameScreen) {
    "use strict";

    function LevelOverview(services) {
        this.stage = services.stage;
        this.tap = services.tap;
        this.sceneStorage = services.sceneStorage;
        this.events = services.events;
        this.buttons = services.buttons;
        this.messages = services.messages;
        this.device = services.device;
        this.sounds = services.sounds;
        this.timer = services.timer;
        this.levels = services.levels;
    }

    LevelOverview.prototype.show = function (next) {
        var self = this;
        var taps;
        var drawables;

        function initScene() {
            taps = [];
            drawables = [];

            drawClouds(self.stage).forEach(function (elem) {
                drawables.push(elem);
            });

            var icons = drawIcons(self.stage, self.sceneStorage, self.events, self.buttons, self.messages, self.device,
                self.sounds, self.tap);

            icons.drawables.forEach(function (elem) {
                drawables.push(elem);
            });
            icons.taps.forEach(function (elem) {
                taps.push(elem);
            });

            for (var i = 1; i <= 20; i++) {
                createLevelDrawable(i);
            }
        }

        function deconstructScene() {
            drawables.forEach(self.stage.remove.bind(self.stage));
            taps.forEach(self.tap.remove.bind(self.tap));
        }

        function createLevelDrawable(levelNr) {
            function getCoconutWidth(width, height) {
                return Height.get(40)(height);
            }

            function getCoconutHeight(height) {
                return Height.get(40)(height);
            }

            var positionX = ((levelNr - 1) % 4) + 1;

            var goldCoconut = self.stage.drawRectangle(Width.get(5, positionX), Height.get(6, Math.ceil(levelNr / 4)),
                getCoconutWidth, getCoconutHeight, 'brown', true, undefined, 4);

            function getX() {
                return goldCoconut.x;
            }

            function getY() {
                return goldCoconut.y;
            }

            function getWidth() {
                return goldCoconut.getHeight() * 2;
            }

            function getHeight() {
                return goldCoconut.getHeight() * 2;
            }

            var numberLabel = self.stage.drawText(getX, getY, levelNr.toString(), Font._20, 'GameFont', 'black', 5,
                [goldCoconut]);

            var wrapper = self.stage.drawRectangleWithInput(getX, getY, getWidth, getHeight, 'white', true, undefined,
                3, 0.5, undefined, undefined, [goldCoconut]);
            self.tap.add(wrapper.input, getLevelCallback(levelNr));
            drawables.push(goldCoconut);
            drawables.push(numberLabel);
            drawables.push(wrapper.drawable);
            taps.push(wrapper.input);

        }

        function getLevelCallback(levelNr) {
            return function () {
                deconstructScene();

                var level = new GameScreen({
                    stage: self.stage,
                    timer: self.timer,
                    device: self.device,
                    events: self.events,
                    sceneStorage: self.sceneStorage,
                    tap: self.tap,
                    buttons: self.buttons,
                    messages: self.messages,
                    sound: self.sounds,
                    levels: self.levels
                });
                self.sceneStorage.currentLevel = levelNr;

                level.show(initScene);
            };
        }

        initScene();
    };

    return LevelOverview;
})(drawIcons, drawClouds, Width, Height, GameScreen);