class ArenaShrinkBday extends WorldObject {
    private blackHole: CenterBlackHole;
    private playedBoom = false;

    constructor() {
        super();
        this.blackHole = this.addChild(new CenterBlackHole(global.gameWidth/2, global.gameHeight/2, 0));
    }

    update(): void {
        super.update();

        let p = 0;
        let battleTimer = this.world.select.type(BattleTimer, false);
        if (battleTimer) {
            p = M.mapClamp(battleTimer.battleTimeForArenaShrink, 30, 31, 0, 1);
            this.blackHole.gravityFactor = p <= 0 ? 0 : M.mapClamp(battleTimer.battleTime, 30, 45, 1, 2);
        }

        if (!this.playedBoom && p > 0.5) {
            this.world.playSound('dioboom');
            this.playedBoom = true;
        }

        let bg = this.world.select.name<Sprite>(Arenas.BG_NAME, false);
        if (bg) {
            let amountMod = M.lerp(0.95, 1, Tween.Easing.OscillateSine(2)(this.life.time));

            let bulgeFilter = bg.effects.post.filters.find(f => f instanceof BulgeFilter) as BulgeFilter;
            if (bulgeFilter) {
                bulgeFilter.bulgeAmount = M.lerp(0, 0.4 * amountMod, Tween.Easing.InOutElastic(1)(p));
            }

            let shadeFilter = bg.effects.post.filters.find(f => f instanceof ArenaBdayShadeFilter) as ArenaBdayShadeFilter;
            if (shadeFilter) {
                shadeFilter.amount = M.lerp(0, 1 * amountMod, Tween.Easing.InOutElastic(1)(p));
            }
        }
    }
}