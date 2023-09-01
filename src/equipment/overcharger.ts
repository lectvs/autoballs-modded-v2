/// <reference path="./equipment.ts" />

namespace Equipments {
    export class Overcharger extends Equipment {
        getName() { return 'Overcharger'; }
        getDesc() { return `Zaps nearby enemies for [r]2<sword>/s[/r]\n\nDamage decays to [r]1<sword>/s[/r] over 1s`; }

        private zapDistance: number = 42;
        private damageRate: number = 2;

        private zapRing: ZapRing;
        private zaps: Dict<Zap>;

        private zapSoundTimer: Timer;

        constructor() {
            super({
                breakIcon: 'items/overcharger',
                copyFromParent: ['layer'],
            });

            this.zapRing = this.addChild(new ZapRing(0, {
                copyFromParent: ['layer'],
            }));

            this.zaps = {};

            this.zapSoundTimer = new Timer(0.1, () => this.world?.playSound('zap', { humanized: false, limit: 4 }), Infinity);

            this.addAbility('update', Overcharger.update);
        }

        onRemove(): void {
            super.onRemove();

            for (let uid in this.zaps) {
                this.zaps[uid].removeFromWorld();
            }
        }

        postUpdate(): void {
            super.postUpdate();
            if (this.parent && this.parent instanceof Ball) {
                World.Actions.orderWorldObjectAfter(this, this.parent);
                World.Actions.orderWorldObjectAfter(this.zapRing, this);
                this.zapRing.radius = this.parent.visibleRadius;
            }
        }

        private static update(equipment: Overcharger, source: Ball, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            let enemies = getEnemies(world, source);

            let newZaps: Dict<Zap> = {};
            for (let enemy of enemies) {
                if (enemy.world !== world || G.distance(source, enemy) > source.physicalRadius + equipment.zapDistance + enemy.physicalRadius) continue;
                if (enemy.uid in equipment.zaps) {
                    newZaps[enemy.uid] = equipment.zaps[enemy.uid];
                } else {
                    newZaps[enemy.uid] = world.addWorldObject(new Zap(equipment, enemy));
                }

                let damageMult = newZaps[enemy.uid].getDamageMult() ?? 1;

                enemy.leechFor(equipment.damageRate * damageMult * equipment.delta, source);
            }

            for (let uid in equipment.zaps) {
                if (!(uid in newZaps)) {
                    equipment.zaps[uid].kill();
                }
            }

            equipment.zaps = newZaps;

            if (!_.isEmpty(equipment.zaps)) equipment.zapSoundTimer.update(equipment.delta);
        }
    }
}
