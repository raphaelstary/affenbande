var MyGameResources = (function (addFontToDOM, UniversalTranslator, SoundSpriteManager, AtlasResourceHelper, URL,
    document, width, height, userAgent, DeviceInfo, window, Constants) {
    "use strict";

    var gameFont, logoFont, locales, atlases = [], images = {}, moreGames, levels, scenes;

    function registerFiles(resourceLoader) {
        gameFont = resourceLoader.addFont('data/gamefont.woff');
        logoFont = resourceLoader.addFont('data/dooodleista.woff');
        locales = resourceLoader.addJSON('data/locales.json');
        moreGames = resourceLoader.addJSON('data/more_games.json');
        levels = resourceLoader.addJSON('data/levels.json');
        scenes = resourceLoader.addJSON('data/scenes.json');

        var isMobile = new DeviceInfo(userAgent, 1, 1, 1).isMobile;

        AtlasResourceHelper.register(resourceLoader, atlases, isMobile);

        return 4 + atlases.length;
    }

    function processFiles() {

        if (URL) {
            addFontToDOM([
                {
                    name: Constants.GAME_FONT,
                    url: URL.createObjectURL(gameFont.blob)
                }, {
                    name: Constants.LOGO_FONT,
                    url: URL.createObjectURL(logoFont.blob)
                }
            ]);
        }

        window.moreGamesLink = moreGames.link;

        return {
            messages: new UniversalTranslator(locales),
            gfxCache: AtlasResourceHelper.process(atlases, width, height),
            levels: levels,
            scenes: scenes
        };
    }

    return {
        create: registerFiles,
        process: processFiles
    };
})(addFontToDOM, UniversalTranslator, SoundSpriteManager, AtlasResourceHelper, window.URL || window.webkitURL,
    window.document, window.innerWidth, window.innerHeight, window.navigator.userAgent, DeviceInfo, window, Constants);