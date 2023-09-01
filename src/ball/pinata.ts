namespace Balls {
    export class Pinata extends Ball {
        getName() { return 'Pi<ntick>ata'; }
        getDesc() { return `Happy Birthday!`; }
        getShopDmg() { return 1; }
        getShopHp() { return 1; }

        get numberOfThings() { return 2*this.level; }
        get power() { return 1; }

        constructor(config: Ball.Config) {
            super('balls/pinata', 8, config);

            this.addAbility('onBuy', Pinata.onBuy);
            this.addAbility('onDeath', Pinata.onDeath);
        }

        static onBuy(source: Pinata, world: World): void {
            let validBalls = getAlliesNotSelf(world, source).filter(ball => !ball.isInShop);
            if (validBalls.length === 0) return;

            let randomBall = Ball.Random.element(validBalls);
            let buff = Ball.Random.boolean() ? { dmg: 1, hp: 0 } : { dmg: 0, hp: 1 }
            world.addWorldObject(new RandomBuff(source.x, source.y, source, randomBall, buff, _ => Ball.Random.element(validBalls)));
        }

        static onDeath(source: Pinata, world: World, killedBy: Ball): void {
            world.addWorldObject(new Explosion(source.x, source.y, source.physicalRadius, { ally: 0, enemy: 0 }));
            world.addWorldObject(newBdayPuff(source.x, source.y, Battle.Layers.fx, 'medium'));
            world.playSound('popper');
            world.playSound('confetti');

            let createThingElements = [
                () => Pinata.createMedkit(source, world),
                () => Pinata.createMedkitDmg(source, world),
                () => Pinata.createLandmine(source, world),
            ];

            for (let i = 0; i < source.numberOfThings; i++) {
                Ball.Random.element(createThingElements)();
            }
        }

        private static createMedkit(source: Pinata, world: World) {
            world.addWorldObject(new Medpack(source.x, source.y, Ball.Random.inDisc(60, 120), source, source.power));
        }

        private static createMedkitDmg(source: Pinata, world: World) {
            world.addWorldObject(new MedkitDmg(source.x, source.y, Ball.Random.inDisc(60, 120), source, source.power));
        }

        private static createLandmine(source: Pinata, world: World) {
            world.addWorldObject(new LandMine(source.x, source.y, Ball.Random.inDisc(60, 120), source, source.power));
        }
    }
}