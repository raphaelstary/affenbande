var SuccessScreenViewModel = (function () {
    "use strict";

    function SuccessScreenViewModel(services) {
        this.stage = services.stage;
    }

    SuccessScreenViewModel.prototype.postConstruct = function () {
        this.bg = this.stage.createRectangle(true).setWidth(Width.FULL).setHeight(Height.FULL).setPosition(Width.HALF,
            Height.HALF).setColor('black').setAlpha(0.5).setZIndex(6);
    };

    SuccessScreenViewModel.prototype.preDestroy = function () {
        this.bg.remove();
    };

    SuccessScreenViewModel.prototype.doSkip = function () {
        this.nextScene();
    };

    return SuccessScreenViewModel;
})();