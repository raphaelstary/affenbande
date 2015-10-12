var TutorialViewModel = (function () {
    "use strict";

    function TutorialViewModel(services) {
        this.timer = services.timer;
        this.stage = services.stage;
    }

    TutorialViewModel.prototype.pressOk = function () {
        this.nextScene();
    };

    TutorialViewModel.prototype.downOk = function () {
        this.okBtn.data = this.stage.getGraphic('button_white');
        var self = this;
        this.timer.doLater(function () {
            self.okBtn.data = self.stage.getGraphic('button');
        }, 16);
    };

    return TutorialViewModel;
})();