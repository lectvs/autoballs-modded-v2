/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class TimeBomb extends OrbitEquipment {
        getName() { return 'Time Bomb'; }
        getDesc() { return `Explodes after 3 seconds in battle, dealing its [r]<sword>[/r] in a radius`; }

        get explosionRadius() { return 50 + (this.getParent()?.physicalRadius ?? 8)-8; }

        private timeLeftToExplode = 2.8;

        constructor() {
            super('equipments/timebomb', 'items/timebomb');

            this.orbitingIcon.setTexture(getBombTextureForNumber(this.timeLeftToExplode));

            this.addAbility('update', TimeBomb.update);
        }

        onAdd(): void {
            super.onAdd();
            this.addChild(new AbilityRadius(this.getParent(), () => this.explosionRadius, 0xFF0000, 0xFF3333, 0.6));
        }

        private static update(equipment: TimeBomb, source: Ball, world: World) {
            if (source.state !== Ball.States.BATTLE) return;

            equipment.timeLeftToExplode -= equipment.delta;

            if (equipment.timeLeftToExplode <= 0) {
                world.playSound('shake2');
                world.addWorldObject(new Explosion(source.x, source.y, equipment.explosionRadius, { ally: 0, enemy: source.dmg }, source));
                source.takeDamage(source.hp*2, source, 'other', true);
                source.unequip();
                return;
            }

            if (Math.ceil(equipment.timeLeftToExplode) < Math.ceil(equipment.timeLeftToExplode + equipment.delta)) {
                world.playSound('beep', { humanized: false });
            }

            equipment.orbitingIcon.setTexture(getBombTextureForNumber(equipment.timeLeftToExplode));

            if (equipment.timeLeftToExplode <= 1.2) {
                source.effects.silhouette.enabled = true;
                source.effects.silhouette.color = 0xFFFFFF;
                source.effects.silhouette.amount = M.mapClamp(equipment.timeLeftToExplode, 1.2, 0.8, 0, 1);
                if (equipment.timeLeftToExplode <= 1) {
                    source.offsetX = Tween.Easing.OscillateSine(6)(source.life.time);
                }
            }
        }
    }

    function getBombTextureForNumber(n: number) {
        n = Math.ceil(n);
        return lazy(`TimeBomb_texture(${n})`, () => {
            let texture = AssetCache.getTexture('equipments/timebomb').clone('TimeBomb.getBombTextureForNumber');

            new SpriteText({
                text: `${n}`,
                font: 'smallnumbers',
                style: { color: 0xFF0000 },
                anchor: Vector2.CENTER,
            })
            .render(texture, 6, 7);

            return texture;
        });
    }
}
