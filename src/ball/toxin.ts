namespace Balls {
    export class Toxin extends Ball {
        getName() { return 'Toxin'; }
        getDesc() { return `On enter battle AND on death, leave a pool of acid which damages enemies for [r]${this.acidDamage}<sword>/s[/r]`; }
        getShopDmg() { return 3; }
        getShopHp() { return 3; }
        getCredits() { return [CreditsNames.NEPDEP]; }

        get acidDamage() { return 0.5*this.level; }
        get acidRadius() { return this.physicalRadius-8 + 45*Math.exp(0.75*this.level)/(Math.exp(0.75*this.level) + 2); }

        constructor(config: Ball.Config) {
            super('balls/toxin', 8, config);

            this.addAbility('onEnterBattle', Toxin.onEnterBattle, { canActivateTwice: false });
            this.addAbility('onDeath', Toxin.onDeath, { canActivateTwice: false });
        }

        onAdd() {
            super.onAdd();
            this.addChild(new AbilityRadius(this, () => this.acidRadius, 0x00FF00, 0x33FF33, 0.7));
        }

        private static onEnterBattle(source: Toxin, world: World) {
            Toxin.createPool(source.x, source.y, source, world);
            if (source.shouldActivateAbilityTwice()) {
                world.runScript(function*() {
                    yield S.wait(0.3);
                    Toxin.createPool(source.x, source.y, source, world);
                });
            }
        }

        private static onDeath(source: Toxin, world: World) {
            Toxin.createPool(source.x, source.y, source, world);
            if (source.shouldActivateAbilityTwice()) {
                world.runScript(function*() {
                    yield S.wait(0.3);
                    let pos = source.getPosition().add(Ball.Random.onCircle(10));
                    Toxin.createPool(pos.x, pos.y, source, world);
                });
            }
        }

        private static createPool(x: number, y: number, source: Toxin, world: World) {
            world.addWorldObject(new AcidPool(x, y, source, source.acidRadius, source.acidDamage));
            world.playSound('slosh');
        }
    }
}