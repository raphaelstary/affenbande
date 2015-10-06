var MoveTutorial = (function (Width, Height, Font) {
    "use strict";

    function MoveTutorial(services) {
        this.stage = services.stage;
        this.messages = services.messages;
        this.buttons = services.buttons;
        this.sceneStorage = services.sceneStorage;
    }

    var FONT = Constants.GAME_FONT;
    var WHITE = '#fff';
    var LIGHT_GREY = '#c4c4c4';

    MoveTutorial.prototype.show = function (next) {
        var self = this;
        var drawables = [];

        drawables.push(self.stage.animateFresh(Height.HALF, Width.HALF, 'move_tutorial/move_tutorial', 62, true,
            undefined, 7).drawable);

        //drawables.push(self.stage.drawText(Width.HALF, Height.get(48, 16), "Test", Font._15, FONT, LIGHT_GREY, 7));

        //drawables.push(self.stage.drawText(Width.HALF, Height.get(48, 20), "Welcome", Font._40, FONT, WHITE, 7,
        //    undefined, undefined, undefined, Width.get(10, 8), Height.get(80, 3)));
        //drawables.push(self.stage.drawText(Width.HALF, Height.get(48, 24), "super test", Font._40, FONT, WHITE, 7,
        //    undefined, undefined, undefined, Width.get(10, 8), Height.get(80, 3)));

        self.sceneStorage.menuSceneButtons.push(self.buttons.createPrimaryButton(Width.HALF, Height.get(48, 34),
            self.messages.get('common_buttons', 'resume'), endScene, 7, false, getButtonWidth));

        function getButtonWidth(width, height) {
            if (width < height) {
                return Width.HALF(width);
            }
            return Width.QUARTER(width);
        }

        var itIsOver = false;

        function endScene() {
            if (itIsOver)
                return;
            itIsOver = true;
            function removeDrawables() {
                drawables.forEach(self.stage.remove.bind(self.stage));
            }

            function removeButtons() {
                self.sceneStorage.menuSceneButtons.forEach(self.buttons.remove.bind(self.buttons));
                self.sceneStorage.menuSceneButtons = [];
            }

            removeDrawables();
            removeButtons();
            next();
        }
    };

    return MoveTutorial;
})(Width, Height, Font);