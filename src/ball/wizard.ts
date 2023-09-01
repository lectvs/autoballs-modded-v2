namespace Balls {
    export class Wizard extends Ball {
        getName() { return 'Wizard'; }
        getDesc() {
            if (Wizard.getRestocks(this) === 1) return `If sold, will reappear in the shop next restock with +${buffText(Wizard.getBuffAmount(this), Wizard.getBuffAmount(this))}\n\nRequired restocks carry over between rounds`;
            return `If sold, will reappear in the shop after [lb]${Wizard.getRestocks(this)}[/lb] restocks\nwith +${buffText(Wizard.getBuffAmount(this), Wizard.getBuffAmount(this))}\n\nRequired restocks carry over between rounds`;
        }
        getShopDmg() { return 3; }
        getShopHp() { return 3; }
        getShopRelativePosition() { return vec2(0, 4); }
        getCredits() { return [CreditsNames.MATERWELONS]; }

        static getRestocks(source: Ball) { return Math.max(8 - 2*(source.level-1), 1); }
        static getBuffAmount(source: Ball) { return 1; }

        private hat: Sprite;

        constructor(config: Ball.Config) {
            super('balls/wizard', 8, config);

            this.hat = this.addChild(new Sprite({
                texture: 'wizardhat',
                copyFromParent: ['layer'],
            }));

            this.addAbility('onSell', Wizard.onSell, { canActivateTwice: false });
        }

        postUpdate() {
            super.postUpdate();
            this.hat.alpha = this.alpha;
            this.hat.scale = this.ballScale * this.moveScale;
            World.Actions.orderWorldObjectAfter(this.hat, this);
        }

        changeHighlight(enabled: boolean, color?: number, alpha?: number) {
            if (color === undefined) color = this.hat.effects.outline.color;
            if (alpha === undefined) alpha = this.hat.effects.outline.alpha;
            this.hat.effects.outline.enabled = enabled;
            this.hat.effects.outline.color = color;
            this.hat.effects.outline.alpha = alpha;
        }

        static onSell(source: Ball, world: World) {
            Wizard.giveBuff(source);
            if (source.shouldActivateAbilityTwice()) {
                Wizard.giveBuff(source);
            }
            GAME_DATA.restockQueue.push({ restocksLeft: Wizard.getRestocks(source), ball: source.properties });
        }

        static giveBuff(source: Ball) {
            source.dmg += Wizard.getBuffAmount(source);
            source.hp += Wizard.getBuffAmount(source);
            source.properties.damage += Wizard.getBuffAmount(source);
            source.properties.health += Wizard.getBuffAmount(source);
        }
    }
}