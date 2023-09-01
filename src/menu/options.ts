class OptionsMenu extends Menu {
    constructor() {
        super({
            backgroundColor: 0x000000,
            volume: 0,
        });

        this.addWorldObject(new Theater.WorldAsWorldObject(_MENUS_ARENA_WORLD));
        
        addOptionsMenu(this);

        this.select.name('restart').removeFromWorld();
        this.select.name('areyousure').removeFromWorld();

        let gear = this.addWorldObject(new Sprite({
            x: 14, y: this.height-14,
            texture: 'gear',
            bounds: new CircleBounds(0, 0, 11),
        }));
        gear.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                global.game.menuSystem.back();
            },
        }));
    }

    update() {
        super.update();

        if (Input.justDown(Input.GAME_CLOSE_MENU)) {
            Input.consume(Input.GAME_CLOSE_MENU);
            global.game.menuSystem.back();
        }
    }
}