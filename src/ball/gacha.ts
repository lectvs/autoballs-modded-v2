namespace Balls {
    export class Gacha extends Ball {
        getName() { return 'Gacha Ball'; }
        getDesc() {
            if (this.plusStars === 0) return `On death, summon a random ${buffText(this.newBallPower, this.newBallPower)} ball from the shop. What's it gonna be??`;
            return `On death, summon a random ${buffText(this.newBallPower, this.newBallPower)} ball from the shop, +[gold]${this.plusStars}<star>[/gold]`;
        }
        getShopDmg() { return 2; }
        getShopHp() { return 3; }

        get newBallPower() { return 1+this.level; }
        get plusStars() { return this.level-1; }

        constructor(config: Ball.Config) {
            super('balls/gacha', 8, config);

            this.addAbility('onDeath', Gacha.onDeath);
        }

        private static onDeath(source: Gacha, world: World, killedBy: Ball) {
            let validBallTypes = getPurchasableBallTypesForRound(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly)
                .filter(type => !_.contains(Gacha.USELESS_BALL_TYPES, type));
            let ballType = Ball.Random.element(validBallTypes);
            let level = getBallTypeLevelForRound(ballType, GAME_DATA.round) + source.plusStars;
            
            world.addWorldObject(squadBallToWorldBall({
                x: source.x,
                y: source.y,
                properties: {
                    type: ballType,
                    level: level,
                    damage: source.newBallPower,
                    health: source.newBallPower,
                    equipment: -1,
                    metadata: {},
                }
            }, undefined, -1, source.team));

            world.playSound('buyball');
        }

        static USELESS_BALL_TYPES = [
            6,  // Powerball
            9,  // Coin
            10, // Crystal Ball
            24, // Pickleball
            25, // Crown
            32, // Poke Ball
            35, // Vagrant
            37, // Red Crystal Ball
            38, // Green Crystal Ball
            39, // Ball of Ice
            47, // Recycler
            48, // Wobby

            101, // Bank
            114, // Wizard
            116, // Mimic
            126, // Seed
            127, // Dove
            133, // Battery
            134, // Old Crystal Ball
            135, // Neo Crystal Ball
            136, // Crown
            137, // Dolly
            139, // Gold Crystal Ball
            140, // Alchemist
            142, // Greater Mimic
        ];
    }
}