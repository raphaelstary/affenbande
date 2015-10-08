var SuccessScreenViewModel = (function () {
    "use strict";

    function SuccessScreenViewModel(services) {
        this.timer = services.timer;
        this.sceneStorage = services.sceneStorage;
    }

    SuccessScreenViewModel.prototype.doSkip = function () {
        this.nextScene();
    };

    return SuccessScreenViewModel;
})();