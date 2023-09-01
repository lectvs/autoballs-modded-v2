namespace Balls {
    export class PokeBall extends Ball {
        getName() { return 'Pok<etick> Ball'; }
        getDesc() {
            let levelDiffDisplay = '';
            if (this.levelDiff < 0) levelDiffDisplay = ` with -[gold]${-this.levelDiff}<star>[/gold]`;
            if (this.levelDiff > 0) levelDiffDisplay = ` with +[gold]${this.levelDiff}<star>[/gold]`;
            return `At the start of battle, kill the closest ally, storing it inside. On death, resummon the stored ally${levelDiffDisplay}\n\nCannot be killed by an ally at the start of battle`;
        }
        getShopDmg() { return 3; }
        getShopHp() { return 3; }

        get levelDiff() { return this.level-1; }

        absorbedBalls: Ball[];
        private crosshair: Sprite;

        constructor(config: Ball.Config) {
            super('balls/pokeball', 8, config);
            this.canBeTargetedForDeath = false;

            this.absorbedBalls = [];
            this.crosshair = this.addChild(new Sprite({
                texture: 'crosshair',
                alpha: 0,
            }));

            this.preBattleAbilityInitialWaitTime = 0.5;

            this.addAbility('onPreBattle', PokeBall.onPreBattle);
            this.addAbility('onEnterBattle', PokeBall.onEnterBattle);
            this.addAbility('onDeath', PokeBall.onDeath, { canActivateTwice: false });
        }

        onAdd() {
            super.onAdd();
            if (this.world.getLayerByName(Battle.Layers.fx)) {
                this.crosshair.layer = Battle.Layers.fx;
            }
        }

        postUpdate() {
            super.postUpdate();

            let hasActivatedAbility = A.overlaps(this.activatedAbilities, ['onPreBattle', 'onEnterBattle']);
            let closestAlly = PokeBall.getClosestAlly(this, this.world);
            if (this.isInShop || this.isInYourSquadScene || !closestAlly || this.isNullified() || hasActivatedAbility || this.state === Ball.States.BATTLE) {
                this.crosshair.alpha = M.moveToClamp(this.crosshair.alpha, 0, 4, this.delta);
            } else {
                this.crosshair.teleport(closestAlly);
                this.crosshair.alpha = M.moveToClamp(this.crosshair.alpha, 0.8, 1, this.delta);
            }
        }

        setForInShop() {
            super.setForInShop();
            this.crosshair.alpha = 0;
        }

        private static onPreBattle(source: PokeBall, world: World) {
            PokeBall.eatAlly(source, world);
        }

        private static onEnterBattle(source: PokeBall, world: World) {
            let battleTimer = world.select.type(BattleTimer, false);
            let timeInBattle = battleTimer ? battleTimer.battleTime : 0;
            if (timeInBattle > 0.3 || source.hasActivatedAbility('onPreBattle')) return;
            PokeBall.eatAlly(source, world);
        }

        private static eatAlly(source: PokeBall, world: World) {
            let ballToAbsorb = PokeBall.getClosestAlly(source, world);
            if (!ballToAbsorb) return;

            source.absorbedBalls.push(ballToAbsorb);

            ballToAbsorb.targetedForDeath = true;
            ballToAbsorb.cancelAbilities();

            let absorbedHp = ballToAbsorb.hp;
            world.addWorldObject(new InstantKillSlash(ballToAbsorb, source));
            ballToAbsorb.hp = absorbedHp;

            world.addWorldObject(newPuff(ballToAbsorb.x, ballToAbsorb.y, Battle.Layers.fx, 'medium'));

            source.flash(0xFFFFFF, 1);
        }

        private static onDeath(source: PokeBall, world: World, killedBy: Ball): void {
            if (_.isEmpty(source.absorbedBalls)) return;

            for (let i = 0; i < source.absorbedBalls.length; i++) {
                let absorbedBall = source.absorbedBalls[i];
                
                let equipment = absorbedBall.equipment ? absorbedBall.equipment.equipmentType : -1;
                if (equipment === 20) {  // Disallow Best Friend
                    equipment = -1;
                }

                let d = source.absorbedBalls.length === 1 ? Vector2.ZERO : Vector2.RIGHT.rotate(360 * i/source.absorbedBalls.length).scale(8);

                let ball = world.addWorldObject(squadBallToWorldBall({
                    x: source.x + d.x,
                    y: source.y + d.y,
                    properties: {
                        type: absorbedBall.properties.type,
                        damage: absorbedBall.dmg,
                        health: absorbedBall.hp,
                        equipment: equipment,
                        level: Math.max(absorbedBall.level + source.levelDiff, 1),
                        metadata: absorbedBall.properties.metadata,
                    },
                }, absorbedBall.squad, absorbedBall.squadIndexReference, source.team));

                ball.timesKilledEnemy = absorbedBall.timesKilledEnemy;
            }

            source.absorbedBalls = [];
        }

        private static getClosestAlly(source: PokeBall, world: World) {
            let validBalls = getAlliesNotSelf(world, source).filter(ball => ball.canBeTargetedForDeath && !ball.targetedForDeath && !ball.isInShop);
            if (validBalls.length === 0) return undefined;

           return M.argmin(validBalls, ball => G.distance(source, ball));
        }
    }
}