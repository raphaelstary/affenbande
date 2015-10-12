var SuccessScreenViewModel = (function () {
    "use strict";

    function SuccessScreenViewModel(services) {
        this.stage = services.stage;
    }

    SuccessScreenViewModel.prototype.doSkip = function () {
        this.nextScene();
    };

    SuccessScreenViewModel.prototype.downSkip = function () {

    };

    return SuccessScreenViewModel;
})();