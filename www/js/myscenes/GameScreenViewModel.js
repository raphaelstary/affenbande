var GameScreenViewModel = (function (Event, localStorage) {
    "use strict";

    function GameScreenViewModel(services) {
        this.stage = services.stage;
        this.timer = services.timer;
        this.device = services.device;
        this.events = services.events;
        this.sceneStorage = services.sceneStorage;
        this.buttons = services.buttons;
        this.messages = services.messages;
        this.sounds = services.sounds;
        this.tap = services.tap;
        this.levels = services.levels;

        this.services = services;
    }

    GameScreenViewModel.prototype.restart = function () {
        this.timer.doLater(this.restartScene.bind(this), 6);
    };

    GameScreenViewModel.prototype.downRestart = function () {
        this.restartBtn.data = this.stage.getGraphic('restart_white');
        var self = this;
        this.timer.doLater(function () {
            self.restartBtn.data = self.stage.getGraphic('restart');
        }, 16);
    };

    GameScreenViewModel.prototype.goBack = function () {
        this.events.fire(Event.ANALYTICS, {
            type: 'level_end',
            action: 'abort',
            summary: 'missing',
            level: this.sceneStorage.currentLevel
        });
        this.timer.doLater(this.nextScene.bind(this), 6);
    };

    GameScreenViewModel.prototype.downBack = function () {
        this.backBtn.data = this.stage.getGraphic('exit_level_white');
        var self = this;
        this.timer.doLater(function () {
            self.backBtn.data = self.stage.getGraphic('exit_level');
        }, 16);
    };

    GameScreenViewModel.prototype.stepBack = function () {
        //undo.used = true;
        var self = this;
        if (!this.world.undoLastMove(function () {
                //self.stepBackBtn.alpha = 0.5;
                //undo.used = false;
            })) {
            //this.stepBackBtn.alpha = 0.5;
            //undo.used = false;
            this.shaker.startSmallShake();
        }
    };

    GameScreenViewModel.prototype.downStepBack = function () {
        this.stepBackBtn.data = this.stage.getGraphic('step_back_white');
        var self = this;
        this.timer.doLater(function () {
            self.stepBackBtn.data = self.stage.getGraphic('step_back');
        }, 16);
    };

    GameScreenViewModel.prototype.goSettings = function () {
        this.sceneStorage.menuScene = 'settings';

        this.events.fireSync(Event.PAUSE);
        showMenu(this.stage, this.buttons, this.messages, this.events, this.sceneStorage, this.device, this.sounds,
            function () {
            });
    };

    GameScreenViewModel.prototype.downSettings = function () {
        this.settingsBtn.data = this.stage.getGraphic('settings_white');
        var self = this;
        this.timer.doLater(function () {
            self.settingsBtn.data = self.stage.getGraphic('settings');
        }, 16);
    };

    GameScreenViewModel.prototype.postConstruct = function () {
        var self = this;

        //undo.reset = false;

        var topOffset = Height.get(48, 5);

        this.shaker = new ScreenShaker(self.device);
        this.shakerResizeId = self.events.subscribe(Event.RESIZE, this.shaker.resize.bind(this.shaker));
        this.shakerTickId = self.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));

        this.shaker.add(this.stepBackBtn);

        function buttonScaleAnimation() {
            var $ = {
                WAVE_SCALE_FACTOR_MAX: 6,
                WAVE_SCALE_DURATION: 60,
                WAVE_AGAIN_DURATION: 60 * 5,

                SECOND_WAVE_DELAY: 5,
                THIRD_WAVE_DELAY: 10
            };
            var lineWidth = Font.get(480, 3);
            var _0 = undefined;
            var deps = [self.stepBackBtn];
            var x = wrap(self.stepBackBtn, 'x');
            var y = wrap(self.stepBackBtn, 'y');
            var width = self.stepBackBtn.getWidth.bind(self.stepBackBtn);
            var height = self.stepBackBtn.getHeight.bind(self.stepBackBtn);
            var one = self.stage.createRectangle().setPosition(x, y,
                deps).setWidth(width).setHeight(height).setColor('white').setZIndex(5).setLineWidth(lineWidth);
            var two = self.stage.createRectangle().setPosition(x, y,
                deps).setWidth(width).setHeight(height).setColor('white').setZIndex(5).setLineWidth(lineWidth);
            var three = self.stage.createRectangle().setPosition(x, y,
                deps).setWidth(width).setHeight(height).setColor('white').setZIndex(5).setLineWidth(lineWidth);
            one.scaleTo($.WAVE_SCALE_FACTOR_MAX).setDuration($.WAVE_SCALE_DURATION).setCallback(function () {
                one.remove();
            });
            self.timer.doLater(function () {
                two.scaleTo($.WAVE_SCALE_FACTOR_MAX).setDuration($.WAVE_SCALE_DURATION).setCallback(function () {
                    two.remove();
                });
            }, $.SECOND_WAVE_DELAY);
            self.timer.doLater(function () {
                three.scaleTo($.WAVE_SCALE_FACTOR_MAX).setDuration($.WAVE_SCALE_DURATION).setCallback(function () {
                    three.remove();
                });
            }, $.THIRD_WAVE_DELAY);
        }

        var eventCallbacks = {
            11: buttonScaleAnimation,
            12: function () {
                if (self.world.snakes[0].length < 4)
                    buttonScaleAnimation();
            }
        };
        var level = this.levels[this.sceneStorage.currentLevel];
        this.world = PlayFactory.createWorld(this.stage, this.timer, this.device, level, function () {
            self.events.fire(Event.ANALYTICS, {
                type: 'level_end',
                action: 'success',
                summary: 'missing',
                level: self.sceneStorage.currentLevel
            });

            var levelNr = self.sceneStorage.currentLevel;
            var levelKey = levelNr < 10 ? '0' + levelNr : levelNr;
            var nextLevelNr = levelNr + 1;
            var nextLevelKey = nextLevelNr < 10 ? '0' + nextLevelNr : nextLevelNr;
            var isUnlocked = loadBoolean(Constants.LEVEL_UNLOCKED + nextLevelKey);
            var isFinished = loadBoolean(Constants.LEVEL_FINISHED + levelKey);

            if (!isUnlocked) {
                localStorage.setItem(Constants.LEVEL_UNLOCKED + nextLevelKey, true);
                localStorage.setItem(Constants.LEVEL_UNLOCKING + nextLevelKey, true);
            }
            if (!isFinished) {
                localStorage.setItem(Constants.LEVEL_FINISHED + levelKey, true);
                localStorage.setItem(Constants.LEVEL_FINISHED_NOW + levelKey, true);
            }

            var successScreen = new MVVMScene(self.services, self.services.scenes['finish_level'],
                new SuccessScreenViewModel(self.services), 'finish_level');

            //self.world.worldView.setAlphaOfAll();

            successScreen.show(function () {
                self.timer.doLater(self.nextScene.bind(self), 30);
            });

        }, topOffset, eventCallbacks);
        this.world.init();

        var playerController = PlayFactory.createPlayerController(this.world);
        this.pointerHandler = this.events.subscribe(Event.POINTER, function (pointer) {
            if (pointer.type == 'down')
                playerController.handlePointerDown(pointer.x, pointer.y);
            if (pointer.type == 'up')
                playerController.handlePointerUp(pointer.x, pointer.y);
            if (pointer.type == 'move')
                playerController.handlePointerMove(pointer.x, pointer.y);
        });

        if (this.sceneStorage.currentLevel === 1) {
            self.events.fireSync(Event.PAUSE);

            var tutorial = new MVVMScene(self.services, self.services.scenes['move_tutorial'],
                new TutorialViewModel(self.services), 'move_tutorial');
            self.timer.doLater(function () {
                tutorial.show(function () {
                    self.events.fire(Event.RESUME);
                });
            }, 10);
        }
    };

    GameScreenViewModel.prototype.preDestroy = function () {
        this.events.unsubscribe(this.pointerHandler);
        this.events.unsubscribe(this.shakerTickId);
        this.events.unsubscribe(this.shakerResizeId);
        this.world.worldView.preDestroy();
    };

    return GameScreenViewModel;
})(Event, lclStorage);