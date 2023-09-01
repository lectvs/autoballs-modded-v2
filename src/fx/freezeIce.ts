class FreezeIce extends Sprite {
    private radius: number;

    constructor(radius: number, immediate: boolean) {
        let freezeTexture: string;
        if (radius <= 8) freezeTexture = 'freeze8';
        else freezeTexture = 'freeze16';

        super({
            texture: freezeTexture,
            alpha: 1,
            angle: Random.int(1, 4) * 90,
            copyFromParent: ['layer'],
        });

        this.radius = radius;

        if (!immediate) {
            this.alpha = 0;
            this.scale = 0.8;
            this.runScript(S.simul(
                S.tween(0.2, this, 'alpha', 0, 1, Tween.Easing.InQuad),
                S.tween(0.2, this, 'scale', 0.8, 1, Tween.Easing.InQuad),
            ));
        }
    }

    kill(): void {
        let shattered = lazy(`freezeIceShattered/${this.getTextureKey()}`,
                        () => this.getTexture().subdivide(2, 2, 'FreezeIce.kill').map(sd => {
                            sd.texture = new AnchoredTexture(sd.texture, 0.5, 0.5);
                            return sd;
                        }));

        for (let shatter of shattered) {
            this.world.addWorldObject(new Sprite({
                x: this.x - this.radius*1.5 + shatter.x,
                y: this.y - this.radius*1.5 + shatter.y,
                texture: shatter.texture,
                alpha: this.alpha,
                layer: this.layer,
                v: Random.inCircle(150),
                vangle: 720*Random.sign(),
                life: 0.3,
                update: function() {
                    this.alpha = M.lerp(this.alpha, 0, Tween.Easing.InQuad(this.life.progress));
                }
            }));
        }

        super.kill();
    }
}