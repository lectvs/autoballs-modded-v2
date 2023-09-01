class Warp extends PhysicsWorldObject {
    private toStage: () => World;
    private transition: Transition;
    private sound: string;

    constructor(x: number, y: number, width: number, height: number, toStage: () => World, transition: Transition, sound: string) {
        super({
            x, y,
            bounds: new RectBounds(0, 0, width, height),
        });

        this.toStage = toStage;
        this.transition = transition;
        this.sound = sound;
    }

    update() {
        super.update();

        let leader = this.world.select.type(Player);
        if (leader && leader.bounds && this.bounds.isOverlapping(leader.bounds)) {
            global.theater.playSound(this.sound, { humanized: false });
            global.theater.loadStage(this.toStage, this.transition);
        }
    }
}