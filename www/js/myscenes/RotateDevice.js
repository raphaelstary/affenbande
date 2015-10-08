var RotateDevice = (function (Width, Height, Font, Event, Constants, Transition) {
    "use strict";

    function RotateDevice(services) {
        this.stage = services.stage;
        this.events = services.events;
        this.messages = services.messages;
    }

    var KEY = 'rotate';
    var ROTATE_DEVICE = 'rotate_device';
    var BLACK = '#000';
    var WHITE = '#fff';

    RotateDevice.prototype.show = function (next) {
        var backBlur, rotateText, self = this, rect;

        this.events.subscribe(Event.SHOW_ROTATE_DEVICE, function () {

            backBlur = self.stage.createRectangle(true).setPosition(Width.HALF,
                Height.HALF).setWidth(Width.FULL).setHeight(Height.FULL).setZIndex(9).setAlpha(0.8);

            rotateText = self.stage.createText(self.messages.get(KEY, ROTATE_DEVICE)).setPosition(Width.HALF,
                Height.QUARTER).setSize(Font._15).setFont(Constants.GAME_FONT).setColor(WHITE).setZIndex(11).setLineHeight(Width.FULL).setScale(Height.get(10));

            rect = self.stage.createRectangle(true).setPosition(Width.HALF,
                Height.TWO_THIRD).setWidth(Width.get(7)).setHeight(Height.HALF).setColor(WHITE).setZIndex(11).setAlpha(0.5).setRotation(Math.PI /
                2);
            rect.rotateTo(0).setDuration(180).setLoop(true);
        });

        this.events.subscribe(Event.REMOVE_ROTATE_DEVICE, function () {
            backBlur.remove();
            rotateText.remove();
            rect.remove();
        });

        next();
    };

    return RotateDevice;
})(Width, Height, Font, Event, Constants, Transition);