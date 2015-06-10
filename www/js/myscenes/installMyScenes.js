var installMyScenes = (function (SceneManager, TapManager, Event, ButtonFactory, StartScreen, GameScreen, Font,
    GoFullScreen, RotateDevice, ShowMenuEvented, LevelOverview) {
    "use strict";

    var BLACK = '#283032';
    var WHITE = '#fff';
    var FONT = 'GameFont';

    function installMyScenes(sceneServices) {

        var tap = new TapManager();
        sceneServices.tap = tap;
        sceneServices.events.subscribe(Event.POINTER, tap.inputChanged.bind(tap));

        sceneServices.buttons = new ButtonFactory(sceneServices.stage, tap, sceneServices.timer, FONT, function () {
            //sceneServices.sounds.play(CLICK);
        }, WHITE, BLACK, Font._30, 3, WHITE, WHITE, Font._40, 2);

        var goFullScreen = new GoFullScreen(sceneServices);
        var rotateDevice = new RotateDevice(sceneServices);
        var menuEvented = new ShowMenuEvented(sceneServices);

        var sceneManager = new SceneManager();
        var startScreen = new StartScreen(sceneServices);
        var levelOverview = new LevelOverview(sceneServices);
        var playScreen = new GameScreen(sceneServices);

        sceneManager.add(goFullScreen.show.bind(goFullScreen), true);
        sceneManager.add(rotateDevice.show.bind(rotateDevice), true);
        sceneManager.add(menuEvented.show.bind(menuEvented), true);
        sceneManager.add(startScreen.show.bind(startScreen), true);
        sceneManager.add(levelOverview.show.bind(levelOverview));
        sceneManager.add(playScreen.show.bind(playScreen));

        return sceneManager;
    }

    return installMyScenes;
})(SceneManager, TapManager, Event, ButtonFactory, StartScreen, GameScreen, Font, GoFullScreen, RotateDevice,
    ShowMenuEvented, LevelOverview);