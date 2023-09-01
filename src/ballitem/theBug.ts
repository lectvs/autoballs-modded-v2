namespace BallItems {
    export class TheBug extends EquipmentItem {
        getName() { return 'Th<g3> B[glitched]u[/]g'; }
        getDesc() { return `The equ<g2>pped ball transforms into a r<g4>ndom shop ball on restock`; }
        getShopCost() { return 0; }

        canFreeze: boolean = false;

        constructor(x: number, y: number) {
            super(x, y, 'items/thebug', 41);

            this.effects.post.filters.push(new Effects.Filters.Glitch(2, 2, 4));
        }

        canApplyToBall(ball: Ball): boolean {
            if (ball.isInShop) return false;
            return super.canApplyToBall(ball);
        }

        onApplyToBall(ball: Ball): void {
            if (ball instanceof Balls.GlitchedBallArg) {
                saveMatchmakingOrChallengeModeOrDailyGameData(undefined, CHALLENGE_MODE_ENABLED, DAILY);
                global.theater.playCutscene(ARG.Cutscenes.BEGIN_ARG);
            } else {
                this.world.runScript(glitchSmall(this.world));
                super.onApplyToBall(ball);
            }
        }
    }
}