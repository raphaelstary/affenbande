var GoFullScreen = (function (Event, Width, Height, installOneTimeTap, isHit, Constants) {
    "use strict";

    function GoFullScreen(services) {
        this.stage = services.stage;
        this.events = services.events;
        this.buttons = services.buttons;
        this.messages = services.messages;
        this.device = services.device;
        this.sceneStorage = services.sceneStorage;
    }

    var KEY = 'go_full_screen';
    var GO_FS = 'go_full_screen';
    var CANCEL = 'cancel';
    var FS_REQUEST = 'exit_full_screen';

    var BLACK = '#000';
    var WHITE = '#fff';
    GoFullScreen.prototype.show = function (next) {
        var backBlur, rotateText, self = this, goFsBtn, cancelBtn;

        this.events.subscribe(Event.SHOW_GO_FULL_SCREEN, function () {

            backBlur = self.stage.createRectangle(true).setPosition(Width.HALF,
                Height.HALF).setWidth(Width.FULL).setHeight(Height.FULL).setZIndex(9).setAlpha(0.8);

            if (self.sceneStorage.fsUserRequest) {
                self.sceneStorage.fsUserRequest = false;
                rotateText = self.stage.createText(self.messages.get(KEY, GO_FS)).setPosition(Width.HALF,
                    Height.QUARTER).setSize(Font._15).setFont(Constants.GAME_FONT).setColor(WHITE).setZIndex(11).setLineHeight(Width.FULL).setScale(Height.get(15));
            } else {
                rotateText = self.stage.createText(self.messages.get(KEY, FS_REQUEST)).setPosition(Width.HALF,
                    Height.QUARTER).setSize(Font._15).setFont(Constants.GAME_FONT).setColor(WHITE).setZIndex(11).setLineHeight(Width.FULL).setScale(Height.get(10));
            }

            goFsBtn = self.buttons.createPrimaryButton(Width.HALF, Height.HALF, self.messages.get(KEY, GO_FS),
                function () {
                    // sadly not working on IE11
                }, 10);

            cancelBtn = self.buttons.createSecondaryButton(Width.HALF, Height.THREE_FIFTH,
                self.messages.get(KEY, CANCEL), function () {
                    self.events.fire(Event.FULL_SCREEN, true);
                }, 10);

            // full screen hack for IE11, it accepts only calls from some DOM elements like button, link or div NOT
            // canvas
            var screenElement = document.getElementsByTagName('canvas')[0];
            var parent = screenElement.parentNode;
            var wrapper = document.createElement('div');
            parent.replaceChild(wrapper, screenElement);
            wrapper.appendChild(screenElement);

            installOneTimeTap(wrapper, function (event) {
                wrapper.parentNode.replaceChild(screenElement, wrapper);
                if (event.clientX != undefined && event.clientY != undefined && isHit({
                        x: event.clientX * self.device.devicePixelRatio,
                        y: event.clientY * self.device.devicePixelRatio
                    }, cancelBtn.input)) {
                    return;
                } else {
                    var touches = event.changedTouches;
                    if (touches) {
                        for (var i = 0; i < touches.length; i++) {
                            var touch = touches[i];
                            if (isHit({
                                    x: touch.clientX * self.device.devicePixelRatio,
                                    y: touch.clientY * self.device.devicePixelRatio
                                }, cancelBtn.input)) {
                                return;
                            }
                        }
                    }
                }
                self.device.requestFullScreen();
            });
        });

        this.events.subscribe(Event.REMOVE_GO_FULL_SCREEN, function () {
            backBlur.remove();
            rotateText.remove();
            self.buttons.remove(goFsBtn);
            self.buttons.remove(cancelBtn);
        });

        next();
    };

    return GoFullScreen;
})(Event, Width, Height, installOneTimeTap, isHit, Constants);