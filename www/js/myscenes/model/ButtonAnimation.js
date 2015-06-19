var ButtonAnimation = (function () {
    "use strict";

    function ButtonAnimation(stage, timer) {
        this.stage = stage;
        this.timer = timer;
    }

    ButtonAnimation.prototype.start = function () {
        var triangle, active;
        var animatedOne, animatedTwo, animatedThree;

        function __1() {
            return 1;
        }

        if (side == L_SIDE) {
            active = this.stage.drawEqTriangle(this.__leftX(u, v), this.__leftY(u, v), L_SIDE_START_ANGLE,
                this.__getRadius.bind(this), $.ACTIVE_TRIANGLE_COLOR, false, __1, 4);
            triangle = this.stage.drawEqTriangle(this.__leftX(u, v), this.__leftY(u, v), L_SIDE_START_ANGLE,
                this.__getRadius.bind(this), WHITE, true);
            animatedOne = this.stage.drawEqTriangle(this.__leftX(u, v), this.__leftY(u, v), L_SIDE_START_ANGLE,
                this.__getRadius.bind(this), $.WAVE_COLOR, false, __1, 3, 1, 0, 1);
            animatedTwo = this.stage.drawEqTriangle(this.__leftX(u, v), this.__leftY(u, v), L_SIDE_START_ANGLE,
                this.__getRadius.bind(this), $.WAVE_COLOR, false, __1, 3, 1, 0, 1);
            animatedThree = this.stage.drawEqTriangle(this.__leftX(u, v), this.__leftY(u, v), L_SIDE_START_ANGLE,
                this.__getRadius.bind(this), $.WAVE_COLOR, false, __1, 3, 1, 0, 1);
        } else if (side == R_SIDE) {
            active = this.stage.drawEqTriangle(this.__rightX(u, v), this.__rightY(u, v), R_SIDE_START_ANGLE,
                this.__getRadius.bind(this), $.ACTIVE_TRIANGLE_COLOR, false, __1, 4);
            triangle = this.stage.drawEqTriangle(this.__rightX(u, v), this.__rightY(u, v), R_SIDE_START_ANGLE,
                this.__getRadius.bind(this), WHITE, true);
            animatedOne = this.stage.drawEqTriangle(this.__rightX(u, v), this.__rightY(u, v), R_SIDE_START_ANGLE,
                this.__getRadius.bind(this), $.WAVE_COLOR, false, __1, 3, 1, 0, 1);
            animatedTwo = this.stage.drawEqTriangle(this.__rightX(u, v), this.__rightY(u, v), R_SIDE_START_ANGLE,
                this.__getRadius.bind(this), $.WAVE_COLOR, false, __1, 3, 1, 0, 1);
            animatedThree = this.stage.drawEqTriangle(this.__rightX(u, v), this.__rightY(u, v), R_SIDE_START_ANGLE,
                this.__getRadius.bind(this), $.WAVE_COLOR, false, __1, 3, 1, 0, 1);
        }

        this.stage.animateAlphaPattern(triangle, [
            {
                value: 1,
                duration: 9,
                easing: Transition.EASE_IN_EXPO
            }, {
                value: 0,
                duration: 3,
                easing: Transition.EASE_OUT_EXPO
            }, {
                value: 1,
                duration: 15,
                easing: Transition.EASE_IN_QUAD
            }
        ]);
        var self = this;

        function extracted(animatedOne, animatedTwo, animatedThree) {
            self.stage.animateScale(animatedOne, $.WAVE_SCALE_FACTOR_MAX, $.WAVE_SCALE_DURATION, Transition.LINEAR,
                false, function () {
                    self.stage.remove(animatedOne);
                    if (self.stage.has(active)) {
                        self.timer.doLater(function () {
                            var a1, a2, a3;
                            if (side == L_SIDE) {
                                a1 = self.stage.drawEqTriangle(self.__leftX(u, v), self.__leftY(u, v),
                                    L_SIDE_START_ANGLE, self.__getRadius.bind(self), $.WAVE_COLOR, false, __1, 3, 1, 0,
                                    1);
                                a2 = self.stage.drawEqTriangle(self.__leftX(u, v), self.__leftY(u, v),
                                    L_SIDE_START_ANGLE, self.__getRadius.bind(self), $.WAVE_COLOR, false, __1, 3, 1, 0,
                                    1);
                                a3 = self.stage.drawEqTriangle(self.__leftX(u, v), self.__leftY(u, v),
                                    L_SIDE_START_ANGLE, self.__getRadius.bind(self), $.WAVE_COLOR, false, __1, 3, 1, 0,
                                    1);
                            } else if (side == R_SIDE) {
                                a1 = self.stage.drawEqTriangle(self.__rightX(u, v), self.__rightY(u, v),
                                    R_SIDE_START_ANGLE, self.__getRadius.bind(self), $.WAVE_COLOR, false, __1, 3, 1, 0,
                                    1);
                                a2 = self.stage.drawEqTriangle(self.__rightX(u, v), self.__rightY(u, v),
                                    R_SIDE_START_ANGLE, self.__getRadius.bind(self), $.WAVE_COLOR, false, __1, 3, 1, 0,
                                    1);
                                a3 = self.stage.drawEqTriangle(self.__rightX(u, v), self.__rightY(u, v),
                                    R_SIDE_START_ANGLE, self.__getRadius.bind(self), $.WAVE_COLOR, false, __1, 3, 1, 0,
                                    1);
                            }

                            extracted(a1, a2, a3);

                        }, $.WAVE_AGAIN_DURATION);
                    }
                });
            self.timer.doLater(function () {
                self.stage.animateScale(animatedTwo, $.WAVE_SCALE_FACTOR_MAX, $.WAVE_SCALE_DURATION, Transition.LINEAR,
                    false, function () {
                        self.stage.remove(animatedTwo);
                    });
            }, $.SECOND_WAVE_DELAY);
            self.timer.doLater(function () {
                self.stage.animateScale(animatedThree, $.WAVE_SCALE_FACTOR_MAX, $.WAVE_SCALE_DURATION,
                    Transition.LINEAR, false, function () {
                        self.stage.remove(animatedThree);
                    });
            }, $.THIRD_WAVE_DELAY);
        }

        extracted(animatedOne, animatedTwo, animatedThree);
    };

    return ButtonAnimation;
})();