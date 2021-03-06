var StartScreenViewModel = (function (checkAndSet30fps, Event, window, showMenu) {
    "use strict";

    function StartScreenViewModel(services) {
        this.timer = services.timer;
        this.sceneStorage = services.sceneStorage;
        this.stage = services.stage;
        this.events = services.events;
        this.device = services.device;
        this.buttons = services.buttons;
        this.messages = services.messages;
        this.sounds = services.sounds;
    }

    StartScreenViewModel.prototype.pressPlay = function () {
        var fps = checkAndSet30fps(this.sceneStorage, this.stage);
        this.events.fire(Event.ANALYTICS, {
            type: 'pressed_play',
            fullScreen: this.device.isFullScreen(),
            orientation: this.device.orientation,
            fps: fps.fps,
            ms: fps.ms
        });

        this.timer.doLater(this.nextScene.bind(this), 16);
    };

    StartScreenViewModel.prototype.downPlay = function () {
        this.playBtn.data = this.stage.getGraphic('button_white');
        var self = this;
        this.timer.doLater(function () {
            self.playBtn.data = self.stage.getGraphic('button');
        }, 16);
    };

    StartScreenViewModel.prototype.pressMore = function () {
        window.location.href = window.moreGamesLink;
    };

    StartScreenViewModel.prototype.downMore = function () {
        this.moreGamesBtn.data = this.stage.getGraphic('button_white');
        var self = this;
        this.timer.doLater(function () {
            self.moreGamesBtn.data = self.stage.getGraphic('button');
        }, 16);
    };

    StartScreenViewModel.prototype.goSettings = function () {
        this.sceneStorage.menuScene = 'settings';

        this.events.fireSync(Event.PAUSE);
        showMenu(this.stage, this.buttons, this.messages, this.events, this.sceneStorage, this.device, this.sounds,
            function () {
            });
    };

    StartScreenViewModel.prototype.downSettings = function () {
        this.settingsBtn.data = this.stage.getGraphic('settings_white');
        var self = this;
        this.timer.doLater(function () {
            self.settingsBtn.data = self.stage.getGraphic('settings');
        }, 16);
    };

    return StartScreenViewModel;
})(checkAndSet30fps, Event, window, showMenu);