namespace Balls {
    export class GlitchedBall extends Ball {
        getName() { return 'Gl[glitched]it[offsety 1]c[/offsety]he[/glitched]d B[glitched]a[offsety 1]l[/offsety]l[/glitched]'; }
        getDesc() { return `Does a random effect when it collides with an enemy. Effect power increases with level.`; }
        getShopDmg() { return 2; }
        getShopHp() { return 6; }

        get power() { return this.level + 1; }
        
        private baseTextures: string[];
        private baseTextureIndex: number = 0;

        constructor(config: Ball.Config) {
            super('balls/commando', 8, config);

            this.effects.post.filters.push(new Effects.Filters.Glitch(8, 4, 4));

            this.addTimer(0.2, () => this.changeAnimations(), Infinity);

            this.addAbility('onCollideWithEnemyPostDamage', GlitchedBall.onCollideWithEnemyPostDamage);
        }

        changeAnimations() {
            let baseTexture = this.getNextBaseTexture();
            this.changeBaseTextureAndRadius(baseTexture, 8);
        }

        private static onCollideWithEnemyPostDamage(source: GlitchedBall, world: World, collideWith: Ball, damage: number) {
            let possibleEffects: (() => boolean)[] = [
                () => GlitchedBall.buffSelfDamage(source, world),
                () => GlitchedBall.buffSelfHealth(source, world),
                () => GlitchedBall.buffAllyDamage(source, world),
                () => GlitchedBall.buffAllyHealth(source, world),
                () => GlitchedBall.homingSpikeToRandomEnemy(source, world),
                () => GlitchedBall.homingSpikeToHitEnemy(source, world, collideWith),
                () => GlitchedBall.randomSpikes(source, world),
                () => GlitchedBall.explosion(source, world),
                () => GlitchedBall.slowEnemy(source, world, collideWith),
                () => GlitchedBall.spawnSkeleton(source, world),
                () => GlitchedBall.giveEquipmentToAlly(source, world),
                () => GlitchedBall.sporeOnHitEnemy(source, world, collideWith),
                () => GlitchedBall.clawHitEnemy(source, world, collideWith),
                () => GlitchedBall.goEthereal(source, world),
                () => GlitchedBall.boostAllies(source, world),
                () => GlitchedBall.leaveAcidPool(source, world),
                () => GlitchedBall.stopEnemy(source, world, collideWith),
            ];

            let attemptsLeft = 10;
            while (attemptsLeft > 0) {
                attemptsLeft--;
                let effect = Ball.Random.element(possibleEffects);
                let success = effect();
                if (success) break;
            }

            if (Ball.Random.boolean(0.1)) world.runScript(glitchSmall(world));
        }

        private static buffSelfDamage(source: GlitchedBall, world: World) {
            source.buff(source.power, 0);
            return true;
        }

        private static buffSelfHealth(source: GlitchedBall, world: World) {
            source.buff(0, source.power);
            return true;
        }

        private static buffAllyDamage(source: GlitchedBall, world: World) {
            let validBalls = getAlliesNotSelf(world, source);
            if (validBalls.length === 0) return false;
            let randomBall = Ball.Random.element(validBalls);
            world.addWorldObject(new RandomBuff(source.x, source.y, source, randomBall, { dmg: source.power, hp: 0 }, allies => Ball.Random.element(allies)));
            return true;
        }

        private static buffAllyHealth(source: GlitchedBall, world: World) {
            let validBalls = getAlliesNotSelf(world, source);
            if (validBalls.length === 0) return false;
            let randomBall = Ball.Random.element(validBalls);
            world.addWorldObject(new RandomBuff(source.x, source.y, source, randomBall, { dmg: 0, hp: source.power }, allies => Ball.Random.element(allies)));
            return true;
        }

        private static homingSpikeToRandomEnemy(source: GlitchedBall, world: World) {
            let enemies = getEnemies(world, source);
            if (enemies.length === 0) return false;

            let spikeCounts = M.batch(source.power, 20);

            for (let count of spikeCounts) {
                let randomBall = Ball.Random.element(enemies);
                world.addWorldObject(new HomingSpike(source.x, source.y, source, randomBall, 1, count, enemyBalls => Ball.Random.element(enemyBalls)));
                source.didShootProjectile(count);
            }
            return true;
        }

        private static homingSpikeToHitEnemy(source: GlitchedBall, world: World, enemy: Ball) {
            if (enemy.hp <= 0) return false;

            let spikeCounts = M.batch(source.power, 20);

            for (let count of spikeCounts) {
                world.addWorldObject(new HomingSpike(source.x, source.y, source, enemy, 1, count, enemyBalls => Ball.Random.element(enemyBalls)));
                source.didShootProjectile(count);
            }
            return true;
        }

        private static randomSpikes(source: GlitchedBall, world: World) {
            let spikeCounts = M.batch(source.power*2, 20);

            for (let count of spikeCounts) {
                world.addWorldObject(new Spike(source.x, source.y, Ball.Random.onCircle(150), source, 1, count));
                source.didShootProjectile(count);
            }
            
            world.playSound('spike');
            return true;
        }

        private static explosion(source: GlitchedBall, world: World) {
            world.addWorldObject(new Explosion(source.x, source.y, source.physicalRadius-8 + 30, { ally: 0, enemy: source.power }, source));
            world.playSound('shake');
            return true;
        }

        private static slowEnemy(source: GlitchedBall, world: World, enemy: Ball) {
            if (enemy.hp <= 0) return false;
            enemy.addSlow('yarn', 0.5, source.power);
            return true;
        }

        private static spawnSkeleton(source: GlitchedBall, world: World) {
            world.addWorldObject(squadBallToWorldBall({
                x: source.x,
                y: source.y,
                properties: {
                    type: 16,
                    level: 1,
                    damage: source.power,
                    health: 1,
                    equipment: -1,
                    metadata: {},
                }
            }, undefined, -1, source.team));

            return true;
        }

        private static giveEquipmentToAlly(source: GlitchedBall, world: World) {
            let equipmentTier = M.clamp(source.power, 1, 3);
            let validBalls = getAlliesNotSelf(world, source).filter(ball => !ball.equipment);
            if (validBalls.length === 0) return false;
            
            let randomBall = Ball.Random.element(validBalls);
            world.addWorldObject(new RandomEquipment(source.x, source.y, source, randomBall, Ball.Random.element(getPurchasableEquipmentTypesForExactTier(equipmentTier)), true,
                                    allies => Ball.Random.element(allies.filter(ally => !ally.equipment)), Utils.NOOP));
            return true;
        }

        private static sporeOnHitEnemy(source: GlitchedBall, world: World, enemy: Ball) {
            if (enemy.hp <= 0) return false;
            if (source.power < 3) return false;
            world.addWorldObject(new HomingSpore(source.x, source.y, source, enemy));
            return true;
        }

        private static clawHitEnemy(source: GlitchedBall, world: World, enemy: Ball) {
            if (enemy.hp <= 0) return false;
            source.world.addWorldObject(new ClawSlash(enemy, source, source.power, true));
            return true;
        }

        private static goEthereal(source: GlitchedBall, world: World) {
            source.becomeEtherealForTime(1);
            return true;
        }

        private static boostAllies(source: GlitchedBall, world: World) {
            let validBalls = getAlliesNotSelf(world, source);
            if (validBalls.length === 0) return false;

            let alliesToBoost = Math.min(source.power, validBalls.length);

            if (validBalls.length > alliesToBoost) {
                Ball.Random.shuffle(validBalls);
                validBalls = validBalls.slice(0, alliesToBoost);
            }

            for (let ball of validBalls) {
                world.addWorldObject(new HomingBoost(source.x, source.y, source, ball, 1, Ball.Random.float(0.2, 0.6), allies => Ball.Random.element(allies)));
            }

            return true;
        }

        private static leaveAcidPool(source: GlitchedBall, world: World) {
            world.addWorldObject(new AcidPool(source.x, source.y, source, source.physicalRadius + 30, 0.5*source.power));
            return true;
        }

        private static stopEnemy(source: GlitchedBall, world: World, enemy: Ball) {
            if (enemy.hp <= 0) return false;
            enemy.stop(1);
            world.playSound('stopboom', { limit: 4 });
            return true;
        }

        private getNextBaseTexture() {
            if (_.isEmpty(this.baseTextures)) this.baseTextures = Object.keys(ballTextureCache).filter(key => key !== "undefined" && !_.contains(GlitchedBall.BAD_TEXTURES, key));
            if (_.isEmpty(this.baseTextures)) this.baseTextures = ['balls/ninja', 'balls/crystalball', 'balls/martyr'];
            let baseTexture = this.baseTextures[this.baseTextureIndex];
            this.baseTextureIndex = M.mod(this.baseTextureIndex+1, this.baseTextures.length);
            return baseTexture;
        }

        static BAD_TEXTURES = [
            "balls/splitspawn",
            "balls/normal",
            "balls/turret",
            "balls/thief",
            "balls/snowball",
            "balls/biogrenade",
            "balls/wobby2",
            "balls/wobby3",
            "balls/wobby4",
            "balls/matryoshkaxl",
            "balls/matryoshkal",
            "balls/matryoshkas",
            "balls/matryoshkaxs",
            "balls/mortar",
            "balls/mimic",
            "balls/scrapcannon",
        ];
    }
}