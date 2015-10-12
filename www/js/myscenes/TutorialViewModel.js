var TutorialViewModel = (function () {
    "use strict";

    function TutorialViewModel() {
    }

    TutorialViewModel.prototype.pressOk = function () {
        this.nextScene();
    };

    TutorialViewModel.prototype.downOk = function () {

    };

    return TutorialViewModel;
})();