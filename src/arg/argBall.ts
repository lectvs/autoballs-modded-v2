class ArgBall extends Sprite {
    team: 'friend' | 'enemy';

    private acceleration = 250;
    private maxSpeed = 150;

    level: number;
    isInShop: boolean;

    damage: number = 1;
    health: number = 1;

    private stars: Sprite;

    constructor(x: number, y: number, team: 'friend' | 'enemy') {
        super({
            x, y,
            animations: [
                Animations.fromSingleTexture({ name: 'friend_idle', texture: 'arg/ball/3' }),
                Animations.fromSingleTexture({ name: 'enemy_idle', texture: 'arg/ball/7' }),
            ],
            defaultAnimation: `${team}_idle`,
            effects: { outline: { color: 0xFFFFFF } },
            physicsGroup: 'balls',
            bounds: new CircleBounds(0, 0, 6),
        });

        this.team = team;
        this.level = 1;
        this.isInShop = false;

        this.stars = this.addChild(new Sprite({
            y: -6,
            effects: { pre: { filters: [new Effects.Filters.Outline(0x000000, 1), new Effects.Filters.Outline(0xFFFFFF, 1)] }},
        }));

        this.stateMachine.addState('prep', {});
        this.stateMachine.addState('battle', {
            callback: () => {
                this.damage = this.level;
                this.health = this.level + 2;
                this.stars.setVisible(false);
            },
        });
    }

    update(): void {
        super.update();

        if (this.state === 'battle') {
            let acceleration = this.getFlow().scale(this.acceleration);
            if (this.team === 'enemy') acceleration.scale(-1);
            
            this.v.add(acceleration.scale(this.delta));
            this.v.clampMagnitude(this.maxSpeed);

            if (!this.isOnScreen()) {
                this.kill();
            }
        }
    }

    postUpdate(): void {
        super.postUpdate();
        World.Actions.orderWorldObjectAfter(this.stars, this);
        this.stars.setTexture(ArgBall.getStarsTexture(this.level-1));
    }

    levelUp() {
        this.level++;
        this.world.playSound('arg/sabwin');
    }

    takeDamage(amount: number) {
        this.health -= amount;

        this.world.playSound('arg/sabhurt');

        if (this.health <= 0) {
            this.world.addWorldObject(new Sprite({
                p: this,
                texture: 'arg/ball/3',
                effects: { outline: { color: 0xFFFFFF }, silhouette: { color: 0xFFFFFF } },
                life: 0.1,
            }));
            this.kill();
            return;
        }

        this.runScript(S.chain(
            S.doOverTime(1, t => {
                if (this.everyNFrames(2)) {
                    this.setVisible(!this.isVisible());
                }
            }),
            S.call(() => this.setVisible(true)),
        ));
    }

    isCollidingWith(other: PhysicsWorldObject): boolean {
        if (this.isInShop) return false;
        return super.isCollidingWith(other);
    }

    onCollide(collision: Physics.Collision): void {
        super.onCollide(collision);

        let other = collision.other.obj;
        if (other instanceof ArgBall && other.team !== this.team) {
            this.takeDamage(other.getDamageForCollision());
        }

        if (other.physicsGroup === 'walls') {
            this.world.playSound('arg/sabwall');
        }
    }

    getDamageForCollision() {
        return this.damage * this.getSpeed() / this.maxSpeed;
    }

    private getFlow() {
        return this.getPosition().subtract(157/2, 107/2).normalize().rotate(90);
    }

    static getStarsTexture(stars: number) {
        if (stars <= 0) return Texture.NONE;
        stars = M.clamp(stars, 1, 64);

        return lazy(`ArgBallStarsTexture(${stars})`, () => {
            let texture = new BasicTexture(5*stars-3, 2, 'ArgBall.getStarsTexture', false);
            Draw.brush.color = 0xFFDB00;
            Draw.brush.alpha = 1;
            for (let i = 0; i < stars; i++) {
                Draw.rectangleSolid(texture, 5*i, 0, 2, 2);
            }
            return new AnchoredTexture(texture, 0.5, 0.5);
        });
    }
}