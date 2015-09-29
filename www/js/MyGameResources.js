var MyGameResources = (function (addFontToDOM, UniversalTranslator, SoundSpriteManager, AtlasResourceHelper, URL,
    document, width, height, userAgent, DeviceInfo, window) {
    "use strict";

    var FONT = 'GameFont';
    var LOGO_FONT = 'LogoFont';

    var gameFont, logoFont, locales, atlases = [], images = {}, moreGames, levels, scenes, imgBg;

    function registerFiles(resourceLoader) {
        gameFont = resourceLoader.addFont('data/gamefont.woff');
        logoFont = resourceLoader.addFont('data/dooodleista.woff');
        locales = resourceLoader.addJSON('data/locales.json');
        moreGames = resourceLoader.addJSON('data/more_games.json');
        levels = resourceLoader.addJSON('data/levels.json');
        scenes = resourceLoader.addJSON('data/scenes.json');
        imgBg = resourceLoader.addImage('gfx/uniform_bg.png');

        var isMobile = new DeviceInfo(userAgent, 1, 1, 1).isMobile;

        AtlasResourceHelper.register(resourceLoader, atlases, isMobile);

        return 4 + atlases.length;
    }

    function processFiles() {

        if (URL) {
            addFontToDOM([
                {
                    name: FONT,
                    url: URL.createObjectURL(gameFont.blob)
                }, {
                    name: LOGO_FONT,
                    url: URL.createObjectURL(logoFont.blob)
                }
            ]);
        }

        window.moreGamesLink = moreGames.link;

        // game specific hack
        var gfxCache = AtlasResourceHelper.process(atlases, width, height);
        var frame = {
            x: 0,
            y: 0,
            w: imgBg.width,
            h: imgBg.height
        };
        var elem = {
            frame: frame,
            sourceSize: frame,
            spriteSourceSize: frame
        };
        gfxCache.atlasDict['uniform_bg'] = gfxCache._createSubImage(elem, imgBg, gfxCache.defaultScaleFactor);

        return {
            messages: new UniversalTranslator(locales),
            gfxCache: gfxCache,
            levels: levels,
            scenes: scenes
        };
    }

    return {
        create: registerFiles,
        process: processFiles
    };
})(addFontToDOM, UniversalTranslator, SoundSpriteManager, AtlasResourceHelper, window.URL || window.webkitURL,
    window.document, window.innerWidth, window.innerHeight, window.navigator.userAgent, DeviceInfo, window);