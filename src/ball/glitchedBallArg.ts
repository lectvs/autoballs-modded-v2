namespace Balls {
    export class GlitchedBallArg extends Ball {
        getName() { return 'Gl[glitched]<g4>t[offsety 2]c[/offsety]he[/glitched]d B[glitched]<g2>[offsety 1]<g3>[/offsety]l[/glitched]'; }
        getDesc() { return `<g2>?[glitched]?? <g1><g3><g4><g5>[/glitched]??<g4> [glitched]<g5><g4>[/glitched]<g1>?<g3> R<g1> oun?d5 [glitched]<g2><g4>[/glitched]?`; }
        getShopDmg() { return 2; }
        getShopHp() { return 3; }
        getShopCost() { return 0; }

        canFreeze: boolean = false;
        
        private baseTextures: string[];
        private baseTextureIndex: number = 0;

        constructor(config: Ball.Config) {
            super('balls/commando', 8, config);

            this.effects.post.filters.push(new Effects.Filters.Glitch(8, 4, 4));

            this.addTimer(0.2, () => this.changeAnimations(), Infinity);

            this.addAbility('onCollideWithBallPreDamage', GlitchedBallArg.onCollideWithBallPreDamage);
        }

        isGlitched(): boolean {
            return true;
        }

        changeAnimations() {
            let baseTexture = this.getNextBaseTexture();
            this.changeBaseTextureAndRadius(baseTexture, 8);
        }

        private static onCollideWithBallPreDamage(source: GlitchedBallArg, world: World, ball: Ball): void {
            if (ball.team === source.team) return;
            world.runScript(glitchSmall(world));
        }

        private getNextBaseTexture() {
            if (_.isEmpty(this.baseTextures)) this.baseTextures = Object.keys(ballTextureCache).filter(key => key !== "undefined" && !_.contains(GlitchedBall.BAD_TEXTURES, key));;
            if (_.isEmpty(this.baseTextures)) this.baseTextures = ['balls/ninja', 'balls/crystalball', 'balls/martyr'];
            let baseTexture = this.baseTextures[this.baseTextureIndex];
            this.baseTextureIndex = M.mod(this.baseTextureIndex+1, this.baseTextures.length);
            return baseTexture;
        }
    }
}