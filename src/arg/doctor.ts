class Doctor extends Sprite {
    get speed() { return this.running ? 64 : 16; }
    running: boolean = false;

    direction: Vector2 = Vector2.DOWN;

    private walkTimer: Timer;

    constructor(x: number, y: number) {
        super({
            x, y,
            animations: [
                Animations.fromTextureList({ name: 'idle_back', textureRoot: 'arg/doctor', textures: [1], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'run_back', textureRoot: 'arg/doctor', textures: [0, 1, 2, 3], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'idle_side', textureRoot: 'arg/doctor', textures: [5], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'run_side', textureRoot: 'arg/doctor', textures: [4, 5], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'idle_front', textureRoot: 'arg/doctor', textures: [9], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'run_front', textureRoot: 'arg/doctor', textures: [8, 9, 10, 11], frameRate: 2, count: Infinity }),
            ],
            //defaultAnimation: 'idle_front',
            effects: { outline: { color: 0x000000 }},
            layer: ARG.Layers.main,
            physicsGroup: ARG.PhysicsGroups.player,
            bounds: new RectBounds(-3, -2, 6, 3),
        });

        this.walkTimer = new Timer(1, () => this.world.playSound('arg/walk'), Infinity);
    }

    update(): void {
        let haxis = M.axis(this.controller.left, this.controller.right);
        let vaxis = M.axis(this.controller.up, this.controller.down);

        this.updateMovement(haxis, vaxis);
        this.updateDirection(haxis, vaxis);

        super.update();

        this.updateAnimation(haxis, vaxis);
        this.updateWalkSound(haxis, vaxis);
    }

    updateMovement(haxis: number, vaxis: number) {
        this.v.x = haxis * this.speed;
        this.v.y = vaxis * this.speed;
    }

    updateDirection(haxis: number, vaxis: number) {
        if (haxis === 0 && vaxis !== 0) {
            this.direction.set(0, vaxis);
        } else if (haxis !== 0) {
            this.direction.set(haxis, 0);
        }
    }

    updateAnimation(haxis: number, vaxis: number) {
        let animationSide = 'front';
        if (this.direction.x !== 0) {
            animationSide = 'side';
            this.flipX = this.direction.x > 0;
        } else if (this.direction.y < 0) {
            animationSide = 'back';
            this.flipX = false;
        } else if (this.direction.y > 0) {
            animationSide = 'front';
            this.flipX = false;
        }

        if (haxis !== 0 || vaxis !== 0) {
            this.playAnimation(`run_${animationSide}`);
        } else {
            this.playAnimation(`idle_${animationSide}`);
        }

        this.animationManager.speed = this.running ? 4 : 1;
    }

    updateWalkSound(haxis: number, vaxis: number) {
        this.walkTimer.duration = this.running ? 0.25 : 1;
        if (haxis !== 0 || vaxis !== 0) {
            this.walkTimer.update(this.delta);
        } else {
            this.walkTimer.time = 0.9 * this.walkTimer.duration;
        }
    }
}