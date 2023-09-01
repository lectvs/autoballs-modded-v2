namespace Balls {
    export class Splitter extends Ball {
        getName() { return 'Splitter'; }
        getDesc() { return `On death, summon [lb]${this.ballsToSpawn}[/lb] ${buffText(1, 2)} split balls`; }
        getShopDmg() { return 2; }
        getShopHp() { return 4; }

        get ballsToSpawn() { return this.level+1; }

        constructor(config: Ball.Config) {
            super('balls/split', 8, config);

            this.addAbility('onDeath', Splitter.onDeath);
        }

        private static onDeath(source: Splitter, world: World, killedBy: Ball) {
            let d = vec2(1, 0);

            for (let i = 0; i < source.ballsToSpawn; i++) {
                let ball = world.addWorldObject(squadBallToWorldBall({
                    x: source.x + 4*d.x,
                    y: source.y + 4*d.y,
                    properties: {
                        type: 3,
                        level: 1,
                        damage: 1,
                        health: 2,
                        equipment: -1,
                        metadata: {},
                    }
                }, undefined, -1, source.team));
    
                if (source.state === Ball.States.BATTLE) {
                    ball.v.set(50*d.x, 50*d.y);
                }
                d.rotate(360 / source.ballsToSpawn);
            }
        }
    }
}