class Trampoline extends Sprite {
    constructor(x: number, y: number, flipped: boolean) {
        super({
            x, y,
            animations: [
                Animations.fromSingleTexture({ name: 'idle', texture: 'trampoline/0' }),
                Animations.fromTextureList({ name: 'boing', textures: ['trampoline/1'], frameRate: 8, nextFrameRef: 'idle/0' }),
            ],
            flipX: flipped,
            layer: Battle.Layers.walls,
            physicsGroup: Battle.PhysicsGroups.walls,
            immovable: true,
            bounds: new SlopeBounds(-401, -158, 802, 401, flipped ? 'upleft' : 'upright'),
        });
    }

    onCollide(collision: Physics.Collision): void {
        let ball = collision.other.obj;
        if (ball instanceof Ball && ball.state === Ball.States.BATTLE && !ball.v.isZero()) {
            ball.changeVelocityForBounce(Ball.minTrampolineBounceSpeed);
            this.playAnimation('boing', true);
            this.world.playSound('trampoline', { limit: 4 });
        }
        super.onCollide(collision);
    }
}