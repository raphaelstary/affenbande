var Constants = (function () {
    "use strict";

    var GAME_KEY = 'monkey_gang-';

    return {
        GAME_FONT: 'Janda Silly Monkey',
        LOGO_FONT: 'Dooodleista',

        GAME_KEY: GAME_KEY,
        LEVEL_UNLOCKED: GAME_KEY + 'level_unlocked',
        LEVEL_UNLOCKING: GAME_KEY + 'level_unlocking',
        LEVEL_FINISHED: GAME_KEY + 'level_finished',
        LEVEL_FINISHED_NOW: GAME_KEY + 'level_finished_now'
    };
})();