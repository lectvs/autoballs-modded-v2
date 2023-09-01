/// <reference path="./equipment.ts" />

namespace Equipments {
    export class TheseGuns extends Equipment {
        getName() { return 'These Guns!!'; }
        getDesc() { return `Punches nearby enemies for [r]2<sword>[/r] each. Breaks after two punches.`; }

        private gunLeft: Sprite;
        private gunRight: Sprite;

        private dmg = 1;
        private range = 28;
        private maxPunches = 2;

        private cooldown: Timer;
        private punches: number;

        constructor() {
            super({
                breakIcon: 'items/guns',
                copyFromParent: ['layer'],
            });

            this.gunLeft = this.addChild(newGun(-1, this.dmg));
            this.gunRight = this.addChild(newGun(1, this.dmg));

            this.cooldown = this.addTimer(0.2);
            this.punches = 0;

            this.stateMachine.addState('ready', {
                update: () => this.updatePunches(),
                script: S.waitUntil(() => this.punches >= this.maxPunches),
                transitions: [{ toState: 'taunt' }],
            });

            this.stateMachine.addState('taunt', {
                script: S.chain(
                    S.waitUntil(() => this.gunLeft.state !== 'punch' && this.gunRight.state !== 'punch'),
                    S.call(() => this.taunt()),
                    S.wait(2.6),
                    S.call(() => this.unequip()),
                ),
            });

            this.setState('ready');
        }

        updatePunches() {
            if (!this.world || !this.parent || !(this.parent instanceof Ball)) return;
            if (this.parent.state !== Ball.States.BATTLE) return;
            if (this.punches >= this.maxPunches) return;
            if (!this.cooldown.done) return;

            let enemies = this.world.select.typeAll(Ball).filter(ball => ball.team !== (<Ball>this.parent).team);

            let validBallsLeft = this.gunLeft.state === 'idle' ? enemies.filter(ball => ball.x < this.x && G.distance(ball, this.gunLeft) < this.range && ball !== this.gunRight.data.target) : [];
            let validBallsRight = this.gunRight.state === 'idle' ? enemies.filter(ball => ball.x > this.x && G.distance(ball, this.gunRight) < this.range && ball !== this.gunLeft.data.target) : [];

            let selectedGun: Sprite;
            let selectedValidBalls: Ball[];
            if (validBallsLeft.length === 0) {
                selectedGun = this.gunRight;
                selectedValidBalls = validBallsRight;
            } else if (validBallsRight.length === 0) {
                selectedGun = this.gunLeft;
                selectedValidBalls = validBallsLeft;
            } else if (Ball.Random.boolean()) {
                selectedGun = this.gunRight;
                selectedValidBalls = validBallsRight;
            } else {
                selectedGun = this.gunLeft;
                selectedValidBalls = validBallsLeft;
            }

            let selectedTarget = M.argmin(selectedValidBalls, ball => G.distance(ball, selectedGun));

            if (selectedTarget) {
                selectedGun.data.target = selectedTarget;
                selectedGun.data.parent = this.parent;
                selectedGun.setState('punch');
                this.punches++;
                this.cooldown.reset();
            }
        }

        taunt() {
            if (!this.world || !this.parent || !(this.parent instanceof Ball)) return;

            this.gunLeft.setState('taunt');
            this.gunRight.setState('taunt');
        }

        unequip() {
            if (!this.world || !this.parent || !(this.parent instanceof Ball)) return;

            this.world.addWorldObject(newPuff(this.parent.x, this.parent.y, Battle.Layers.fx, 'medium'));
            this.parent.unequip();
        }
    
        postUpdate(): void {
            super.postUpdate();
            if (this.parent && this.parent instanceof Ball) {
                this.gunLeft.localx = -this.parent.visibleRadius-1;
                this.gunRight.localx = this.parent.visibleRadius+1;
                World.Actions.orderWorldObjectBefore(this.gunLeft, this.parent);
                World.Actions.orderWorldObjectBefore(this.gunRight, this.parent);
            }
        }
    }

    function newGun(dir: -1 | 1, dmg: number) {
        let result = new Sprite({
            x: dir*9, y: 1,
            animations: [
                Animations.fromTextureList({ name: 'idle', textureRoot: 'equipments/gun', textures: [0, 1], frameRate: 2, count: Infinity }),
                Animations.fromTextureList({ name: 'punch', textureRoot: 'equipments/gun', textures: [3, 3, 3, 2, 0], frameRate: 12, count: 1 }),
                Animations.fromTextureList({ name: 'taunt', textureRoot: 'equipments/gun', textures: [4, 5, 4, 5, 4, 5, 3, 2, 0], frameRate: 4 }),
            ],
            defaultAnimation: 'idle',
            effects: { outline: {color: 0x000000 }},
            copyFromParent: ['layer'],
            flipX: dir < 0,
        });

        result.stateMachine.addState('idle', {
            callback: () => result.playAnimation('idle'),
        });

        result.stateMachine.addState('punch', {
            script: function*() {
                let target: Ball = result.data.target;
                let parent: Ball = result.data.parent;
                if (!target || !parent) return;

                let d = target.getPosition().subtract(result);

                target.takeDamage(dmg, parent, 'other');
                target.v.set(d.setMagnitude(250));

                result.angle = dir > 0 ? d.angle : 180 + d.angle;
                yield S.playAnimation(result, 'punch');
                result.angle = 0;
                result.data.target = undefined;
                yield S.wait(0.6);
            },
            transitions: [{ toState: 'idle' }]
        });

        result.stateMachine.addState('taunt', {
            script: function*() {
                yield S.playAnimation(result, 'taunt');
                result.playAnimation('idle');
                yield S.wait(0.5);
            },
        });

        result.setState('idle');

        return result;
    }
}
