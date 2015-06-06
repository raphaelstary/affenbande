var drawButtons = (function (Width, Height, window) {
    "use strict";

    function drawButtons(buttons, messages, timer, callback) {
        var buttonsStore = [];

        function getButtonWidth(width, height) {
            if (width < height) {
                return Width.HALF(width);
            }
            return Width.QUARTER(width);
        }

        var start = buttons.createPrimaryButton(Width.HALF, Height.get(48, 36), messages.get('start', 'play'),
            function () {
                timer.doLater(callback, 6);
            }, 3, false, getButtonWidth);
        buttonsStore.push(start);
        var moreGames = buttons.createPrimaryButton(Width.HALF, Height.get(480, 405),
            messages.get('start', 'more_games'), function () {
                window.location.href = window.moreGamesLink;
            }, 3, false, getButtonWidth);
        buttonsStore.push(moreGames);

        return buttonsStore;
    }

    return drawButtons;
})(Width, Height, window);