var installMyScenes = (function (SceneManager, TapManager, Event, ButtonFactory, StartScreen, GameScreen, Font,
    GoFullScreen, RotateDevice, ShowMenuEvented, LevelOverview, MVVMScene) {
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

        var sceneManager = new SceneManager();

        var goFullScreen = new GoFullScreen(sceneServices);
        var rotateDevice = new RotateDevice(sceneServices);
        var menuEvented = new ShowMenuEvented(sceneServices);

        var viewModel = {
            postConstruct: function () {
                console.log('scene started');
            },
            preDestroy: function () {
                console.log('scene ended');
            },
            pressPlay: function () {
                this.nextScene();
            },
            pressMore: function () {
                console.log('press more');
            },
            goSettings: function () {
                console.log('go settings');
            },
            pressOk: function () {
                this.nextScene();
            },
            doSkip: function () {
                this.nextScene();
            }
        };
        //var startScreen = new StartScreen(sceneServices);
        var startScreen = new MVVMScene(sceneServices, sceneServices.scenes['finish_level'], viewModel);
        var levelOverview = new LevelOverview(sceneServices);

        sceneManager.add(goFullScreen.show.bind(goFullScreen), true);
        sceneManager.add(rotateDevice.show.bind(rotateDevice), true);
        sceneManager.add(menuEvented.show.bind(menuEvented), true);
        sceneManager.add(startScreen.show.bind(startScreen), true);
        sceneManager.add(levelOverview.show.bind(levelOverview));

        return sceneManager;
    }

    return installMyScenes;
})(SceneManager, TapManager, Event, ButtonFactory, StartScreen, GameScreen, Font, GoFullScreen, RotateDevice,
    ShowMenuEvented, LevelOverview, MVVMScene);