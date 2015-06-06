var drawClouds = (function (Width, Height) {
    "use strict";

    function drawClouds(stage) {
        var drawables = [];
        var cloud1 = stage.drawFresh(Width.THIRD, Height.get(48, 8), 'cloud_1', 2);
        drawables.push(cloud1);
        var cloud2 = stage.drawFresh(Width.TWO_THIRD, Height.get(48, 20), 'cloud_2', 2);
        drawables.push(cloud2);
        var cloud3 = stage.drawFresh(Width.QUARTER, Height.get(48, 26), 'cloud_3', 2);
        drawables.push(cloud3);
        var cloud4 = stage.drawFresh(Width.THREE_QUARTER, Height.get(48, 31), 'cloud_4', 2);
        drawables.push(cloud4);
        var cloud5 = stage.drawFresh(Width.get(5, 2), Height.get(48, 45), 'cloud_1', 2);
        drawables.push(cloud5);

        return drawables;
    }

    return drawClouds;
})(Width, Height);