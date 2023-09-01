namespace Equipments {
    export class SkullCharm extends OrbitEquipment {
        getName() { return 'Skull Charm'; }
        getDesc() { return `Summons a ${buffText(this.getParentLevel(), 2)} skeleton on death`; }

        constructor() {
            super('equipments/skullcharm', 'items/skullcharm');

            this.addAbility('onDeath', SkullCharm.onDeath);
        }
    
        private static onDeath(equipment: SkullCharm, source: Ball, world: World, killedBy: Ball): void {
            world.addWorldObject(squadBallToWorldBall({
                x: source.x,
                y: source.y,
                properties: {
                    type: 16,
                    level: 1,
                    damage: source.level,
                    health: 2,
                    equipment: -1,
                    metadata: {},
                }
            }, undefined, -1, source.team));
        }

        private getParentLevel() {
            return this.getParent()?.level ?? 1;
        }
    }
}
