namespace Equipments {
    export class HuntersMark extends OrbitEquipment {
        getName() { return "Hunter's Mark"; }
        getDesc() { return `On enter battle, place a mark on a random enemy. All ally spikes will home in on that enemy`; }

        constructor() {
            super('equipments/huntersmark', 'items/huntersmark');

            this.addAbility('onPreBattle', HuntersMark.onPreBattle);
            this.addAbility('onEnterBattle', HuntersMark.onEnterBattle);
        }

        private static onPreBattle(equipment: HuntersMark, source: Ball, world: World) {
            HuntersMark.sendMark(equipment, source, world);
            source.unequip();
        }

        private static onEnterBattle(equipment: HuntersMark, source: Ball, world: World) {
            HuntersMark.sendMark(equipment, source, world);
            source.unequip();
        }

        private static sendMark(equipment: HuntersMark, source: Ball, world: World) {
            let validBalls = getEnemies(world, source)
            let getRandomEnemy = (enemies: Ball[]) => {
                let marks = world.select.typeAll(HomingMark);
                return Ball.Random.element(enemies.filter(enemy => !enemy.isMarked() && !marks.some(mark => mark.target === enemy)));
            }

            let enemy = getRandomEnemy(validBalls);
            if (!enemy) return;

            let hm = world.addWorldObject(new HomingMark(equipment.orbitingIcon.x, equipment.orbitingIcon.y, source, enemy, enemies => getRandomEnemy(enemies)));

            source.flash(0xFFFFFF, 1);

            equipment.setPreBattleAbilityActiveCheck(() => hm.world);
        }
    }
}
