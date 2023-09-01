class Ghost extends Sprite {
    constructor(x: number, y: number, source: Ball, target: Ball, dmg: number) {
        let revealFilter = new RevealFilter(0);
        
        super({
            x, y,
            texture: 'ghost',
            layer: Battle.Layers.fx,
            alpha: 0.5,
            effects: { pre: { filters: [revealFilter, new FlipbookFilter(2, 2, 60, 2)] }, outline: {}, post: { filters: [] } },
        });

        this.addChild(new StatViewer({ type: 'damage', getDamage: () => dmg }, 1, 1));

        let ghost = this;
        this.runScript(function*() {
            yield S.tween(0.5, revealFilter, 'amount', 0, 1);

            while (target.world) {
                ghost.x = M.lerpTime(ghost.x, target.x, 10, ghost.delta);
                ghost.y = M.lerpTime(ghost.y, target.y, 10, ghost.delta);

                if (G.distance(ghost, target) <= 64 && ghost.everyNSeconds(1)) {
                    target.takeDamage(dmg, source, 'other');
                    target.world.playSound('whisper');
                } 

                yield;
            }

            yield S.tween(2, revealFilter, 'amount', 1, 0);
            ghost.kill();
        });
    }
}