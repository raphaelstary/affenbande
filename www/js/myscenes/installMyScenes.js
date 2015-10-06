var installMyScenes = (function (SceneManager, TapManager, Event, ButtonFactory, GameScreen, Font, GoFullScreen,
    RotateDevice, ShowMenuEvented, LevelOverviewViewModel, MVVMScene, StartScreenViewModel, PreStartScreen, Constants) {
    "use strict";

    var BLACK = '#283032';
    var WHITE = '#fff';

    function installMyScenes(sceneServices) {

        var tap = new TapManager();
        sceneServices.tap = tap;
        sceneServices.events.subscribe(Event.POINTER, tap.inputChanged.bind(tap));

        sceneServices.buttons = new ButtonFactory(sceneServices.stage, tap, sceneServices.timer, Constants.GAME_FONT,
            function () {
                //sceneServices.sounds.play(CLICK);
            }, WHITE, BLACK, Font._30, 3, WHITE, WHITE, Font._40, 2);

        var sceneManager = new SceneManager();

        var goFullScreen = new GoFullScreen(sceneServices);
        var rotateDevice = new RotateDevice(sceneServices);
        var menuEvented = new ShowMenuEvented(sceneServices);
        var preStartScreen = new PreStartScreen(sceneServices);

        var startScreen = new MVVMScene(sceneServices, sceneServices.scenes['start_screen'],
            new StartScreenViewModel(sceneServices));
        var levelOverview = new MVVMScene(sceneServices, sceneServices.scenes['level_overview'],
            new LevelOverviewViewModel(sceneServices));

        sceneManager.add(goFullScreen.show.bind(goFullScreen), true);
        sceneManager.add(rotateDevice.show.bind(rotateDevice), true);
        sceneManager.add(menuEvented.show.bind(menuEvented), true);
        sceneManager.add(preStartScreen.show.bind(preStartScreen), true);
        sceneManager.add(startScreen.show.bind(startScreen), true);
        sceneManager.add(levelOverview.show.bind(levelOverview));

        return sceneManager;
    }

    return installMyScenes;
})(SceneManager, TapManager, Event, ButtonFactory, GameScreen, Font, GoFullScreen, RotateDevice, ShowMenuEvented,
    LevelOverviewViewModel, MVVMScene, StartScreenViewModel, PreStartScreen, Constants);