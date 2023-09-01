class CenterBlackHole extends WorldObject {
    gravityFactor: number;

    constructor(x: number, y: number, gravityFactor: number) {
        super({ x, y });

        this.gravityFactor = gravityFactor;
    }
}