namespace Balls {
    export class QuestionBall extends Ball {
        getName() { return '? Ball'; }
        getDesc() { return `When this takes discrete damage, gain [gold]<coin>1[/gold] (max [lb]${this.maxGold}[/lb])`; }
        getShopDmg() { return 1; }
        getShopHp() { return 3; }
        getCredits() { return [CreditsNames.POPAN, CreditsNames.MATERWELONS]; }

        get maxGold() { return this.level; }

        private currentGold = 0;

        constructor(config: Ball.Config) {
            super('balls/questionball', 8, config);
            this.angle = 90;

            this.addAbility('onTakeDamage', QuestionBall.onTakeDamage);
        }

        private static onTakeDamage(source: QuestionBall, world: World, damage: number): void {
            if (source.currentGold >= source.maxGold) return;

            if (source.team === 'friend' && youArePlaying(world)) {
                addStartShopEffect({
                    type: 'gold',
                    gold: 1,
                    sourceSquadIndex: source.squadIndexReference,
                });
            }
            
            source.currentGold++;

            source.flash(0xFFFFFF, 1, 0.2);
            world.playSound('mariocoin', { humanized: false });

            if (source.currentGold >= source.maxGold) {
                source.changeBaseTextureAndRadius('balls/questionballspent', source.radius);
            }
        }
    }
}