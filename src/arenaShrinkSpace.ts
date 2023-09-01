class ArenaShrinkSpace extends PhysicsWorldObject {
    private centerBlackHole: CenterBlackHole;
    private blackHole: Sprite;

    static BASE_GRAVITY_FACTOR = 0.5;
    static BASE_BLACK_HOLE_SCALE = 0.5;

    constructor(centerBlackHole: CenterBlackHole, blackHole: Sprite) {
        super();

        this.centerBlackHole = centerBlackHole;
        this.blackHole = blackHole;
    }

    update(): void {
        super.update();

        let p = 0;
        let battleTimer = this.world.select.type(BattleTimer, false);
        if (battleTimer) {
            p = M.mapClamp(battleTimer.battleTimeForArenaShrink, 30, 45, 0, 1);
        }

        this.centerBlackHole.gravityFactor = M.lerp(ArenaShrinkSpace.BASE_GRAVITY_FACTOR, 2, p);
        this.blackHole.scale = M.lerp(ArenaShrinkSpace.BASE_BLACK_HOLE_SCALE, 1, p);
    }
}