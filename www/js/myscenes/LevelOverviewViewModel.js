var LevelOverviewViewModel = (function (Width, Height, Event, Constants, Font, Math, showMenu, MVVMScene,
    GameScreenViewModel, loadBoolean, localStorage, wrap, ScreenShaker, iterateEntries, UnlockLockViewModel,
    GoldenCoconutViewModel, add) {
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
        this.scenes = services.scenes;

        this.services = services;
    }

    LevelOverviewViewModel.prototype.preDestroy = function () {
        iterateEntries(this.shakers, function (shaker) {
            this.events.unsubscribe(shaker.tickId);
            this.events.unsubscribe(shaker.resizeId);
        }, this);

        this.drawables.forEach(function (drawable) {
            drawable.remove();
        });
        this.taps.forEach(this.tap.remove.bind(this.tap));
    };

    LevelOverviewViewModel.prototype.postConstruct = function () {
        var self = this;

        function createLevelDrawable(levelNr) {
            var levelKey = levelNr < 10 ? '0' + levelNr : levelNr;
            var isUnlocked = loadBoolean(Constants.LEVEL_UNLOCKED + levelKey);
            var isUnlocking = loadBoolean(Constants.LEVEL_UNLOCKING + levelKey);
            var isFinished = loadBoolean(Constants.LEVEL_FINISHED + levelKey);
            var isFinishedNow = loadBoolean(Constants.LEVEL_FINISHED_NOW + levelKey);
            if (levelNr === 1) {
                isUnlocked = true;
            }

            var positionX = ((levelNr - 1) % 4) + 1;
            var xFn = Width.get(5, positionX);
            var yFn = Height.get(6, Math.ceil(levelNr / 4));
            var sceneRect = {
                width: 1242,
                height: 2208
            };
            var coconut;

            function getInputCallback(isUnlocked, levelNr) {
                return function () {
                    if (isUnlocked) {
                        var resume = self.stopScene();

                        self.events.fire(Event.ANALYTICS, {
                            type: 'level_start',
                            level: levelNr
                        });

                        var level = new MVVMScene(self.services, self.services.scenes['level'],
                            new GameScreenViewModel(self.services));
                        self.sceneStorage.currentLevel = levelNr;
                        level.show(resume);

                    } else {
                        // is locked
                        self.shakers[levelNr].shaker.startSmallShake();
                    }
                };
            }

            function addLabel(coconut, unlocked, color) {
                if (unlocked) {
                    var numberLabel = self.stage.createText(levelNr.toString()).setPosition(add(wrap(coconut, 'x'),
                            Width.get(64)), add(wrap(coconut, 'y'), Height.get(48 * 2)),
                        [coconut]).setSize(Font._30).setFont(Constants.GAME_FONT).setZIndex(5).setColor(color);
                    self.drawables.push(numberLabel);
                }

                var touchable = self.stage.createRectangle().setPosition(wrap(coconut, 'x'), wrap(coconut, 'y'),
                    [coconut]).setWidth(Width.get(5)).setHeight(Height.get(6)).setColor('white');

                touchable.hide();

                self.tap.add(touchable, getInputCallback(isUnlocked, levelNr));
                self.drawables.push(coconut);
                self.drawables.push(touchable);
                self.taps.push(touchable);
            }

            if (isUnlocking) {
                localStorage.setItem(Constants.LEVEL_UNLOCKING + levelKey, false);

                var unlockSubScene = new MVVMScene(self.services, self.scenes['unlock_lock'], new UnlockLockViewModel(),
                    sceneRect, xFn, yFn);
                self.timer.doLater(function () {
                    unlockSubScene.show(function () {
                        coconut = self.stage.createImage('coconut').setPosition(xFn, yFn).setZIndex(4);
                        addLabel(coconut, isUnlocked, 'white');
                    });
                }, self.sceneStorage.do30fps ? 16 : 30);

            } else if (isUnlocked) {
                if (isFinishedNow) {
                    localStorage.setItem(Constants.LEVEL_FINISHED_NOW + levelKey, false);

                    var finishedSubScene = new MVVMScene(self.services, self.scenes['golden_coconut'],
                        new GoldenCoconutViewModel(), sceneRect, xFn, yFn);
                    finishedSubScene.show(function () {
                        coconut = self.stage.createImage('coconut_gold').setPosition(xFn, yFn).setZIndex(4);
                        addLabel(coconut, isUnlocked, 'black');
                    });

                } else if (isFinished) {
                    coconut = self.stage.createImage('coconut_gold').setPosition(xFn, yFn).setZIndex(4);
                    addLabel(coconut, isUnlocked, 'black');

                } else {
                    // is unlocked
                    coconut = self.stage.createImage('coconut').setPosition(xFn, yFn).setZIndex(4).setAlpha(0.8);
                    addLabel(coconut, isUnlocked, 'white');
                }
            } else {
                // is locked
                coconut = self.stage.createImage('locked').setPosition(xFn, yFn).setZIndex(5);

                var shaker = new ScreenShaker(self.device);
                self.shakers[levelNr] = {
                    shaker: shaker,
                    resizeId: self.events.subscribe(Event.RESIZE, shaker.resize.bind(shaker)),
                    tickId: self.events.subscribe(Event.TICK_MOVE, shaker.update.bind(shaker))
                };
                shaker.add(coconut);
                self.drawables.push(coconut);

                coconut = self.stage.createImage('coconut').setPosition(xFn, yFn).setZIndex(4).setAlpha(0.3);

                addLabel(coconut, isUnlocked);
            }
        }

        this.taps = [];
        this.drawables = [];
        this.shakers = {};

        //this.drawables.push(this.stage.createRectangle(true).setWidth(Width.FULL).setHeight(Height.FULL).setPosition(Width.HALF,
        // Height.HALF).setColor('white').setAlpha(0.3).setZIndex(4));

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

    LevelOverviewViewModel.prototype.downSettings = function () {

    };

    return LevelOverviewViewModel;
})(Width, Height, Event, Constants, Font, Math, showMenu, MVVMScene, GameScreenViewModel, loadBoolean, lclStorage, wrap,
    ScreenShaker, iterateEntries, UnlockLockViewModel, GoldenCoconutViewModel, add);