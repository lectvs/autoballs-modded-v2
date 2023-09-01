namespace Balls {
    export class BowlingBall extends Ball {
        getName() { return 'Bowling Ball'; }
        getDesc() { return `Gain mass and up to [r]${this.maxDmgGain}<sword>[/r] extra damage with speed`; }
        getShopDmg() { return 1; }
        getShopHp() { return 2; }
        getCredits() { return [CreditsNames.EVERYONE]; }

        get maxDmgGain() { return 1.5 + 1*(this.level-1); }

        private currentDmgGain: number;
        private speedFlame: Sprite;

        constructor(config: Ball.Config) {
            super('balls/bowlingball', 8, config);

            this.currentDmgGain = 0;

            this.speedFlame = this.addChild(new Sprite({
                texture: 'speedflame',
                tint: 0xFFAA00,
                alpha: 0,
                blendMode: Texture.BlendModes.ADD,
                copyFromParent: ['layer'],
            }));

            this.addAbility('update', BowlingBall.update, { canActivateTwice: false, nullifyable: false });
        }

        postUpdate() {
            super.postUpdate();

            World.Actions.orderWorldObjectAfter(this.speedFlame, this);
            this.speedFlame.angle = this.angle;
            this.speedFlame.scaleY = M.lerp(1, 1.1, Tween.Easing.OscillateSine(8)(this.life.time));
        }

        private static update(source: BowlingBall, world: World) {
            if (source.state !== Ball.States.BATTLE) {
                source.speedFlame.alpha = 0;
                source.speedFlame.setVisible(false);
                return;
            }

            let speedRatioClamped = M.clamp(source.getSpeed() / Ball.maxSpeedBase, 0, 1);
            if (source.isNullified()) speedRatioClamped = 0;

            let targetDmgGain = M.lerp(0, source.maxDmgGain, speedRatioClamped);
            let dmgGainDiff = targetDmgGain - source.currentDmgGain;
            source.dmg += dmgGainDiff;
            source.currentDmgGain += dmgGainDiff;
            source.showDmgStat(dmgGainDiff, 0.5);

            source.setMassScale(M.lerp(1, 8, speedRatioClamped));

            let targetAlpha = M.lerp(0, 0.7, Tween.Easing.InQuad(speedRatioClamped));
            source.speedFlame.alpha = M.moveToClamp(source.speedFlame.alpha, targetAlpha, 1, source.delta);
            source.speedFlame.setVisible(!source.isInShop && !source.isInYourSquadScene);
        }
    }
}