class BdayBallTrail extends Sprite {
    private filter: BdayBallTrail.ConstantAlphaFilter;

    private oldTexture: Texture;

    constructor() {
        super({
            texture: new BasicTexture(global.gameWidth, global.gameHeight, 'BdayBallTrail.texture'),
            layer: Battle.Layers.onground,
            effects: { post: { filters: [ new BdayBallTrail.RenderFilter() ] }},
        });

        this.filter = new BdayBallTrail.ConstantAlphaFilter();

        this.oldTexture = new BasicTexture(global.gameWidth, global.gameHeight, 'BdayBallTrail.oldTexture');
    }

    update() {
        super.update();

        this.filter.delta = this.delta;

        this.oldTexture.clear();
        this.getTexture().renderTo(this.oldTexture, { filters: [ this.filter ] });
        
        let newTexture = this.oldTexture;
        this.oldTexture = this.getTexture();
        this.setTexture(newTexture);

        let balls = this.world.select.typeAll(Ball).filter(ball => ball.state === 'battle');
        for (let ball of balls) {
            Draw.brush.color = 0x89700D;
            Draw.brush.alpha = 1;
            Draw.circleSolid(newTexture, ball.x, ball.y, ball.physicalRadius * Random.float(0.25, 0.5));
        }

        this.setTexture(newTexture);
    }
}

namespace BdayBallTrail {
    export class ConstantAlphaFilter extends TextureFilter {
        set delta(v: number) {
            this.setUniform('delta', v);
        }

        constructor() {
            super({
                uniforms: { 'float delta': 0 },
                code: `
                    float speed = 2.0;
                    outp.a = max(0.0, inp.a - speed*delta * map(inp.a, 1.0, 0.0, 0.5, 1.0));
                `
            });
        }
    }

    export class RenderFilter extends TextureFilter {
        constructor() {
            super({
                uniforms: { 'vec3 baseColor': M.colorToVec3(0x896E00), 'vec3 topColor': M.colorToVec3(0xA08310), 'vec3 bottomColor': M.colorToVec3(0xFFE14F) },
                code: `
                    if (inp.a > 0.0) {
                        if (getColor(x, y-1.0).a == 0.0) {
                            outp.rgb = topColor;
                            outp.a = 0.5;
                        } else if (getColor(x, y+1.0).a == 0.0) {
                            outp.rgb = bottomColor;
                            outp.a = 0.5;
                        } else {
                            outp.rgb = baseColor;
                            outp.a = 0.5;
                        }
                    }
                `
            });
        }
    }
}