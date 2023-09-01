class ArgKey extends Sprite {
    constructor(x: number, y: number) {
        super({
            x, y,
            texture: 'arg/key',
            layer: ARG.Layers.main,
            bounds: new RectBounds(-4, -4, 8, 8),
        });

        let key = this;

        this.stateMachine.addState('idle', {
            transitions: [ { toState: 'following', condition: () => this.isCollidingWithBec() } ]
        });

        this.stateMachine.addState('following', {
            callback: () => {
                this.world.playSound('arg/pickup', { humanized: false });
            },
            script: function*() {
                yield S.tweenPt(0.5, key, key, key.world.select.type(Bec).getPosition().subtract(12, 0), Tween.Easing.OutQuad);
            },
            update: () => {
                let bec = this.world.select.type(Bec);
                if (bec && G.distance(this, bec) > 12) {
                    let d = bec.getPosition().subtract(this).normalize();
                    this.x = bec.x - d.x*12;
                    this.y = bec.y - d.y*12;
                }
            }
        });

        this.stateMachine.addState('free', {});

        this.setState('idle');
    }

    update(): void {
        super.update();
        this.z = M.lerp(1, -1, Tween.Easing.OscillateSine(0.5)(this.life.time));
    }

    getRenderScreenX() {
        let bec = this.world.select.type(Bec);
        if (!bec || this.state !== 'following') return super.getRenderScreenX();
        // Snap to pixel relative to Bec.
        let savedX = this.x;
        this.x = Math.round(this.x - bec.x) + bec.x;
        let result = super.getRenderScreenX();
        this.x = savedX;
        return result;
    }

    getRenderScreenY() {
        let bec = this.world.select.type(Bec);
        if (!bec || this.state !== 'following') return super.getRenderScreenY();
        // Snap to pixel relative to Bec.
        let savedY = this.y;
        this.y = Math.round(this.y - bec.y) + bec.y;
        let result = super.getRenderScreenY();
        this.y = savedY;
        return result;
    }

    private isCollidingWithBec() {
        if (!this.world) return false;
        let bec = this.world.select.type(Bec);
        if (!bec) return false;

        return bec.bounds.isOverlapping(this.bounds);
    }
}