class ArenaShrinkIce extends PhysicsWorldObject {
    speedMultiplier = 1;
    iceFansMultiplier = 1;

    update(): void {
        super.update();

        let p = 0;
        let battleTimer = this.world.select.type(BattleTimer, false);
        if (battleTimer) {
            p = M.mapClamp(battleTimer.battleTimeForArenaShrink, 30, 45, 0, 1);
        }

        this.speedMultiplier = M.lerp(1, 4, p);
        this.iceFansMultiplier = M.lerp(1, 6, p);
    }
}