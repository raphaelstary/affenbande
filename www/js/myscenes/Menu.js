var Menu = (function (Width, Height, changeSign, Transition, Event, Settings, PauseMenu, Credits) {
    "use strict";

    function Menu(services) {
        this.stage = services.stage;
        this.buttons = services.buttons;
        this.messages = services.messages;
        this.events = services.events;
        this.sceneStorage = services.sceneStorage;
        this.device = services.device;
        this.sounds = services.sounds;
    }

    var SubScenes = {
        SETTINGS: 'settings',
        PAUSE_MENU: 'pause_menu',
        CREDITS: 'credits'
    };

    Menu.prototype.show = function (next) {
        this.sceneStorage.menuOn = true;
        var self = this;
        var backBlur;
        this.sceneStorage.menuSceneButtons = [];
        var resume = self.events.subscribe(Event.RESUME_MENU, function () {
            self.sceneStorage.menuSceneButtons.forEach(self.buttons.enable.bind(self.buttons));
        });

        showMenu();

        function showMenu() {

            backBlur = self.stage.drawRectangle(changeSign(Width.HALF), Height.HALF, Width.FULL, Height.FULL, '#000',
                true, undefined, 6, 0.8);
            var callback;
            if (self.sceneStorage.menuScene == SubScenes.SETTINGS) {
                callback = showSettings;
            } else if (self.sceneStorage.menuScene == SubScenes.PAUSE_MENU) {
                callback = showPauseMenu;
            } else if (self.sceneStorage.menuScene == SubScenes.CREDITS) {
                callback = showCredits;
            }
            self.stage.move(backBlur, Width.HALF, Height.HALF, 15, Transition.EASE_IN_EXPO, false, callback);
        }

        function hideMenu() {
            self.events.unsubscribe(resume);

            delete self.sceneStorage.menuSceneButtons;

            self.stage.move(backBlur, changeSign(Width.HALF), Height.HALF, 15, Transition.EASE_OUT_EXPO, false,
                function () {
                    self.stage.remove(backBlur);
                    self.events.fire(Event.RESUME);
                    self.sceneStorage.menuOn = false;
                    next();
                });
        }

        function showSettings() {
            var settings = new Settings({
                stage: self.stage,
                buttons: self.buttons,
                messages: self.messages,
                events: self.events,
                sceneStorage: self.sceneStorage,
                device: self.device,
                sounds: self.sounds
            });
            settings.show(hideMenu);
        }

        function showPauseMenu() {
            var pauseMenu = new PauseMenu({
                stage: self.stage,
                buttons: self.buttons,
                messages: self.messages,
                sceneStorage: self.sceneStorage,
                sounds: self.sounds,
                events: self.events,
                device: self.device,
            });
            pauseMenu.show(hideMenu);
        }

        function showCredits() {
            var credits = new Credits({
                stage: self.stage,
                buttons: self.buttons,
                messages: self.messages,
                sceneStorage: self.sceneStorage,
                sounds: self.sounds,
                events: self.events,
                device: self.device,
            });
            credits.show(hideMenu);
        }
    };

    return Menu;
})(Width, Height, changeSign, Transition, Event, Settings, PauseMenu, Credits);