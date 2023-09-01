namespace Balls {
    export class Zoomer extends Ball {
        getName() { return 'Zoomer'; }
        getDesc() { return `Always moves at minimum [lb]${this.speedPercent}%[/lb] speed`; }
        getShopDmg() { return 1; }
        getShopHp() { return 4; }
        getCredits() { return [CreditsNames.NEPDEP]; }

        get speedPercent() { return 90 + 5*(this.level-1); }
        get speedFactor() { return this.speedPercent/100; }

        constructor(config: Ball.Config) {
            super('balls/zoomer', 8, config);

            this.addAbility('update', Zoomer.update);
        }

        private static update(source: Zoomer, world: World) {
            if (source.state !== Ball.States.BATTLE) return;
            
            let maxSpeed = isFinite(source.maxSpeed) ? source.maxSpeed : 150;
            let targetSpeed = maxSpeed * source.speedFactor;

            if (source.v.magnitude > 0 && source.v.magnitude < targetSpeed) {
                source.v.setMagnitude(targetSpeed);
            }

            source.addBoostMaxSpeed(source, 'other', source.speedFactor, source.speedFactor, 0.5);
        }
    }
}