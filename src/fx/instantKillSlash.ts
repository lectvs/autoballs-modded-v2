class InstantKillSlash extends Sprite {
    private target: Ball;
    private source: Ball;

    constructor(target: Ball, source: Ball) {
        super({
            x: target.x, y: target.y,
            animations: [Animations.fromTextureList({ name: 'slash', textureRoot: 'clawslash', textures: [0, 1, 2, 3, 4, 5, 6, 7], frameRate: 32, count: 1 })],
            effects: { outline: { color: 0x000000 }},
            layer: Battle.Layers.fx,
        });

        this.target = target;
        this.source = source;
    }

    onAdd(): void {
        super.onAdd();
        
        this.target.takeDamage(2*this.target.hp, this.source, 'other', true);

        this.runScript(S.chain(
            S.playAnimation(this, 'slash'),
            S.call(() => this.kill()),
        ));

        this.world.playSound('spike');
    }
}