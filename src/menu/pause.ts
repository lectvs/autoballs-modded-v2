class PauseMenu extends Menu {
    constructor() {
        super({
            backgroundColor: 0x000000,
            volume: 0,
        });

        this.addWorldObject(new Sprite({
            texture: global.world.takeSnapshot().transform({ filters: [new BlurFilter(26.7)] }, 'PauseMenu'),
        }));

        addOptionsMenu(this);

        this.select.name('areyousure').setVisible(false);
        this.select.name('restart').addModule(new Button({
            hoverTint: 0xFF8800,
            clickTint: 0xBB0000,
            onClick: () => {
                global.game.playSound('click');
                this.select.name('restart').kill();
                this.select.name('areyousure').setVisible(true);
                this.select.name('areyousure').addModule(new Button({
                    hoverTint: 0xFF8800,
                    clickTint: 0xBB0000,
                    onClick: () => {
                        global.game.musicManager.volumeScale *= 3;
                        global.game.playSound('click');
                        global.game.loadMainMenu();
                    },
                }));
            },
        }));

        let gear = this.addWorldObject(new Sprite({
            x: 11, y: this.height-11,
            texture: 'gear',
            bounds: new CircleBounds(0, 0, 11),
        }));
        gear.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onClick: () => {
                global.game.playSound('click');
                this.unpause();
            },
        }));

        global.game.musicManager.volumeScale /= 3;
    }

    unpause() {
        global.game.musicManager.volumeScale *= 3;
        global.game.unpauseGame();
    }

    update() {
        super.update();

        if (Input.justDown(Input.GAME_PAUSE)) {
            Input.consume(Input.GAME_PAUSE);
            this.unpause();
        }
    }
}