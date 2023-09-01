/// <reference path="./ball.ts" />

namespace Balls {
    export class Alchemist extends Ball {
        getName() { return 'Alchemist'; }
        getDesc() {
            let levelDiffDisplay = '';
            if (this.levelDiff < 0) levelDiffDisplay = `with -[gold]${-this.levelDiff}<star>[/gold]`;
            if (this.levelDiff > 0) levelDiffDisplay = `with +[gold]${this.levelDiff}<star>[/gold]`;
            return `At the start of battle, kill the closest ally and resummon it as a random shop ball ${levelDiffDisplay}\n\nActivates after other ball abilities`;
        }
        getShopDmg() { return 3; }
        getShopHp() { return 3; }

        get levelDiff() { return this.level-1; }

        private crosshair: Sprite;

        constructor(config: Ball.Config) {
            super('balls/alchemist', 8, config);
            this.canBeTargetedForDeath = false;

            this.crosshair = this.addChild(new Sprite({
                texture: 'crosshair',
                alpha: 0,
            }));

            this.preBattleAbilityInitialWaitTime = 0.5;

            this.addAbility('onPreBattle', Alchemist.onPreBattle);
            this.addAbility('onEnterBattle', Alchemist.onEnterBattle);
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
            let closestAlly = Alchemist.getClosestAlly(this, this.world);
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

        private static onPreBattle(source: Alchemist, world: World) {
            Alchemist.transformAlly(source, world);
        }

        private static onEnterBattle(source: Alchemist, world: World) {
            let battleTimer = world.select.type(BattleTimer, false);
            let timeInBattle = battleTimer ? battleTimer.battleTime : 0;
            if (timeInBattle > 0.3 || source.hasActivatedAbility('onPreBattle')) return;
            Alchemist.transformAlly(source, world);
        }

        private static transformAlly(source: Alchemist, world: World) {
            let ballToTransform = Alchemist.getClosestAlly(source, world);
            if (!ballToTransform) return;

            ballToTransform.targetedForDeath = true;
            ballToTransform.cancelAbilities();

            let absorbedHp = ballToTransform.hp;
            world.addWorldObject(new InstantKillSlash(ballToTransform, source));
            if (ballToTransform.dead || !ballToTransform.alive) {
                ballToTransform.colliding = false;
            }

            world.addWorldObject(newPuff(ballToTransform.x, ballToTransform.y, Battle.Layers.fx, 'medium'));

            source.flash(0xFFFFFF, 1);

            let equipment = ballToTransform.equipment ? ballToTransform.equipment.equipmentType : -1;
            if (equipment === 20) {  // Disallow Best Friend
                equipment = -1;
            }

            let validBallTypes = getPurchasableBallTypesForRound(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly)
                .filter(type => !_.contains(Alchemist.USELESS_BALL_TYPES, type));
            let ballType = Ball.Random.element(validBallTypes);

            world.addWorldObject(squadBallToWorldBall({
                x: ballToTransform.x,
                y: ballToTransform.y,
                properties: {
                    type: ballType,
                    damage: ballToTransform.dmg,
                    health: absorbedHp,
                    equipment: equipment,
                    level: Math.max(ballToTransform.level + source.levelDiff, 1),
                    metadata: ballToTransform.properties.metadata,
                },
            }, ballToTransform.squad, ballToTransform.squadIndexReference, source.team));
        }

        private static getClosestAlly(source: Alchemist, world: World) {
            let validBalls = getAlliesNotSelf(world, source).filter(ball => ball.canBeTargetedForDeath && !ball.targetedForDeath && !ball.isInShop);
            if (validBalls.length === 0) return undefined;

           return M.argmin(validBalls, ball => G.distance(source, ball));
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
            139, // Gold Crystal Ball
            140, // Alchemist
            142, // Greater Mimic
        ];
    }
}