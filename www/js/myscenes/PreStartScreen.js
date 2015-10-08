var PreStartScreen = (function (Width, Height, Font, document, installOneTimeTap, Event, window, Orientation,
    getDevicePixelRatio, Math, sendSystemEvent, Stats, checkAndSet30fps, Constants) {
    "use strict";

    function PreStartScreen(services) {
        this.stage = services.stage;
        this.legacyStage = services.legacyStage;
        this.sceneStorage = services.sceneStorage;
        this.buttons = services.buttons;
        this.messages = services.messages;
        this.timer = services.timer;
        this.device = services.device;
        this.loop = services.loop;
        this.events = services.events;
        this.tap = services.tap;
        this.sounds = services.sounds;
        this.newStage = services.newStage;
    }

    PreStartScreen.prototype.show = function (next) {
        var self = this;

        var ms = this.stage.createText('0').setPosition(Width.get(10),
            Height.get(15)).setSize(Font._60).setFont('Arial').setColor('white').setZIndex(11);
        var fps = this.stage.createText('0').setPosition(Width.get(10),
            Height.get(12)).setSize(Font._60).setFont('Arial').setColor('white').setZIndex(11);

        var statsStart = this.events.subscribe(Event.TICK_START, Stats.start);

        self.sceneStorage.msTotal = 0;
        self.sceneStorage.msCount = 0;
        self.sceneStorage.fpsTotal = 0;
        self.sceneStorage.fpsCount = 0;

        var statsRender = this.events.subscribe(Event.TICK_DRAW, function () {
            ms.data.msg = Stats.getMs().toString() + " ms";
            fps.data.msg = Stats.getFps().toString() + " fps";
            self.sceneStorage.msTotal += Stats.getMs();
            self.sceneStorage.msCount++;
            self.sceneStorage.fpsTotal += Stats.getFps();
            self.sceneStorage.fpsCount++;
        });

        var statsEnd = this.events.subscribe(Event.TICK_END, Stats.end);

        sendSystemEvent(this.device, this.messages, this.events);

        var drawables = [];

        var logo = this.stage.createText('Monkey Gang').setPosition(Width.HALF,
            Height.get(48, 12)).setSize(Font._15).setFont(Constants.GAME_FONT).setColor('black');
        drawables.push(logo);

        function installFullScreen() {
            // full screen hack for IE11, it accepts only calls from some DOM elements like button, link or div NOT
            // canvas
            var screenElement = document.getElementsByTagName('canvas')[0];
            var parent = screenElement.parentNode;
            var wrapper = document.createElement('div');
            parent.replaceChild(wrapper, screenElement);
            wrapper.appendChild(screenElement);
            var startButton = self.buttons.createPrimaryButton(Width.HALF, Height.THREE_QUARTER,
                self.messages.get('start', 'start'), function () {
                    // sadly not working on IE11
                }, 3);
            installOneTimeTap(wrapper, function () {
                wrapper.parentNode.replaceChild(screenElement, wrapper);
                goFullScreen();
            });
            return startButton;
        }

        var startButton;
        //var startButton = installFullScreen();

        goFullScreen(); // todo remove

        function goFullScreen() {
            if (startButton)
                self.buttons.remove(startButton);

            self.timer.doLater(function () {
                self.events.fire(Event.ANALYTICS, {
                    type: 'pressed_start',
                    fullScreen: self.device.isFullScreen(),
                    orientation: self.device.orientation
                });

                // only god knows why
                var devicePixelRatio = getDevicePixelRatio();
                self.device.width = Math.floor(window.innerWidth * devicePixelRatio);
                self.device.height = Math.floor(window.innerHeight * devicePixelRatio);
                self.device.cssHeight = window.innerHeight;
                self.device.cssWidth = window.innerWidth;
                self.device.devicePixelRatio = devicePixelRatio;
                self.device.forceResize();

                toNextScene();

            }, 6);

            var goFsScreen = false;
            var shouldShowGoFsScreen = false;
            var rotateScreen = false;
            var shouldShowRotateScreen = false;

            var usedOnce = false;
            self.events.subscribe(Event.FULL_SCREEN, function (isFullScreen) {
                if (isFullScreen) {
                    if (!usedOnce) {
                        usedOnce = true;
                        return;
                    }
                    goFsScreen = false;
                    self.events.fire(Event.REMOVE_GO_FULL_SCREEN);
                    if (!rotateScreen && !shouldShowRotateScreen) {
                        if (self.sceneStorage.menuOn) {
                            self.events.fire(Event.RESUME_MENU);
                        } else if (self.sceneStorage.shouldShowMenu) {
                            self.sceneStorage.shouldShowMenu = false;
                            self.events.fire(Event.SHOW_MENU);
                        } else {
                            self.events.fire(Event.RESUME);
                        }

                    } else if (shouldShowRotateScreen) {
                        shouldShowRotateScreen = false;
                        rotateScreen = true;
                        self.events.fire(Event.SHOW_ROTATE_DEVICE);
                    }
                } else {
                    if (!rotateScreen) {
                        self.events.fireSync(Event.PAUSE);
                        goFsScreen = true;
                        self.events.fire(Event.SHOW_GO_FULL_SCREEN);
                    } else {
                        shouldShowGoFsScreen = true;
                    }
                }
            });

            var isFs = self.device.requestFullScreen();
            var locked = self.device.isMobile ? self.device.lockOrientation('portrait-primary') : false;

            if (!locked && self.device.isMobile) {

                self.events.subscribe(Event.SCREEN_ORIENTATION, function (orientation) {
                    if (orientation === Orientation.PORTRAIT) {
                        rotateScreen = false;
                        self.events.fire(Event.REMOVE_ROTATE_DEVICE);
                        if (!goFsScreen && !shouldShowGoFsScreen) {
                            if (self.sceneStorage.menuOn) {
                                self.events.fire(Event.RESUME_MENU);
                            } else if (self.sceneStorage.shouldShowMenu) {
                                self.sceneStorage.shouldShowMenu = false;
                                self.events.fire(Event.SHOW_MENU);
                            } else {
                                self.events.fire(Event.RESUME);
                            }
                        } else if (shouldShowGoFsScreen) {
                            shouldShowGoFsScreen = false;
                            goFsScreen = true;
                            self.events.fire(Event.SHOW_GO_FULL_SCREEN);
                        }
                    } else {
                        if (!goFsScreen) {
                            self.events.fireSync(Event.PAUSE);
                            rotateScreen = true;
                            self.events.fire(Event.SHOW_ROTATE_DEVICE);
                        } else {
                            shouldShowRotateScreen = true;
                        }
                    }
                });

                var currentOrientation = self.device.orientation;
                if (currentOrientation === Orientation.LANDSCAPE) {
                    var nextScene = self.events.subscribe(Event.RESUME, function () {
                        self.events.unsubscribe(nextScene);
                        self.timer.doLater(next, 6);
                    });
                    self.events.fireSync(Event.PAUSE);
                    self.events.fire(Event.SHOW_ROTATE_DEVICE);

                }
            }
            if (!isFs && self.device.isMobile) {
                // do black magic
                window.scrollTo(0, 1); //maybe scrolling with larger screen element on newer browsers
            }
            //if (!self.device.isMobile || locked || currentOrientation === Orientation.PORTRAIT) {
            //    self.timer.doLater(next, 6);
            //}
        }

        self.events.subscribe(Event.PAGE_VISIBILITY, function (hidden) {
            //if (hidden && self.sceneStorage.sfxOn) {
            //    self.sounds.muteAll();
            //} else if (!hidden && self.sceneStorage.sfxOn) {
            //    self.sounds.unmuteAll();
            //}
        });

        self.events.subscribe(Event.PAUSE, function () {
            self.stage.pauseAll();
            self.legacyStage.pauseAll();
            self.buttons.disableAll();
            self.timer.pause();
            self.loop.disableMove();
            self.loop.disableCollision();
        });

        self.events.subscribe(Event.RESUME, function () {
            self.stage.playAll();
            self.legacyStage.playAll();
            self.buttons.enableAll();
            self.timer.resume();
            self.loop.enableMove();
            self.loop.enableCollision();
        });

        var itIsOver = false;

        function toNextScene() {
            var fps = checkAndSet30fps(self.sceneStorage, self.stage);

            self.events.fire(Event.ANALYTICS, {
                type: 'pressed_start',
                fullScreen: self.device.isFullScreen(),
                orientation: self.device.orientation,
                fps: fps.fps,
                ms: fps.ms
            });

            if (itIsOver)
                return;
            itIsOver = true;

            drawables.forEach(function (drawable) {
                drawable.remove();
            });

            self.timer.doLater(next, 16);
        }
    };

    return PreStartScreen;
})(Width, Height, Font, window.document, installOneTimeTap, Event, window, Orientation, getDevicePixelRatio, Math,
    sendSystemEvent, Stats, checkAndSet30fps, Constants);