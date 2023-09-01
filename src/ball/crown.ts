namespace Balls {
    export class Crown extends Ball {
        getName() { return 'The Crown'; }
        getDesc() {
            if (this.plusStars === 0) return `On death, is [gold]permanently[/gold] replaced with the enemy that killed it`;
            return `On death, is [gold]permanently[/gold] replaced with the enemy that killed it, +${this.plusStars}[gold]<star>[/gold]`;
        }
        getShopDmg() { return 6; }
        getShopHp() { return 6; }

        get plusStars() { return this.level-1; }

        private aura: Sprite;
        get auraRadius() { return this.physicalRadius + 6; }

        constructor(config: Ball.Config) {
            super('balls/crown', 8, config);

            this.aura = this.addChild(new Sprite({
                texture: 'aura',
                tint: 0xFFDB00,
                blendMode: Texture.BlendModes.ADD,
                scale: this.auraRadius / 64,
                copyFromParent: ['layer'],
            }));

            this.addAbility('onDeath', Crown.onDeath, { canActivateTwice: false });
        }

        postUpdate() {
            super.postUpdate();

            this.aura.alpha = M.lerp(0.8, 1.0, (Math.sin(4*this.aura.life.time) + 1)/2);
            this.aura.scale = this.auraRadius / 64;
            World.Actions.orderWorldObjectBefore(this.aura, this);
        }

        private static onDeath(source: Crown, world: World, killedBy: Ball) {
            if (!killedBy) return;
            if (source.team !== 'friend' || !youArePlaying(world)) return;
            if (source.squadIndexReference < 0 || source.squadIndexReference >= GAME_DATA.squad.balls.length) return;
            if (killedBy.team === source.team) return;

            let metadata = O.deepClone(killedBy.properties.metadata);
            metadata.obtainedWithCrown = true;

            let squadBall = GAME_DATA.squad.balls[source.squadIndexReference];
            GAME_DATA.squad.balls[source.squadIndexReference] = {
                x: squadBall.x,
                y: squadBall.y,
                properties: {
                    type: killedBy.properties.type,
                    level: killedBy.level + source.plusStars,
                    damage: squadBall.properties.damage,
                    health: squadBall.properties.health,
                    equipment: killedBy.equipment ? killedBy.equipment.equipmentType : -1,
                    metadata: metadata,
                }
            };

            if (_.includes(Crown.USELESS_BALLS, killedBy.properties.type)) {
                USELESS_CROWN_REPLACEMENT = true;
            }
        }

        private static USELESS_BALLS = [
            0,   // Normal
            3,   // Splitter Spawn
            16,  // Skeleton
            20,  // Old Thief (Normal)
            31,  // Old Bio-Grenade (Normal)
            54,  // Cannonball
        ]
    }
}