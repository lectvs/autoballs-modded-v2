namespace Equipments {
    export class ToxicFungus extends OrbitEquipment {
        getName() { return 'Toxic Fungus'; }
        getDesc() { return `On enter battle, plant a [dg]spore equipment[/dg] on the enemy with the highest [g]<heart>[/g]\n\nSpored balls take [r]1<sword>[/r] extra per hit`; }

        constructor() {
            super('equipments/toxicfungus', 'items/toxicfungus');

            this.addAbility('onPreBattle', ToxicFungus.onPreBattle);
            this.addAbility('onEnterBattle', ToxicFungus.onEnterBattle);
        }

        private static onPreBattle(equipment: ToxicFungus, source: Ball, world: World) {
            ToxicFungus.plantSpore(equipment, source, world);
            source.unequip();
        }

        private static onEnterBattle(equipment: ToxicFungus, source: Ball, world: World) {
            ToxicFungus.plantSpore(equipment, source, world);
            source.unequip();
        }

        private static plantSpore(equipment: ToxicFungus, source: Ball, world: World) {
            let validBalls = getEnemies(world, source);
            if (validBalls.length === 0) return;

            let strongestBall = M.argmax(validBalls, ball => ball.hp);
            let hs = world.addWorldObject(new HomingSpore(source.x, source.y, source, strongestBall));

            equipment.setPreBattleAbilityActiveCheck(() => hs.world);
        }
    }
}
