namespace Equipments {
    export class CursedDoll extends OrbitEquipment {
        getName() { return 'Cursed Doll'; }
        getDesc() { return `On death, transforms its killer into a skeleton`; }

        constructor() {
            super('equipments/curseddoll', 'items/curseddoll');

            this.addAbility('onDeath', CursedDoll.onDeath);
        }
    
        private static onDeath(equipment: CursedDoll, source: Ball, world: World, killedBy: Ball): void {
            if (killedBy.dead || !killedBy.alive) return;
            
            world.addWorldObject(squadBallToWorldBall({
                x: killedBy.x,
                y: killedBy.y,
                properties: {
                    type: 16,
                    level: killedBy.level,
                    damage: killedBy.dmg,
                    health: killedBy.hp,
                    equipment: killedBy.equipment ? killedBy.equipment.equipmentType : -1,
                    metadata: {},
                }
            }, undefined, -1, killedBy.team, false, false));

            killedBy.kill();
        }
    }
}
