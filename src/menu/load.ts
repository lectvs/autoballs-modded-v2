class LoadMenu extends Menu {
    constructor() {
        super({
            backgroundColor: 0x000000,
            volume: 1,
        });

        let spinner = this.addWorldObject(new Spinner(global.gameWidth/2, global.gameHeight/2 + 40, 2, 8));
        spinner.setVisible(false);

        let logo = this.addWorldObject(new Sprite({
            x: global.gameWidth/2, y: global.gameHeight/2,
            texture: 'lectvslogo',
            effects: { post: { filters: [new Effects.Filters.Glitch(4, 1, 2)] }},
            visible: false,
        }));

        let world = this;
        this.runScript(function*() {
            if (Debug.DEBUG) {
                yield S.waitUntil(() => LoadMenu.HAS_LOADED());
                global.game.loadMainMenu();
            }

            yield S.wait(0.5);

            world.playSound('glitch');
            logo.setVisible(true);
            yield S.wait(0.25);

            logo.effects.post.filters[0].enabled = false;

            async(() => {
                let mm = new MainMenu('initialLoad');
                _MENUS_ARENA_WORLD.allowSounds = false;
                global.game.musicManager.stopMusic();
                mm.update();
                _MENUS_ARENA_WORLD.allowSounds = true;
                mm.render(Texture.NOOP, 0, 0);
            });

            yield S.wait(1.5);

            if (!LoadMenu.HAS_LOADED()) {
                spinner.setVisible(true);
                yield S.waitUntil(() => LoadMenu.HAS_LOADED());
            }

            let sound = world.playSound('glitch');
            spinner.setVisible(false);
            logo.effects.post.filters[0].enabled = true;
            yield S.wait(0.25);
            sound.stop();
            logo.setVisible(false);

            yield S.wait(0.75);
            
            global.game.loadMainMenu();
        });
    }

    static HAS_LOADED() {
        return CloudSave.hasLoaded && LiveVersion.hasLoaded && Weekly.hasLoaded;
    }
}