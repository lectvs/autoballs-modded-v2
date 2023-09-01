class AllBallsItemsMenu extends Menu {
    constructor(pack: Pack, itemPage: number) {
        super({
            backgroundColor: 0xFF00FF,
            volume: 1,
        });

        let width = 20, height = 20;
        let i = 0, j = 0;
        for (let type of getAllBallTypesForPack(pack, undefined)) {
            let ball = squadBallToWorldBall({
                x: width*(0.5 + i), y: height*(0.5 + j),
                properties: {
                    type,
                    health: 1,
                    damage: 1,
                    equipment: -1,
                    level: 1,
                    metadata: {},
                }
            }, undefined, -1, 'friend');

            ball.layer = World.DEFAULT_LAYER;
            ball.effects.addOutline.color = 0xFFFFFF;
            this.addWorldObject(ball);

            ball.isInShop = true;

            if (ball instanceof Balls.Grenade) {
                ball.x += 100;
                ball.y += 20;
            } else if (ball instanceof Balls.BallOfYarn) {
                ball.x += 150;
                ball.y += 20;
            } else if (ball instanceof Balls.BioGrenade) {
                ball.x += 150;
                ball.y += 20;
            } else if (ball instanceof Balls.DeathStar) {
                ball.x += 150;
                ball.y += 20;
            } else if (ball instanceof Balls.Turret) {
                ball.x += 120;
                ball.y += 20;
            } else if (ball instanceof Balls.Cannon) {
                ball.x += 120;
                ball.y += 20;
            } else if (ball instanceof Balls.GlitchedBallArg) {
                ball.removeFromWorld();
            } else if (ball instanceof Balls.Matryoshka) {
                ball.setSize(4);
                ball.x += 100;
                ball.y += 15;
            } else if (ball instanceof Balls.Angel) {
                ball.x += 170;
                ball.y += 30;
            } else if (ball instanceof Balls.Devil) {
                ball.x += 180;
                ball.y += 30;
            } else if (ball instanceof Balls.BlackHole) {
                ball.x += 190;
                ball.y += 30;
            } else if (ball instanceof Balls.Boomer) {
                ball.x += 200;
                ball.y += 30;
            } else if (ball instanceof Balls.Wizard) {
                ball.x += 170;
                ball.y += 45;
            } else if (ball instanceof Balls.Stinger) {
                ball.x += 180;
                ball.y += 45;
            } else if (ball instanceof Balls.Fireball) {
                ball.x += 190;
                ball.y += 40;
            } else if (ball instanceof Balls.ScrapCannon) {
                ball.x += 200;
                ball.y += 40;
            } else {
                World.Actions.removeWorldObjectsFromWorld(ball.children);
                World.Actions.addWorldObjectToWorld(ball.dmgbox, ball.world);
                World.Actions.addWorldObjectToWorld(ball.hpbox, ball.world);
                World.Actions.addWorldObjectToWorld(ball.stars, ball.world);
            }

            i++;
            if (i >= 8) {
                i = 0;
                j++;
            }
        }

        width = 24, height = 24;
        i = 0, j = 0;
        let skipItems = 0;
        for (let type in TYPE_TO_ITEM_TYPE_DEF) {
            if (skipItems < itemPage * 32) {
                skipItems++;
                continue;
            }

            let item = itemTypeToBallItem(parseInt(type), width*(0.5 + i), 144 + height*(0.5 + j));

            item.layer = World.DEFAULT_LAYER;
            item.effects.addOutline.color = 0xFFFFFF;
            this.addWorldObject(item);

            i++;
            if (i >= 8) {
                i = 0;
                j++;
            }
        }

        this.addWorldObject(new AbilitySystem());
    }
}