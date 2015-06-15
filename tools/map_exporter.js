function onOpen() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var menuEntries = [
        {
            name: "Export Levels",
            functionName: "exportLevels"
        }
    ];
    ss.addMenu("Export JSON", menuEntries);
}

function makeTextBox(app, name) {
    return app.createTextArea().setWidth('100%').setHeight('200px').setId(name).setName(name);
}

function exportLevels() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var sheetsData = {};
    for (var i = 0; i < sheets.length; i++) {
        var sheet = sheets[i];
        var sheetName = sheet.getName();
        if (sheetName.indexOf('Level') === 0) {
            sheetsData[sheetName.substring(5)] = getRows(sheet);
        }
    }
    return displayText_(JSON.stringify(sheetsData));
}

function displayText_(text) {
    var app = UiApp.createApplication().setTitle('Exported JSON');
    app.add(makeTextBox(app, 'json'));
    app.getElementById('json').setText(text);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ss.show(app);
    return app;
}

var BackgroundTiles = {
    T1: 4,
    T2: 5,
    T3: 6
};
var Tiles = {
    '#': 1,
    '!': 2,
    '@': 3,
    B: 9,
    S0: 20,
    S1: 21,
    S2: 22,
    S3: 23,
    S4: 24,
    S5: 25,
    S6: 26,
    S7: 27,
    S8: 28,
    S9: 29
};

function getRows(sheet) {
    var returnObject = {
        background: [],
        foreground: []
    };
    var values = sheet.getSheetValues(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());

    for (var i = 0; i < values.length; i++) {
        var row = values[i];
        var foregroundRow = [];
        var backgroundRow = [];
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];

            foregroundRow.push(getTileCode(cell));
            backgroundRow.push(getBackgroundTileCode(cell));
        }
        returnObject.foreground.push(foregroundRow);
        returnObject.background.push(backgroundRow);
    }
    return returnObject;
}

function getTileCode(cellValue) {
    for (var key in Tiles)
        if (contains(cellValue, key))
            return Tiles[key];
    return 0;
}

function getBackgroundTileCode(cellValue) {
    for (var key in BackgroundTiles)
        if (contains(cellValue, key))
            return BackgroundTiles[key];
    return 0;
}

function contains(cell, string) {
    return cell.indexOf(string) !== -1;
}