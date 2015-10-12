var SuccessScreenViewModel = (function () {
    "use strict";

    function SuccessScreenViewModel(services) {
        this.stage = services.stage;
        this.timer = services.timer;
    }

    SuccessScreenViewModel.prototype.doSkip = function () {
        this.nextScene();
    };

    SuccessScreenViewModel.prototype.downSkip = function () {
        this.okBtn.data = this.stage.getGraphic('button_white');
        var self = this;
        this.timer.doLater(function () {
            self.okBtn.data = self.stage.getGraphic('button');
        }, 16);
    };

    return SuccessScreenViewModel;
})();