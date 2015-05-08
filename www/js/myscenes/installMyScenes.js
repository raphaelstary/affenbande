var installMyScenes = (function (SceneManager) {
    "use strict";

    function installMyScenes(sceneServices) {
        // create your scenes and add them to the scene manager

        var sceneManager = new SceneManager();

        var gameScreen = new GameScreen(sceneServices);
        sceneManager.add(gameScreen.show.bind(gameScreen));

        return sceneManager;
    }

    return installMyScenes;
})(SceneManager);