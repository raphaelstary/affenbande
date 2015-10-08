var GameScreenViewModel = (function (Event) {
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

    GameScreenViewModel.prototype.goBack = function () {
        this.events.fire(Event.ANALYTICS, {
            type: 'level_end',
            action: 'abort',
            summary: 'missing',
            level: this.sceneStorage.currentLevel
        });
        this.timer.doLater(this.nextScene.bind(this), 6);
    };

    GameScreenViewModel.prototype.stepBack = function () {
        //undo.used = true;
        var self = this;
        if (!this.world.undoLastMove(function () {
                //self.stepBackDrawable.alpha = 0.5;
                //undo.used = false;
            })) {
            //this.stepBackDrawable.alpha = 0.5;
            //undo.used = false;
            this.shaker.startSmallShake();
        }
    };

    GameScreenViewModel.prototype.goSettings = function () {
        this.sceneStorage.menuScene = 'settings';

        this.events.fireSync(Event.PAUSE);
        showMenu(this.stage, this.buttons, this.messages, this.events, this.sceneStorage, this.device, this.sounds,
            function () {
            });
    };

    GameScreenViewModel.prototype.postConstruct = function () {
        var self = this;

        //undo.reset = false;

        var topOffset = Height.get(48, 5);

        this.shaker = new ScreenShaker(self.device);
        this.shakerResizeId = self.events.subscribe(Event.RESIZE, this.shaker.resize.bind(this.shaker));
        this.shakerTickId = self.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));

        this.shaker.add(this.stepBackDrawable);

        function buttonScaleAnimation() {
            var $ = {
                WAVE_SCALE_FACTOR_MAX: 2,
                WAVE_SCALE_DURATION: 30,
                WAVE_AGAIN_DURATION: 60 * 5,

                SECOND_WAVE_DELAY: 5,
                THIRD_WAVE_DELAY: 10
            };
            var _0 = undefined;
            var deps = [self.stepBackDrawable];
            var x = wrap(self.stepBackDrawable, 'x');
            var y = wrap(self.stepBackDrawable, 'y');
            var width = self.stepBackDrawable.getWidth.bind(self.stepBackDrawable);
            var height = self.stepBackDrawable.getHeight.bind(self.stepBackDrawable);
            var one = self.stage.createRectangle().setPosition(x, y,
                deps).setWidth(width).setHeight(height).setColor('white').setZIndex(5);
            var two = self.stage.createRectangle().setPosition(x, y,
                deps).setWidth(width).setHeight(height).setColor('white').setZIndex(5);
            var three = self.stage.createRectangle().setPosition(x, y,
                deps).setWidth(width).setHeight(height).setColor('white').setZIndex(5);
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

            var successScreen = new MVVMScene(self.services, self.services.scenes['finish_level'],
                new SuccessScreenViewModel(self.services));
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

            var tutorial = new MVVMScene(self.services, self.services.scenes['move_tutorial'], new TutorialViewModel());
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
})(Event);