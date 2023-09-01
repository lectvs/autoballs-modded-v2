/// <reference path="./equipment.ts" />

namespace Equipments {
    export class OrbitingPotato extends Equipment {
        getName() { return 'Orbiting Potato'; }
        getDesc() { return `Orbiting potatoes deal [r]5<sword>/s[/r] to enemies and can block projectiles`; }

        get count() { return _.size(this.potatoes); }

        private potatoes: Sprite[];

        private dmg = 5;
        private range = 7;

        constructor(count: number) {
            super({
                breakIcon: 'items/orbitingpotato',
                copyFromParent: ['layer'],
            });

            if (count <= 0) {
                console.error('Invalid potato count, defaulting to 1:', count);
                count = 1;
            }

            let dangle = 360 / count;
            this.potatoes = A.range(count).map(i => newPotato(16, i*dangle, this.dmg));
            this.addChildren(this.potatoes);
        }

        update(): void {
            super.update();

            if (this.parent instanceof Ball) {
                this.potatoes.forEach(potato => potato.data.parent = this.parent);
            }
        }
    
        postUpdate(): void {
            super.postUpdate();
            if (this.parent && this.parent instanceof Ball) {
                for (let potato of this.potatoes) {
                    potato.data.radius = this.parent.visibleRadius + this.range;
                    World.Actions.orderWorldObjectAfter(potato, this.parent);
                }
            }
        }
    }

    function newPotato(radius: number, angle: number, dmg: number) {
        let result = new Sprite({
            x: radius * M.cos(angle), y: radius * M.sin(angle),
            texture: 'equipments/orbitingpotato',
            copyFromParent: ['layer'],
            data: { radius, angle },
            bounds: new CircleBounds(0, 0, 8),
            update: function() {
                let parent: Ball = this.data.parent;

                if (!parent.isNullified()) {
                    this.data.angle += 540 * this.delta;
                }

                this.localx = this.data.radius * M.cos(this.data.angle);
                this.localy = this.data.radius * M.sin(this.data.angle);
                this.angle = this.data.angle - 20;

                if (parent.isNullified()) return;

                if (parent.state === Ball.States.BATTLE) {
                    let enemyBalls = this.world.select.typeAll(Ball).filter(ball => ball.team !== parent.team && ball.alive && !ball.dead);
                    for (let ball of enemyBalls) {
                        if (this.isOverlapping(ball.bounds)) {
                            ball.leechFor(dmg * this.delta, parent);
                        }
                    }
                }

                if (parent.state === Ball.States.BATTLE || parent.state === Ball.States.PRE_BATTLE) {
                    let enemyProjectiles = this.world.select.typeAll(Projectile).filter(proj => proj.source && proj.source.team !== parent.team);
                    for (let proj of enemyProjectiles) {
                        if (!proj.bounds || proj.bounds instanceof NullBounds) {
                            console.error('Error: projectile has no bounds:', proj);
                        }
                        if (this.bounds.isOverlapping(proj.bounds)) {
                            this.world.playSound('sellball').volume = 0.5;
                            this.world.addWorldObject(newPuff(proj.x, proj.y, Battle.Layers.fx, 'small'));
                            proj.kill();
                        }
                    }
                }
            }
        });

        return result;
    }
}
