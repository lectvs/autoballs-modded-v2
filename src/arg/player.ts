class Player extends Sprite {
    get speed() { return this.grabbing ? 36 : 48; }

    direction: Vector2 = Vector2.DOWN;

    private grabBounds: RectBounds;
    grabbing: { box: ArgBox, dx: number, dy: number };

    private walkTimer: Timer;
    walkVolume: number = 1;

    constructor(x: number, y: number, textureRoot: string) {
        super({
            x, y,
            animations: [
                Animations.fromTextureList({ name: 'idle_front', textureRoot: textureRoot, textures: [0, 1], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'run_front',  textureRoot: textureRoot, textures: [2, 3, 4, 5], frameRate: 6, count: Infinity }),
                Animations.fromTextureList({ name: 'idle_back',  textureRoot: textureRoot, textures: [6, 7], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'run_back',   textureRoot: textureRoot, textures: [8, 9, 10, 11], frameRate: 6, count: Infinity }),
                Animations.fromTextureList({ name: 'idle_side',  textureRoot: textureRoot, textures: [12, 13], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'run_side',   textureRoot: textureRoot, textures: [14, 15, 16, 17], frameRate: 6, count: Infinity }),

                Animations.fromTextureList({ name: 'idle_front_grab', textureRoot: textureRoot, textures: [18], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'run_front_grab',  textureRoot: textureRoot, textures: [20, 21, 22, 23], frameRate: 4, count: Infinity }),
                Animations.fromTextureList({ name: 'idle_back_grab',  textureRoot: textureRoot, textures: [24], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'run_back_grab',   textureRoot: textureRoot, textures: [26, 27, 28, 29], frameRate: 4, count: Infinity }),
                Animations.fromTextureList({ name: 'idle_side_grab',  textureRoot: textureRoot, textures: [30], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'run_side_grab',   textureRoot: textureRoot, textures: [32, 33, 34, 35], frameRate: 4, count: Infinity }),
            ],
            defaultAnimation: 'idle_front',
            effects: { outline: { color: 0x000000 }},
            layer: ARG.Layers.main,
            physicsGroup: ARG.PhysicsGroups.player,
            bounds: new RectBounds(-4, -2, 8, 3),
        });

        this.grabBounds = new RectBounds(-4, -2, 8, 3, this);

        this.walkTimer = new Timer(1/3, () => {
            this.world.playSound('arg/walk').volume = this.walkVolume;
        }, Infinity);
    }

    update(): void {
        let haxis = M.axis(this.controller.left, this.controller.right);
        let vaxis = M.axis(this.controller.up, this.controller.down);

        this.updateMovement(haxis, vaxis);
        this.updateDirection(haxis, vaxis);

        let boxes = this.world.select.typeAll(ArgBox);
        let closestBox = this.getClosestBox();
        for (let box of boxes) {
            box.tint = (!this.grabbing && box === closestBox) ? 0xBBBBBB : 0xFFFFFF;
        }
        this.updateGrab(closestBox);

        super.update();

        this.updateAnimation(haxis, vaxis);
        this.updateWalkSound(haxis, vaxis);
    }

    updateMovement(haxis: number, vaxis: number) {
        this.v.x = haxis * this.speed;
        this.v.y = vaxis * this.speed;
    }

    updateDirection(haxis: number, vaxis: number) {
        if (this.grabbing) {
            let angle = M.atan2(this.grabbing.box.y - this.y, this.grabbing.box.x - this.x);
            if (-45 < angle && angle <= 45) {
                this.direction.set(1, 0);
            } else if (45 < angle && angle <= 135) {
                this.direction.set(0, 1);
            } else if (-135 < angle && angle <= -45) {
                this.direction.set(0, -1);
            } else {
                this.direction.set(-1, 0);
            }
            return;
        }

        if (haxis === 0 && vaxis !== 0) {
            this.direction.set(0, vaxis);
        } else if (haxis !== 0) {
            this.direction.set(haxis, 0);
        }
    }

    updateGrab(closestBox: ArgBox) {
        if (this.grabbing) {
            if (!this.controller.keys.grab || G.distance(this.grabbing.box, this.getPosition().add(this.grabbing.dx, this.grabbing.dy)) > 6) {
                this.grabbing = undefined;
            }
        } else {
            if (this.controller.keys.grab) {
                if (closestBox) {
                    this.grabbing = { box: closestBox, dx: closestBox.x - this.x, dy: closestBox.y - this.y };
                }
            }
        }

        if (this.grabbing) {
            if (this.direction.x < 0 && -10 < this.grabbing.dx) this.grabbing.dx = -9;
            if (this.direction.x > 0 && this.grabbing.dx < 10) this.grabbing.dx = 9;
            if (this.direction.y < 0 && -3 < this.grabbing.dy) this.grabbing.dy = -2;
            if (this.direction.y > 0 && this.grabbing.dy < 12) this.grabbing.dy = 11;

            this.grabbing.box.x = this.x + this.grabbing.dx;
            this.grabbing.box.y = this.y + this.grabbing.dy;
        }
    }

    updateAnimation(haxis: number, vaxis: number) {
        let animationSide = 'front';
        if (this.direction.x !== 0) {
            animationSide = 'side';
            this.flipX = this.direction.x < 0;
        } else if (this.direction.y < 0) {
            animationSide = 'back';
            this.flipX = false;
        } else if (this.direction.y > 0) {
            animationSide = 'front';
            this.flipX = false;
        }

        let grabSuffix = this.grabbing ? '_grab' : '';
        if (haxis !== 0 || vaxis !== 0) {
            this.playAnimation(`run_${animationSide}${grabSuffix}`);
        } else {
            this.playAnimation(`idle_${animationSide}${grabSuffix}`);
        }
    }

    updateWalkSound(haxis: number, vaxis: number) {
        if (haxis !== 0 || vaxis !== 0) {
            if (this.grabbing) this.walkTimer.update(2/3*this.delta);
            else this.walkTimer.update(this.delta);
        } else {
            this.walkTimer.time = 0.3;
        }
    }

    private getClosestBox() {
        this.grabBounds.x = -4 + this.direction.x;
        this.grabBounds.y = -2 + this.direction.y;
        let boxes = <ArgBox[]>this.world.select.overlap(this.grabBounds, [ARG.PhysicsGroups.boxes]);
        return M.argmin(boxes, box => G.distance(box, this));
    }
}