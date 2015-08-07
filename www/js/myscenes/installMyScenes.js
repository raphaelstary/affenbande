var installMyScenes = (function (SceneManager, TapManager, Event, ButtonFactory, StartScreen, GameScreen, Font,
    GoFullScreen, RotateDevice, ShowMenuEvented, LevelOverview, MVVMScene) {
    "use strict";

    var BLACK = '#283032';
    var WHITE = '#fff';
    var FONT = 'GameFont';

    var scenes = {
        "start_screen": {
            "screen": {
                "width": 1242,
                "height": 2208
            },
            "layer3": [
                {
                    "type": "image",
                    "x": 515,
                    "y": 894,
                    "width": 252,
                    "height": 252,
                    "filename": "monkey_head.png",
                    "tags": [
                        {
                            "id": "monkey1"
                        }
                    ],
                    "viewId": "monkey1",
                    "scale": 1
                }, {
                    "type": "image",
                    "x": 295,
                    "y": 894,
                    "width": 252,
                    "height": 252,
                    "filename": "monkey.png",
                    "tags": [
                        {
                            "id": "monkey2"
                        }
                    ],
                    "viewId": "monkey2",
                    "scale": 1
                }, {
                    "type": "image",
                    "x": 295,
                    "y": 1114,
                    "width": 252,
                    "height": 252,
                    "filename": "monkey.png",
                    "tags": [
                        {
                            "id": "monkey3"
                        }
                    ],
                    "viewId": "monkey3",
                    "scale": 1
                }, {
                    "type": "image",
                    "x": 295,
                    "y": 1334,
                    "width": 252,
                    "height": 252,
                    "filename": "monkey.png",
                    "tags": [
                        {
                            "id": "monkey4"
                        }
                    ],
                    "viewId": "monkey4",
                    "scale": 1
                }, {
                    "type": "image",
                    "x": 295,
                    "y": 1555,
                    "width": 252,
                    "height": 252,
                    "filename": "monkey_head.png",
                    "tags": [
                        {
                            "id": "monkey5"
                        }
                    ],
                    "viewId": "monkey5",
                    "scale": 1
                }
            ],
            "layer2": [
                {
                    "type": "image",
                    "x": 618,
                    "y": 324,
                    "width": 952,
                    "height": 157,
                    "filename": "logo.png"
                }, {
                    "type": "image",
                    "x": 954,
                    "y": 893,
                    "width": 237,
                    "height": 235,
                    "filename": "leave.png",
                    "scale": 0.99
                }, {
                    "type": "image",
                    "x": 734,
                    "y": 674,
                    "width": 237,
                    "height": 235,
                    "filename": "leave.png",
                    "scale": 0.99
                }, {
                    "type": "image",
                    "x": 514,
                    "y": 1113,
                    "width": 237,
                    "height": 235,
                    "filename": "leave.png",
                    "scale": 0.99
                }
            ],
            "layer1": [
                {
                    "type": "button",
                    "viewId": "playBtn",
                    "text": {
                        "type": "text",
                        "x": 621,
                        "y": 1606,
                        "width": 154,
                        "height": 76,
                        "msg": "play",
                        "font": "Janda Silly Monkey",
                        "size": 85,
                        "color": "#515349"
                    },
                    "input": {
                        "type": "rectangle",
                        "x": 621,
                        "y": 1493,
                        "width": 1191,
                        "height": 453,
                        "tags": [
                            "input"
                        ],
                        "filled": false,
                        "color": "#000000"
                    },
                    "background": {
                        "type": "rectangle",
                        "x": 621,
                        "y": 1605,
                        "width": 666,
                        "height": 169,
                        "tags": [
                            "background"
                        ],
                        "alpha": 0.5,
                        "filled": true,
                        "color": "#ffffff"
                    }
                }, {
                    "type": "button",
                    "viewId": "moreBtn",
                    "text": {
                        "type": "text",
                        "x": 620,
                        "y": 1830,
                        "width": 467,
                        "height": 81,
                        "msg": "more games",
                        "font": "Janda Silly Monkey",
                        "size": 85,
                        "color": "#515349"
                    },
                    "input": {
                        "type": "rectangle",
                        "x": 621,
                        "y": 1876,
                        "width": 1191,
                        "height": 301,
                        "tags": [
                            "input"
                        ],
                        "filled": false,
                        "color": "#000000"
                    },
                    "background": {
                        "type": "rectangle",
                        "x": 621,
                        "y": 1831,
                        "width": 666,
                        "height": 169,
                        "tags": [
                            "background"
                        ],
                        "alpha": 0.5,
                        "filled": true,
                        "color": "#ffffff"
                    }
                }
            ],
            "layer0": [
                {
                    "type": "image",
                    "x": -152,
                    "y": 2044,
                    "width": 329,
                    "height": 215,
                    "filename": "cloud_1.png",
                    "tags": [
                        {
                            "id": "cloud1"
                        }
                    ],
                    "viewId": "cloud1",
                    "scale": 1
                }, {
                    "type": "image",
                    "x": -112,
                    "y": 1423,
                    "width": 237,
                    "height": 144,
                    "filename": "cloud_4.png",
                    "tags": [
                        {
                            "id": "cloud2"
                        }
                    ],
                    "viewId": "cloud2",
                    "scale": 1
                }, {
                    "type": "image",
                    "x": -124,
                    "y": 1268,
                    "width": 251,
                    "height": 142,
                    "filename": "cloud_3.png",
                    "tags": [
                        {
                            "id": "cloud3"
                        }
                    ],
                    "viewId": "cloud3",
                    "scale": 1
                }, {
                    "type": "image",
                    "x": -193,
                    "y": 830,
                    "width": 390,
                    "height": 238,
                    "filename": "cloud_2.png",
                    "tags": [
                        {
                            "id": "cloud4"
                        }
                    ],
                    "viewId": "cloud4",
                    "scale": 1
                }, {
                    "type": "image",
                    "x": -162,
                    "y": 207,
                    "width": 329,
                    "height": 215,
                    "filename": "cloud_1.png",
                    "tags": [
                        {
                            "id": "cloud5"
                        }
                    ],
                    "viewId": "cloud5",
                    "scale": 1
                }
            ]
        }
    };

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

        var viewModel = function () {
            console.log('todo implement');
        };
        //var startScreen = new StartScreen(sceneServices);
        var startScreen = new MVVMScene(sceneServices, scenes.start_screen, viewModel);
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