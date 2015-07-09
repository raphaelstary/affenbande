window.onload = function () {
    "use strict";

    var app = Bootstrapper.atlas().pointer().responsive().orientation().visibility().analytics('https://localhost:8088',
        'HA-aec4a816', 'affenbande').fullScreen().build(MyGameResources);
    app.start();
};