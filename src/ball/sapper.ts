namespace Balls {
    export class Sapper extends Ball {
        getName() { return 'Sapper'; }
        getDesc() {
            if (this.saps === 1) return `On enter battle, break the equipment of a random enemy`;
            return `On enter battle, break the equipment of [lb]${this.saps}[/lb] random enemies`;
        }
        getShopDmg() { return 4; }
        getShopHp() { return 5; }

        get saps() { return this.level; }

        constructor(config: Ball.Config) {
            super('balls/sapper', 8, config);

            this.addAbility('onPreBattle', Sapper.onPreBattle);
            this.addAbility('onEnterBattle', Sapper.onEnterBattle);
        }

        private static onPreBattle(source: Sapper, world: World) {
            Sapper.sap(source, world);
        }

        private static onEnterBattle(source: Sapper, world: World) {
            if (source.hasActivatedAbility('onPreBattle')) return;
            Sapper.sap(source, world);
        }

        private static sap(source: Sapper, world: World) {
            let currentSaps = world.select.typeAll(HomingSap).filter(sap => sap.team === source.team);

            let validEnemies = getEnemies(world, source).filter(ball => ball.equipment && !currentSaps.some(sap => sap.target === ball));
            if (validEnemies.length === 0) return;

            if (validEnemies.length > source.saps) {
                Ball.Random.shuffle(validEnemies);
                validEnemies = validEnemies.slice(0, source.saps);
            }

            let saps: HomingSap[] = [];
            for (let enemy of validEnemies) {
                let sap = world.addWorldObject(new HomingSap(source.x, source.y, source.team, enemy));
                saps.push(sap);
            }

            source.setPreBattleAbilityActiveCheck(() => saps.some(sap => sap.world));
        }
    }
}