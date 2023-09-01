namespace Balls {
    export class Mimic extends Ball {
        getName() { return 'Mimic'; }
        getDesc() {
            let levelIncreaseText = this.targetLevelIncrease > 0 ? ` [w]+[/w]${this.targetLevelIncrease}<star>` : '';
            return `Copies the type of the closest ally during the shop and battle\n\nIn battle, copies [gold]half the target's\nlevel${levelIncreaseText}[/gold].\nCannot Mimic Impostors`;
        }
        getShopDmg() { return 2; }
        getShopHp() { return 8; }
        getCredits() { return [CreditsNames.SHUICHI_SAIHARA]; }

        get targetLevelIncrease() { return this.level-1; }

        private currentTarget: Ball;
        private renderFacade: Ball;

        constructor(config: Ball.Config) {
            super('balls/mimic', 8, config);

            this.preBattleAbilityInitialWaitTime = 0.5;

            this.addAbility('onStartShop', Mimic.onStartShop, { canActivateTwice: false });
            this.addAbility('onSell', Mimic.onSell, { canActivateTwice: false });
            this.addAbility('onLevelUp', Mimic.onLevelUp);
            this.addAbility('onRestock', Mimic.onRestock);
            this.addAbility('onPlay', Mimic.onPlay);

            this.addAbility('onPreBattle', Mimic.onPreBattle, { canActivateTwice: false });
            this.addAbility('onEnterBattle', Mimic.onEnterBattle, { canActivateTwice: false });
        }

        update() {
            super.update();

            this.updateClosestTarget();
            this.updateRenderFacade();

            if (this.renderFacade) {
                this.setBallScale(this.renderFacade.radius / this.radius * this.renderFacade.ballScale);
                this.renderFacade.setMoveScale(this.moveScale);
            } else {
                this.setBallScale(1);
            }
        }

        updateClosestTarget() {
            if (!this.alive) return;

            let closestAlly = Mimic.getClosestAlly(this, this.world);
            if (!closestAlly) {
                this.currentTarget = undefined;
                return;
            }

            let ballMover = this.world.select.type(BallMover, false);
            if (ballMover && ballMover.movingThing === this) {
                return;
            }

            this.currentTarget = closestAlly;
        }

        updateRenderFacade() {
            if (!this.currentTarget) {
                this.renderFacade = undefined;
                return;
            }

            if (!this.renderFacade || this.renderFacade.properties.type !== this.currentTarget.properties.type || this.renderFacade.level !== this.level) {
                this.renderFacade = squadBallToWorldBall({
                    x: 0, y: 0,
                    properties: {
                        type: this.currentTarget.properties.type,
                        damage: this.dmg,
                        health: this.hp,
                        equipment: -1,
                        level: this.level,
                        metadata: {},
                    }
                }, undefined, -1, this.team);

                if (this.renderFacade.properties.type === 11) {
                    this.renderFacade.changeBaseTextureAndRadius('mimictextures/turret', this.renderFacade.radius);
                } else if (this.renderFacade.properties.type === 53) {
                    this.renderFacade.changeBaseTextureAndRadius('mimictextures/cannon', this.renderFacade.radius);
                } else if (this.renderFacade.properties.type === 109) {
                    this.renderFacade.changeBaseTextureAndRadius('mimictextures/boomer', this.renderFacade.radius);
                } else if (this.renderFacade.properties.type === 130) {
                    this.renderFacade.changeBaseTextureAndRadius('mimictextures/scrapcannon', this.renderFacade.radius);
                }
            }

            if (this.renderFacade) {
                this.renderFacade.alpha = M.lerp(0.5, 0.8, Tween.Easing.OscillateSine(1)(this.life.time));
            }
        }

        render(texture: Texture, x: number, y: number) {
            super.render(texture, x, y);

            if (this.renderFacade) {
                this.renderFacade.render(texture, x, y);
            }
        }

        private static onStartShop(source: Mimic, world: World) {
            source.updateClosestTarget();
            if (!source.currentTarget) return;

            Mimic.doOnStartShop(source, source.currentTarget, world);
            if (source.shouldActivateAbilityTwice()) {
                Mimic.doOnStartShop(source, source.currentTarget, world);
            }
        }

        private static doOnStartShop(source: Mimic, target: Ball, world: World) {
            if (target instanceof Powerball) {
                Powerball.onStartShop(source, world);
            }

            if (target instanceof Coin) {
                Coin.onStartShop(source, world);
            }

            if (target instanceof Seed) {
                Seed.onStartShop(source, world);
            }

            if (target instanceof ScrapCannon) {
                ScrapCannon.onStartShop(source, world);
            }
        }

        private static onSell(source: Mimic, world: World) {
            if (!source.currentTarget) return;

            Mimic.doOnSell(source, source.currentTarget, world, 1);
            if (source.shouldActivateAbilityTwice()) {
                Mimic.doOnSell(source, source.currentTarget, world, 2);
            }
        }

        private static doOnSell(source: Mimic, target: Ball, world: World, whichTime: number) {
            if (target instanceof Recycler) {
                Recycler.onSell(source, world);
            }

            if (target instanceof CrystalBall) {
                CrystalBall.onSell(source, world);
            }

            if (target instanceof RedCrystalBall) {
                RedCrystalBall.onSell(source, world);
            }

            if (target instanceof GreenCrystalBall) {
                GreenCrystalBall.onSell(source, world);
            }

            if (target instanceof OldCrystalBall) {
                OldCrystalBall.onSell(source, world);
            }

            if (target instanceof NeoCrystalBall) {
                NeoCrystalBall.onSell(source, world);
            }

            if (target instanceof Wizard && whichTime <= 1) {
                Wizard.onSell(source, world);
            }
            if (target instanceof GoldCrystalBall) {
                GoldCrystalBall.onSell(source, world);
            }
        }

        private static onLevelUp(source: Mimic, world: World) {
            if (!source.currentTarget) return;

            if (source.currentTarget instanceof Wobby) {
                Wobby.onLevelUp(source, world);
            }
        }

        private static onRestock(source: Mimic, world: World) {
            if (!source.currentTarget) return;

            if (source.currentTarget instanceof ScrapCannon) {
                ScrapCannon.onRestock(source, world);
            }
        }

        private static onPlay(source: Mimic, world: World) {
            if (!source.currentTarget) return;

            if (source.currentTarget instanceof Vagrant) {
                Vagrant.onPlay(source, world);
            }

            if (source.currentTarget instanceof BallOfIce) {
                BallOfIce.onPlay(source, world);
            }

            if (source.currentTarget instanceof Bank) {
                Bank.onPlay(source, world);
            }

            if (source.currentTarget instanceof Battery) {
                Battery.onPlay(source, world);
            }

            if (source.currentTarget instanceof Impostor) {
                world.playSound('error', { humanized: false });
                world.addWorldObject(new BallMoverError(source.x, source.y-8, "MIMIC\nFAILED", 2));
            }
        }

        private static onPreBattle(source: Mimic, world: World) {
            Mimic.copyClosestAlly(source, world);
        }

        private static onEnterBattle(source: Mimic, world: World) {
            Mimic.copyClosestAlly(source, world);
        }

        private static copyClosestAlly(source: Mimic, world: World) {
            let closestAlly = Mimic.getClosestAlly(source, world);
            if (!closestAlly) return;

            let newBall = world.addWorldObject(squadBallToWorldBall({
                x: source.x,
                y: source.y,
                properties: {
                    type: closestAlly.properties.type,
                    damage: source.dmg,
                    health: source.hp,
                    equipment: source.equipment ? source.equipment.equipmentType : -1,
                    level: Math.ceil(closestAlly.level/2) + source.targetLevelIncrease,
                    metadata: source.properties.metadata,
                },
            }, source.squad, source.squadIndexReference, source.team, false, false));

            newBall.timesKilledEnemy = source.timesKilledEnemy;

            world.addWorldObject(newPuff(newBall.x, newBall.y, Battle.Layers.fx, 'medium'));
            world.playSound('sellball');
            newBall.addStun('other', 1);

            source.cancelAbilities();
            source.removeFromWorld();
        }

        private static getClosestAlly(source: Mimic, world: World) {
            if (source.isInShop || source.isInYourSquadScene) return undefined;
            let validBalls = getAlliesNotSelf(world, source).filter(ball =>
                !ball.isInShop && !ball.isInYourSquadScene && !(ball instanceof Mimic) && !(ball instanceof Impostor));
            return M.argmin(validBalls, ball => G.distance(source, ball));
        }
    }
}