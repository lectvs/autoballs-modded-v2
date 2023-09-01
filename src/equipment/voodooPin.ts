/// <reference path="./equipment.ts" />

namespace Equipments {
    export class VoodooPin extends Equipment {
        getName() { return 'Voodoo Pin'; }
        getDesc() { return 'Sacrifices\n[g]1 max <heart>/s[/g] to damage the enemy with the highest [r]<sword>[/r] for [r]1.5<sword>/s[/r]'; }

        private enemyPin: Sprite;
        private stringTint: number;
        private target: Ball;
        private script: Script;

        constructor() {
            super({
                texture: 'equipments/voodoopin',
                copyFromParent: ['layer'],
                breakIcon: 'items/voodoopin',
            });

            this.stringTint = 0xFFFFFF;

            this.addAbility('update', VoodooPin.update);
        }
    
        update() {
            super.update();

            if (this.target && (!this.target.world || !this.target.alive || this.target.dead)) {
                this.script?.stop();
                this.getParent()?.unequip();
            }
        }

        postUpdate() {
            super.postUpdate();

            let parent = this.getParent();
            if (!parent) return;
            this.localx = parent.visibleRadius/Math.SQRT2 + 1;
            this.localy = -parent.visibleRadius/Math.SQRT2 - 1;

            World.Actions.orderWorldObjectAfter(this, parent.stars);
        }

        render(texture: Texture, x: number, y: number) {
            super.render(texture, x, y);

            if (this.enemyPin) {
                let ex = x + this.enemyPin.x - this.x;
                let ey = y + this.enemyPin.y - this.y;
                Draw.brush.color = this.stringTint;
                Draw.brush.alpha = 0.5;
                Draw.brush.thickness = 1;
                Draw.line(texture, x+1, y-1, ex+1, ey-1);
            }
        }

        onRemove() {
            if (this.enemyPin) this.enemyPin.kill();
            this.enemyPin = undefined;
            super.onRemove();
        }

        private static update(equipment: VoodooPin, source: Ball, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            if (equipment.script) return;

            equipment.script = equipment.runScript(function*() {
                yield; // Wait one frame to catch Vampires
    
                let target: Ball;
                while (!target) {
                    let enemyBalls = getEnemies(world, source);
                    target = M.argmax(enemyBalls, ball => ball.dmg);
                    yield;
                }

                equipment.target = target;
                equipment.enemyPin = world.addWorldObject(new Sprite({
                    x: equipment.x, y: equipment.y,
                    texture: 'equipments/voodoopin_shoot',
                    layer: Battle.Layers.fx,
                }));

                world.playSound('spike');

                yield S.doOverTime(0.1, t => {
                    equipment.enemyPin.x = M.lerp(equipment.x, target.x, t);
                    equipment.enemyPin.y = M.lerp(equipment.y, target.y, t);
                    equipment.enemyPin.angle = target.getPosition().subtract(equipment).angle;
                });

                equipment.enemyPin?.kill();
                equipment.enemyPin = target.addChild(new Sprite({
                    x: 0, y: 0,
                    texture: 'equipments/voodoopin',
                    layer: Battle.Layers.fx,
                    update: function() {
                        if (this.parent && this.parent instanceof Ball) {
                            this.localx = source.visibleRadius/Math.SQRT2 + 1;
                            this.localy = -source.visibleRadius/Math.SQRT2 - 1;
                        }
                    }
                }));

                while (true) {
                    let damageDealt = source.takeDamage(0.75, source, 'other', true);
                    source.maxhp -= damageDealt;

                    target.takeDamage(1, source, 'other', true);
                    
                    world.playSound('balldie');
                    
                    source.flash(0xB200B2, 1, 0.5);
                    target.flash(0xB200B2, 1, 0.5);

                    yield S.doOverTime(0.5, t => {
                        equipment.stringTint = Color.lerpColorByLch(0xB200B2, 0xFFFFFF, t);
                    });
                }
            });
        }
    }
}
