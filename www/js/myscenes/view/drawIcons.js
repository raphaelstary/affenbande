var drawIcons = (function (Width, Height, Font, Event, showMenu) {
    "use strict";

    function drawIcons(stage, sceneStorage, events, buttons, messages, device, sounds, tap, isInGame) {
        var drawables = [];
        var taps = [];

        var icon = stage.drawFresh(Width.get(32, 2), Height.get(48, 2), isInGame ? 'pause' : 'settings');

        function getX() {
            return icon.x;
        }

        function getY() {
            return icon.y;
        }

        function getWidth() {
            return icon.getHeight() * 2;
        }

        function getHeight() {
            return icon.getHeight() * 2;
        }

        var wrapper = stage.drawRectangleWithInput(getX, getY, getWidth, getHeight, '#fff', true, undefined, 2, 0.5,
            undefined, undefined, [icon]);
        tap.add(wrapper.input, goToSettings);
        drawables.push(icon);
        drawables.push(wrapper.drawable);
        taps.push(wrapper.input);

        function goToSettings() {
            sceneStorage.menuScene = 'settings';
            showSettingsScreen();
        }

        function showSettingsScreen() {
            events.fireSync(Event.PAUSE);
            showMenu(stage, buttons, messages, events, sceneStorage, device, sounds, hideSettings)
        }

        function hideSettings() {
            //settingsButton.used = false;
            //achievementsButton.used = false;
        }

        return {
            drawables: drawables,
            taps: taps
        };
    }

    return drawIcons;
})(Width, Height, Font, Event, showMenu);