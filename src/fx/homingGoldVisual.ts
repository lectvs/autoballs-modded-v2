class HomingGoldVisual extends Sprite {
    target: Pt;
    private gold: number;
    private gainDir: 'up' | 'down';

    constructor(x: number, y: number, target: Pt, gold: number, gainDir: 'up' | 'down' = 'up') {
        super({
            x, y,
            texture: 'aura',
            tint: 0xFFFF00,
            blendMode: Texture.BlendModes.ADD,
            scale: 0.1,
            layer: Battle.Layers.ui,
        });

        this.target = target;
        this.gold = gold;
        this.gainDir = gainDir;
    }

    onAdd() {
        this.world.playSound('sellball', { limit: 2 });
            
        let sendScript = this.runScript(sendTo(0.7, this, this.target, Ball.Random.onCircle(150)));

        this.runScript(S.chain(
            S.waitUntil(() => sendScript.done || (this.life.time > 0.5 && G.distance(this, this.target) < 4)),
            S.call(() => {
                if (this.world) {
                    let d = this.gainDir === 'up' ? -8 : 8;
                    this.world.addWorldObject(new GainedGold(this.target.x, this.target.y + d, this.gold, this.gainDir));
                    this.world.playSound('buyball');
                }
                this.kill();
            }),
        ));
    }
}

function animateGiveOrTakeShopGold(world: World, source: Pt, gold: number) {
    world.runScript(function*() {
        if (gold === 0) return;

        let displayedGold = world.select.type(DisplayedGold);
        if (!displayedGold) return;

        if (gold > 0) {
            displayedGold.addReservedGold(gold);

            let homingGold = world.addWorldObject(new HomingGoldVisual(source.x, source.y, displayedGold.getPosition().add(4, 0), gold, 'down'));
            yield S.waitUntil(() => !homingGold.world);

            displayedGold.removeReservedGold(gold);
        } else {
            let homingGold = world.addWorldObject(new HomingGoldVisual(displayedGold.x + 4, displayedGold.y, source, -gold, 'up'));
            yield S.waitUntil(() => !homingGold.world);
        }

        displayedGold.updateText();
    });
}