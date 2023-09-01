class ArenaShrinkGravity extends PhysicsWorldObject {
    ceiling: Sprite;
    private maxY = 146;

    constructor(ceiling: Sprite) {
        super();
        this.ceiling = ceiling;

        this.updateCeilingPosition();
    }

    update(): void {
        super.update();

        this.updateCeilingPosition();
    }

    private updateCeilingPosition() {
        let p = 0;
        let battleTimer = this.world?.select?.type(BattleTimer, false);
        if (battleTimer) {
            p = M.mapClamp(battleTimer.battleTimeForArenaShrink, 30, 45, 0, 1);
        }

        this.ceiling.y = M.lerp(0, this.maxY, p);
    }
}