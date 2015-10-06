var GameScreen = (function (PlayFactory, Event, ScreenShaker, showMenu, Transition, Width, Height, Math) {
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
        this.levels = services.levels;
    }

    GameScreen.prototype.show = function (next) {
        var self = this;

        var itIsARevert = false;
        var revert = self.buttons.createSecondaryButton(Width.get(32, 13), topY,
            self.messages.get('play', 'revert_level'), function () {
                self.timer.doLater(function () {
                    itIsARevert = true;
                    nextScene();
                }, 6);
            }, 4, false, Width.get(32, 5), undefined, undefined, topOffset);
        buttons.push(revert);

        var back = self.buttons.createSecondaryButton(Width.get(32, 7), topY, self.messages.get('play', 'back_to_map'),
            function () {
                self.events.fire(Event.ANALYTICS, {
                    type: 'level_end',
                    action: 'abort',
                    summary: 'missing',
                    level: self.sceneStorage.currentLevel
                });
                self.timer.doLater(nextScene, 6);
            }, 4, false, Width.get(32, 5), undefined, undefined, topOffset);
        buttons.push(back);

        var undoX = Width.get(32, 25);
        var undo = self.buttons.createPrimaryButton(undoX, topY, self.messages.get('play', 'undo'), function () {
            undo.used = true;
            if (!world.undoLastMove(function () {
                    undo.background.alpha = 0.5;
                    undo.used = false;
                })) {
                undo.background.alpha = 0.5;
                undo.used = false;
                shaker.startSmallShake();
            }
        }, 4, true, undefined, undefined, undefined, topOffset);
        buttons.push(undo);

        undo.reset = false;

        var shaker = new ScreenShaker(self.device);
        var shakerResizeId = self.events.subscribe(Event.RESIZE, shaker.resize.bind(shaker));
        var shakerTickId = self.events.subscribe(Event.TICK_MOVE, shaker.update.bind(shaker));
        shaker.add(undo.background);
        shaker.add(undo.text);

        var eventCallbacks = {
            11: function () {
                var widthMultiplier = 3;

                function getWidth(width) {
                    var max = Width.get(10, 9)(width);
                    var myWidth = undo.text.getWidth() * widthMultiplier;
                    return myWidth <= max ? myWidth : max;
                }

                function getHeight() {
                    return Math.floor(undo.text.getHeight() * 2.5);
                }

                var $ = {
                    WAVE_SCALE_FACTOR_MAX: 2,
                    WAVE_SCALE_DURATION: 30,
                    WAVE_AGAIN_DURATION: 60 * 5,

                    SECOND_WAVE_DELAY: 5,
                    THIRD_WAVE_DELAY: 10
                };
                var _0 = undefined;
                var deps = [undo.text];
                var one = self.stage.drawRectangle(undoX, topY, getWidth, getHeight, 'white', _0, _0, 5, _0, _0, _0,
                    deps);
                var two = self.stage.drawRectangle(undoX, topY, getWidth, getHeight, 'white', _0, _0, 5, _0, _0, _0,
                    deps);
                var three = self.stage.drawRectangle(undoX, topY, getWidth, getHeight, 'white', _0, _0, 5, _0, _0, _0,
                    deps);
                self.stage.animateScale(one, $.WAVE_SCALE_FACTOR_MAX, $.WAVE_SCALE_DURATION, Transition.LINEAR, false,
                    function () {
                        self.stage.remove(one);
                    });
                self.timer.doLater(function () {
                    self.stage.animateScale(two, $.WAVE_SCALE_FACTOR_MAX, $.WAVE_SCALE_DURATION, Transition.LINEAR,
                        false, function () {
                            self.stage.remove(two);
                        });
                }, $.SECOND_WAVE_DELAY);
                self.timer.doLater(function () {
                    self.stage.animateScale(three, $.WAVE_SCALE_FACTOR_MAX, $.WAVE_SCALE_DURATION, Transition.LINEAR,
                        false, function () {
                            self.stage.remove(three);
                        });
                }, $.THIRD_WAVE_DELAY);
            }
        };
        var level = this.levels[this.sceneStorage.currentLevel];
        var world = PlayFactory.createWorld(this.stage, this.timer, this.device, level, function () {
            self.events.fire(Event.ANALYTICS, {
                type: 'level_end',
                action: 'success',
                summary: 'missing',
                level: self.sceneStorage.currentLevel
            });
            self.timer.doLater(nextScene, 30);
        }, topOffset, eventCallbacks);
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

            if (itIsARevert) {
                self.show(next);
            } else {
                next();
            }
        }

        if (this.sceneStorage.currentLevel == 1) {
            self.sceneStorage.menuScene = 'move_tutorial';
            self.events.fireSync(Event.PAUSE);
            showMenu(self.stage, self.buttons, self.messages, self.events, self.sceneStorage, self.device, self.sounds,
                function () {
                    // next callback
                });
        }
    };

    return GameScreen;
})(PlayFactory, Event, ScreenShaker, showMenu, Transition, Width, Height, Math);