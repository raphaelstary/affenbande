var GoldenCoconutViewModel = (function () {
    "use strict";

    function GoldenCoconutViewModel() {
    }

    GoldenCoconutViewModel.prototype.itIsOver = function () {
        this.nextScene();
    };

    return GoldenCoconutViewModel;
})();