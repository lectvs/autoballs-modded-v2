class ArgFish extends Sprite {
    constructor(x: number, y: number, dx: number) {
        super({
            x, y,
            texture: y >= 1100 ? 'arg/fishdead' : 'arg/fish',
            tint: 0x00FF00,
        });

        let time = dx / 20;

        let fish = this;
        this.runScript(function*() {
            while (true) {
                yield S.tweenPt(time, fish, vec2(x, y), vec2(x+dx, y), Tween.Easing.InOutCubic);
                yield S.wait(0.2);
                yield S.tweenPt(time, fish, vec2(x+dx, y), vec2(x, y), Tween.Easing.InOutCubic);
                yield S.wait(0.2);
            }
        });
    }

    update(): void {
        super.update();

        this.flipX = (this.x - this.lastx < 0);

        let hook = this.world.select.type(ArgHook, false);
        if (hook && G.distance(this, hook) < 10) {
            this.world.data.score++;
            this.world.playSound('arg/pickup');
            let scoreText = this.world.addWorldObject(new SpriteText({
                p: this,
                text: '+1',
                anchor: Vector2.CENTER,
                style: { color: 0x00FF00 },
                life: 1,
            }));
            World.Actions.orderWorldObjectBefore(scoreText, hook);
            this.kill();
        }
    }
}