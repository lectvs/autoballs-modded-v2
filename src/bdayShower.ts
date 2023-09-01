class BdayShower extends WorldObject {
    constructor() {
        super();
        this.addTimer(0.3, () => this.addEmoji(), Infinity);
    }

    private addEmoji() {
        this.world.addWorldObject(new Sprite({
            x: Random.float(20, global.gameWidth-20), y: -20,
            texture: `bdayemojis/${Random.int(0, 3)}`,
            vy: 100,
            gravityy: 100,
            life: 1,
            update: function() {
                this.alpha = M.lerp(1, 0, this.life.progress);
            }
        }));
    }
}