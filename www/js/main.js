window.onload = function () {
    "use strict";

    var app = Bootstrapper.pointer().responsive().build(MyGameResources);
    app.start();
};