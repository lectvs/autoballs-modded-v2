namespace Balls {
    export class Medic extends Ball {
        getName() { return 'Medic'; }
        getDesc() { return `When this takes discrete damage, dispense a medpack that heals allies for [g]${this.medpackHealth}<heart>[/g] when they roll over it\n\nMedics cannot pick up medpacks`; }
        getShopDmg() { return 1; }
        getShopHp() { return 6; }

        get medpackHealth() { return this.level; }

        constructor(config: Ball.Config) {
            super('balls/medic', 8, config);

            this.addAbility('onTakeDamage', Medic.onTakeDamage);
        }

        private static onTakeDamage(source: Medic, world: World, damage: number): void {
            world.addWorldObject(new Medpack(source.x, source.y, Ball.Random.inDisc(60, 120), source, source.medpackHealth));
        }
    }
}