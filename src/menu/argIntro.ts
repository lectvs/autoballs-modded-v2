class ArgIntroMenu extends Menu {
    constructor(snapshot: Texture) {
        super({
            backgroundColor: 0x000000,
            volume: 1,
        });

        let oldMenu = this.addWorldObject(new Sprite({
            texture: snapshot,
            effects: { post: { filters: [new Effects.Filters.Glitch(60, 0, 30)] }},
        }));

        let g = new Effects.Filters.Glitch(0, 2, 16);
        let qr = this.addWorldObject(new Sprite({
            x: this.width/2, y: this.height/2,
            texture: 'arg/qr_intro',
            effects: { post: { filters: [g] }},
            alpha: 0,
        }));

        this.runScript(function*() {
            global.game.stopMusic();
            let sound = global.game.playSound('arg/glitch_dialog');
            yield S.wait(0.5);
            sound.hang();
            yield S.wait(4.5);
            sound.stop();

            oldMenu.kill();

            yield S.wait(4);
            global.game.musicManager.playMusic('arg/arg');
            yield S.wait(4);
            yield S.tween(4, qr, 'alpha', 0, 1);

            while (true) {
                g.strength = 2;
                yield S.wait(1.1);
                g.strength = 0;
                yield S.wait(4);
            }
        });
    }
}