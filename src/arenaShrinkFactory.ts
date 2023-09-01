class ArenaShrinkFactory extends PhysicsWorldObject {
    private factoryPipeController: FactoryPipeController;
    private hourHand: Sprite;
    private minuteHand: Sprite;

    static INITIAL_VANGLE_HOUR = 30;
    static INITIAL_VANGLE_MINUTE = 30 * 12;

    constructor(factoryPipeController: FactoryPipeController, hourHand: Sprite, minuteHand: Sprite) {
        super();

        this.factoryPipeController = factoryPipeController;
        this.hourHand = hourHand;
        this.minuteHand = minuteHand;
    }

    update(): void {
        super.update();

        let p = 0;
        let battleTimer = this.world.select.type(BattleTimer, false);
        if (battleTimer) {
            p = M.mapClamp(battleTimer.battleTimeForArenaShrink, 30, 45, 0, 1);
        }

        this.factoryPipeController.arenaShrinkFactor = p;
        this.hourHand.vangle = ArenaShrinkFactory.INITIAL_VANGLE_HOUR * M.lerp(1, 20, p);
        this.minuteHand.vangle = ArenaShrinkFactory.INITIAL_VANGLE_MINUTE * M.lerp(1, 8, p);
    }
}