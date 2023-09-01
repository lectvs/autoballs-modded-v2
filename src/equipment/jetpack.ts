/// <reference path="./equipment.ts" />

namespace Equipments {
    export class Jetpack extends Equipment {
        getName() { return 'Jetpack'; }
        getDesc() { return `Accelerates up to 2x speed. Breaks on collision with an enemy`; }

        private thrusterL: Thruster;
        private thrusterR: Thruster;

        private rocketSound: Sound;

        constructor() {
            super({
                copyFromParent: ['layer'],
                breakIcon: 'items/jetpack',
            });

            this.thrusterL = this.addChild(new Thruster(-1));
            this.thrusterR = this.addChild(new Thruster(1));

            this.addAbility('update', Jetpack.update);
            this.addAbility('onCollideWithEnemyPostDamage', Jetpack.onCollideWithEnemyPostDamage);
        }

        onAdd(): void {
            super.onAdd();
            this.updateThrusterPositions();

            this.rocketSound = new Sound('rocket', this.world.soundManager);
            this.rocketSound.loop = true;
        }
    
        postUpdate(): void {
            super.postUpdate();
            this.updateThrusterPositions();
        }

        private static update(equipment: Jetpack, source: Ball, world: World) {
            if (source.state === Ball.States.BATTLE && !source.isNullified() && source.getSlowEffectSpeedMultiplier() > 0.5) {
                equipment.thrusterL.turnOn();
                equipment.thrusterR.turnOn();

                source.addBoostMaxSpeed(equipment, 'other', 2, 2, 0.2);
                
                let acc = Vector2.fromPolar(200, source.angle - 90);
                source.v.add(acc.scale(equipment.delta));

                if (source.life.time > 0.25 && world.timeScale > 0.01) equipment.rocketSound.update(equipment.delta);
            } else {
                equipment.thrusterL.turnOff();
                equipment.thrusterR.turnOff();
            }
        }

        private static onCollideWithEnemyPostDamage(equipment: Jetpack, source: Ball, world: World, ball: Ball, damage: number): void {
            world.playSound('shake', { humanized: false });
            world.playSound('shake2', { humanized: false });
            source.breakEquipment();
            source.removeStatusEffectsOfType('boostmaxspeed');
            world.addWorldObject(new Explosion(source.x, source.y, source.physicalRadius + 4, { ally: 0, enemy: 0 }));
        }

        private updateThrusterPositions() {
            if (this.parent && this.parent instanceof Ball) {
                let angle = this.parent.state === Ball.States.BATTLE ? this.parent.angle : 0;
                this.thrusterL.angle = angle;
                this.thrusterR.angle = angle;

                let d = vec2(this.parent.visibleRadius, 0).rotate(angle);

                this.thrusterL.localx = -d.x;
                this.thrusterL.localy = -d.y;
                this.thrusterR.localx = d.x;
                this.thrusterR.localy = d.y;

                World.Actions.orderWorldObjectBefore(this.thrusterL, this.parent);
                World.Actions.orderWorldObjectBefore(this.thrusterR, this.parent);
            }
        }
    }

    class Thruster extends Sprite {
        constructor(dir: number) {
            super({
                animations: [
                    Animations.fromSingleTexture({ name: 'off', texture: 'equipments/thruster/0' }),
                    Animations.fromTextureList({ name: 'on', textureRoot: 'equipments/thruster', textures: [1, 2, 3], frameRate: 24, count: Infinity }),
                ],
                copyFromParent: ['layer'],
                flipX: dir < 0,
            });
        }

        turnOn() {
            this.playAnimation('on');
        }

        turnOff() {
            this.playAnimation('off');
        }
    }
}
