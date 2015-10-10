var UnlockLockViewModel = (function () {
    "use strict";

    function UnlockLockViewModel() {
    }

    UnlockLockViewModel.prototype.itIsOver = function () {
        this.nextScene();
    };

    return UnlockLockViewModel;
})();