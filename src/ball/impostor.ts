namespace Balls {
    export class Impostor extends Ball {
        getName() { return this.disguised ? 'Crewmate' : 'Impostor'; }
        getDesc() {
            let s = this.tasksPerMinute === 1 ? '' : 's';
            if (this.disguised) return `Performs [lb]${this.tasksPerMinute}[/lb] task${s} per minute and is definitely not suspicious`;
            return `Damage is boosted by +[r]${this.extraDamage}<sword>[/r] if there is only one enemy nearby, [r]but deals ${this.lowDamage}<sword> otherwise[/r]`;
        }
        getShopDmg() { return 2; }
        getShopHp() { return 4; }
        getCredits() { return [CreditsNames.FIREBALLME, CreditsNames.JAEIL]; }

        get extraDamage() { return 3*this.level; }
        get lowDamage() { return 1; }
        get detectionRadius() { return this.physicalRadius + 36; }
        get tasksPerMinute() { return this.level; }

        constructor(config: Ball.Config) {
            super('balls/impostor', 8, config);

            this.addChild(new AbilityRadius(this, () => this.disguised ? 0 : this.detectionRadius, 0xFF0000, 0xFF3333, 0.6));

            this.addAbility('onPlay', Impostor.onPlay, { nullifyable: false, canActivateTwice: false });
        }

        updateBattle(): void {
            super.updateBattle();

            if (this.disguised) {
                this.undisguise();
                this.world.addWorldObject(new CircleImpact(this.x, this.y, this.physicalRadius, { ally: 0, enemy: 0 }, this));
                this.world.playSound('cloak', { humanized: false, limit: 2 });
            }    
        }

        getAbilityOverrideCollisionDamage(): number {
            let enemies = this.getEnemiesInRange(this.world);
            if (enemies.length > 1) {
                return this.lowDamage;
            }
            let extraDamage = this.shouldActivateAbilityTwice() ? 2*this.extraDamage : this.extraDamage;
            return super.getAbilityOverrideCollisionDamage() + extraDamage;
        }

        static onPlay(source: Impostor, world: World) {
            source.runScript(source.dropInVent());

            FIND_OPPONENT_WAIT_TIME = Math.max(FIND_OPPONENT_WAIT_TIME, 2);
        }

        onTeamsSpawned(): void {
            if (GAME_MODE === 'mm') {
                this.flipSideMM();
            } else {
                this.flipSideVS();
            }
        }

        private dropInVent() {
            let impostor = this;
            return function*() {
                impostor.setVisible(false);
                let vent = impostor.world.addWorldObject(new Sprite({
                    x: impostor.x, y: impostor.y,
                    animations: [ Animations.fromTextureList({ name: 'vent', textureRoot: 'impostor_vent', textures: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 20, 20], frameRate: 18 }) ],
                    layer: Battle.Layers.fx,
                    effects: { post: { filters: [new BallTeamColorFilter(Ball.getTeamColor(impostor.team))] }},
                }));
                yield S.waitUntil(() => !vent.getCurrentAnimationName());

                vent.runScript(function*() {
                    yield S.tween(0.2, vent, 'alpha', 1, 0);
                    vent.kill();
                });
            };
        }

        private flipSideMM() {
            let impostor = this;
            this.runScript(function*() {
                if (impostor.isVisible()) {
                    yield impostor.dropInVent();
                }

                impostor.teleport(impostor.world.width - impostor.x, impostor.y);
                impostor.disguise();

                yield;

                let vent = impostor.world.addWorldObject(new Sprite({
                    x: impostor.x, y: impostor.y,
                    animations: [ Animations.fromTextureList({ name: 'vent', textureRoot: 'impostor_vent', textures: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0], frameRate: 18 }) ],
                    layer: Battle.Layers.onground,
                    effects: { post: { filters: [new BallTeamColorFilter(Ball.getTeamColor(Ball.getInverseTeam(impostor.team)))] }},
                }));
                yield S.waitUntil(() => !vent.getCurrentAnimationName());

                impostor.setVisible(true);
                vent.setTexture('impostor_vent/20');

                vent.runScript(function*() {
                    yield S.tween(0.2, vent, 'alpha', 1, 0);
                    vent.kill();
                });
            });
        }

        private flipSideVS() {
            this.x = this.world.width - this.x;
            this.disguise();
        }

        private getEnemiesInRange(world: World) {
            return getEnemies(world, this).filter(enemy => G.distance(enemy, this) < enemy.physicalRadius + this.detectionRadius);
        }
    }
}