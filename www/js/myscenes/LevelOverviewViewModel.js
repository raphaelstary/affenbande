var LevelOverviewViewModel = (function (Width, Height, Event, Constants, Font, Math, showMenu) {
    "use strict";

    function LevelOverviewViewModel(services) {
        this.stage = services.stage;
        this.newStage = services.newStage;
        this.tap = services.tap;
        this.sceneStorage = services.sceneStorage;
        this.events = services.events;
        this.buttons = services.buttons;
        this.messages = services.messages;
        this.device = services.device;
        this.sounds = services.sounds;
        this.timer = services.timer;
        this.levels = services.levels;
        this.scenes = services.scenes;
    }

    LevelOverviewViewModel.prototype.preDestroy = function () {
        this.drawables.forEach(this.stage.remove.bind(this.stage));
        this.taps.forEach(this.tap.remove.bind(this.tap));
    };

    LevelOverviewViewModel.prototype.postConstruct = function () {
        var self = this;

        function createLevelDrawable(levelNr) {
            function getCoconutWidth(width, height) {
                return Height.get(40)(height);
            }

            function getCoconutHeight(height) {
                return Height.get(40)(height);
            }

            var positionX = ((levelNr - 1) % 4) + 1;

            var goldCoconut = self.stage.drawFresh(Width.get(5, positionX), Height.get(6, Math.ceil(levelNr / 4)),
                'coconut', 4, undefined, 0.5);
            //var goldCoconut = self.stage.drawRectangle(Width.get(5, positionX), Height.get(6, Math.ceil(levelNr / 4)),
            //    getCoconutWidth, getCoconutHeight, 'brown', true, undefined, 4);

            function getX() {
                return goldCoconut.x;
            }

            function getY() {
                return goldCoconut.y;
            }

            function getWidth(width) {
                return Width.get(5)(width);
            }

            function getHeight(height) {
                return Height.get(6)(height);
            }

            var numberLabel = self.stage.drawText(getX, getY, levelNr.toString(), Font._15, Constants.GAME_FONT,
                'black', 5, [goldCoconut]);

            var wrapper = self.stage.drawRectangleWithInput(getX, getY, getWidth, getHeight, 'white', true, undefined,
                3, 0.5, undefined, undefined, [goldCoconut]);
            self.stage.hide(wrapper.drawable);
            self.tap.add(wrapper.input, getLevelCallback(levelNr));
            self.drawables.push(goldCoconut);
            self.drawables.push(numberLabel);
            self.drawables.push(wrapper.drawable);
            self.taps.push(wrapper.input);

        }

        function getLevelCallback(levelNr) {
            return function () {
                var resume = self.stopScene();

                self.events.fire(Event.ANALYTICS, {
                    type: 'level_start',
                    level: levelNr
                });

                var services = {
                    stage: self.stage,
                    newStage: self.newStage,
                    timer: self.timer,
                    device: self.device,
                    events: self.events,
                    sceneStorage: self.sceneStorage,
                    tap: self.tap,
                    buttons: self.buttons,
                    messages: self.messages,
                    sound: self.sounds,
                    levels: self.levels,
                    scenes: self.scenes
                };

                //var level = new GameScreen(services);
                var level = new MVVMScene(services, self.scenes['level'], new GameScreenViewModel(services));
                self.sceneStorage.currentLevel = levelNr;

                level.show(resume);
            };
        }

        this.taps = [];
        this.drawables = [];

        for (var i = 1; i <= 20; i++) {
            createLevelDrawable(i);
        }
    };

    LevelOverviewViewModel.prototype.goSettings = function () {
        this.sceneStorage.menuScene = 'settings';

        this.events.fireSync(Event.PAUSE);
        showMenu(this.stage, this.buttons, this.messages, this.events, this.sceneStorage, this.device, this.sounds,
            function () {
            });
    };

    return LevelOverviewViewModel;
})(Width, Height, Event, Constants, Font, Math, showMenu);