window.onload = function () {
    "use strict";

    window.appName = 'affenbande';
    window.appVersion = '0.1.0';
    var app = Bootstrapper.atlas().pointer().responsive().orientation().visibility().analytics('https://localhost:8088',
        'HA-aec4a816', window.appName).fullScreen().build(MyGameResources);
    app.start();
};