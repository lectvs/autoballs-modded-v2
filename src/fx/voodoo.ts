class Voodoo extends Sprite {
    private host: Pt;

    constructor(host: Pt) {
        super({
            x: host.x, y: host.y,
            texture: 'voodoo',
            layer: Battle.Layers.fg,
            tint: 0x000000,
            alpha: 0,
        });
        this.host = host;
    }

    onAdd() {
        super.onAdd();

        this.addTimer(0.01, () => this.offsetX = Random.int(-1, 0), Infinity);

        let voodoo = this;

        this.runScript(function*() {
            yield S.wait(0.05);
            voodoo.tint = 0xB200B2;
        });

        this.runScript(function*() {
            yield S.tween(0.3, voodoo, 'alpha', 0, 1);
            yield S.tween(0.1, voodoo, 'alpha', 1, 0.8);
            yield S.wait(0.1);
            
            voodoo.world.addWorldObject(new BurstPuffSystem({
                x: voodoo.x,
                y: voodoo.y,
                layer: Battle.Layers.fx,
                puffCount: Math.floor(12 * getParticleLevel()),
                puffConfigFactory: () => ({
                    maxLife: 0.6,
                    v: Random.inCircle(70),
                    color: 0xB200B2,
                    radius: 4,
                    finalRadius: 0,
                }),
            }));
            voodoo.kill();
        });
    }

    postUpdate() {
        super.postUpdate();
        this.x = this.host.x;
        this.y = this.host.y;
    }
}