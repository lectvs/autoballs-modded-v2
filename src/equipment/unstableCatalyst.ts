/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class UnstableCatalyst extends OrbitEquipment {
        getName() { return 'Unstable Catalyst'; }
        getDesc() { return `Passively convert -[g]0.25<heart>/s[/g] into +[r]1<sword>/s[/r]`; }

        get healthDrainRate() { return 0.25; }
        get damageGainRate() { return 1; }

        constructor() {
            super('equipments/unstablecatalyst', 'items/unstablecatalyst');

            this.addAbility('update', UnstableCatalyst.update);
        }
    
        private static update(equipment: UnstableCatalyst, source: Ball, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            let hpToConvert = Math.min(equipment.healthDrainRate * equipment.delta, source.hp);

            if (hpToConvert > 0) {
                source.hp -= hpToConvert;
                source.dmg += equipment.damageGainRate/equipment.healthDrainRate * hpToConvert;
                source.showHpStat(-hpToConvert, 0.5);
                source.showDmgStat(hpToConvert, 0.5);
            }
        }
    }
}
