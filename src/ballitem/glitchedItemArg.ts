namespace BallItems {
    export class GlitchedItemArg extends BallItem {
        getName() { return '[glitched]G[offsety -1]li[/offsety]<g1>[/glitched][offsety 6]ch[/offsety][glitched]<g3>d[/glitched] [offsety 4]I[/offsety][glitched]<g2>e[/glitched]m'; }
        getDesc() { return `<g1><g4>[glitched]<g2><g3> <g5><g2><g1>??[/glitched]??<g4>`; }
        getShopCost() { return 0; }

        canFreeze: boolean = false;
    
        private baseTextures: string[];
        private baseTextureIndex: number = 0;

        constructor(x: number, y: number) {
            super(x, y, 'items/clout');

            this.effects.post.filters.push(new Effects.Filters.Glitch(8, 4, 4));

            this.addTimer(0.2, () => this.changeAnimations(), Infinity);
        }

        isGlitched(): boolean {
            return true;
        }

        changeAnimations() {
            let baseTexture = this.getNextBaseTexture();
            this.setTexture(baseTexture);
        }

        canApplyToBall(ball: Ball): boolean {
            return ball instanceof Balls.GlitchedBallArg;
        }
    
        onApplyToBall(ball: Ball): void {
            saveMatchmakingOrChallengeModeOrDailyGameData(undefined, CHALLENGE_MODE_ENABLED, DAILY);
            global.theater.playCutscene(ARG.Cutscenes.BEGIN_ARG);
        }

        private getNextBaseTexture() {
            if (_.isEmpty(this.baseTextures)) this.baseTextures = Object.keys(AssetCache.textures).filter(key => key.startsWith('items/'));
            let baseTexture = this.baseTextures[this.baseTextureIndex];
            this.baseTextureIndex = M.mod(this.baseTextureIndex+1, this.baseTextures.length);
            return baseTexture;
        }
    }
}
