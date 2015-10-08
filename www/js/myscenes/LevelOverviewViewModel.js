var LevelOverviewViewModel = (function (Width, Height, Event, Constants, Font, Math, showMenu) {
    "use strict";

    function LevelOverviewViewModel(services) {
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

        this.services = services;
    }

    LevelOverviewViewModel.prototype.preDestroy = function () {
        this.drawables.forEach(function (drawable) {
            drawable.remove();
        });
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

            var goldCoconut = self.stage.createImage('coconut').setPosition(Width.get(5, positionX),
                Height.get(6, Math.ceil(levelNr / 4))).setZIndex(4).setAlpha(0.5);
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

            var numberLabel = self.stage.createText(levelNr.toString()).setPosition(getX, getY,
                [goldCoconut]).setSize(Font._15).setFont(Constants.GAME_FONT).setZIndex(5);

            var touchable = self.stage.createRectangle().setPosition(getX, getY,
                [goldCoconut]).setWidth(getWidth).setHeight(getHeight).setColor('white');

            touchable.hide();

            self.tap.add(touchable, getLevelCallback(levelNr));
            self.drawables.push(goldCoconut);
            self.drawables.push(numberLabel);
            self.drawables.push(touchable);
            self.taps.push(touchable);

        }

        function getLevelCallback(levelNr) {
            return function () {
                var resume = self.stopScene();

                self.events.fire(Event.ANALYTICS, {
                    type: 'level_start',
                    level: levelNr
                });

                var level = new MVVMScene(self.services, self.services.scenes['level'],
                    new GameScreenViewModel(self.services));
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