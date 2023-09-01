namespace Balls {
    export class Butterball extends Ball {
        getName() { return 'Butterball'; }
        getDesc() { return `Leaves a trail of butter which allows allies to move up to [lb]${this.moveSpeedFactorPercent}%[/lb] max speed`; }
        getShopDmg() { return 2; }
        getShopHp() { return 5; }
        getCredits() { return [CreditsNames.DEAGLE_EYE]; }

        get moveSpeedFactorPercent() { return 120 + 20*(this.level-1); }
        get moveSpeedFactor() { return this.moveSpeedFactorPercent/100; }
        get butterLife() { return 2; }
        get initialButterLife() { return 4; }

        private butterSystem: ButterSystem;
        private butterTime: number;
        private butterDistance: number;

        constructor(config: Ball.Config) {
            super('balls/butterball', 8, config);

            this.butterTime = 0;
            this.butterDistance = 0;

            this.addAbility('onEnterBattle', Butterball.onEnterBattle);
            this.addAbility('onDeath', Butterball.onDeath);
            this.addAbility('update', Butterball.update, { canActivateTwice: false });
        }

        onAdd(): void {
            super.onAdd();
            this.butterSystem = this.world.addWorldObject(new ButterSystem(this, this.moveSpeedFactor));

            if (this.world.getLayerByName(Battle.Layers.onground)) {
                this.butterSystem.layer = Battle.Layers.onground;
            }
        }

        private static onEnterBattle(source: Butterball, world: World) {
            Butterball.bigSplat(source, world);
        }

        private static update(source: Butterball, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            source.butterTime += source.delta;
            source.butterDistance += source.v.magnitude * source.delta;

            if (source.butterTime >= 0.3 || source.butterDistance >= source.physicalRadius) {
                source.butterTime = 0;
                source.butterDistance = 0;
                Butterball.addButterGlob(source);
            }
        }

        private static onDeath(source: Butterball, world: World) {
            Butterball.bigSplat(source, world);
        }

        private static bigSplat(source: Butterball, world: World) {
            let pos = source.getPosition();
            let bs = source.butterSystem;
            bs.addGlob(pos, 32, 0.3, source.initialButterLife, 0.7);
            world.runScript(S.schedule(
                0.03, S.call(() => bs.addGlob(Random.inCircle(20).add(pos), Random.int(8, 12), 0.2, source.initialButterLife, 0.5)),
                0.06, S.call(() => bs.addGlob(Random.inCircle(20).add(pos), Random.int(8, 12), 0.2, source.initialButterLife, 0.5)),
                0.09, S.call(() => bs.addGlob(Random.inCircle(20).add(pos), Random.int(8, 12), 0.2, source.initialButterLife, 0.5)),
                0.12, S.call(() => bs.addGlob(Random.inCircle(20).add(pos), Random.int(8, 12), 0.2, source.initialButterLife, 0.5)),
                0.15, S.call(() => bs.addGlob(Random.inCircle(20).add(pos), Random.int(8, 12), 0.2, source.initialButterLife, 0.5)),
            ));
            world.playSound('slosh');
        }

        private static addButterGlob(source: Butterball) {
            if (!source.butterSystem) return;
            source.butterSystem.addGlob(source.getPosition(), Random.int(6, 8), 0, source.butterLife, 0.3);
        }
    }
}