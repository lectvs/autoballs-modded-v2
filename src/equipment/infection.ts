namespace Equipments {
    export class Infection extends OrbitEquipment {
        getName() { return 'Infection'; }
        getDesc() { return `Summons a ${buffText(1, 2)} Skeleton on death`; }

        constructor() {
            super('equipments/infection', 'equipments/infection');

            this.addAbility('onDeath', Infection.onDeath);
        }
    
        private static onDeath(equipment: Infection, source: Ball, world: World, killedBy: Ball): void {
            world.addWorldObject(squadBallToWorldBall({
                x: source.x,
                y: source.y,
                properties: {
                    type: 16,
                    level: 1,
                    damage: 1,
                    health: 2,
                    equipment: -1,
                    metadata: {},
                }
            }, undefined, -1, source.team));
        }
    }
}
