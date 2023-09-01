class OrbitingIcon extends Sprite {
    oscSpeed: number = 1;
    radiusScale: number = 1;
    direction: number = 1;

    getParentBall: () => Ball;

    constructor(icon: string, getParentBall: () => Ball) {
        super({
            texture: icon,
        });

        this.getParentBall = getParentBall;
    }

    update(): void {
        super.update();
        this.updatePosition();
    }

    private updatePosition() {
        let t = this.life.time * this.direction;
        let parent = this.getParentBall();
        let radiusFactor = parent ? M.map(Math.max(parent.visibleRadius/8, 1), 1, 12, 1, 10) * this.radiusScale : 1;
        let xfactor = M.lerp(-0.25, 0.25, Tween.Easing.OscillateSine(this.oscSpeed/8)(t));

        this.localx = M.lerp(-12*radiusFactor, 12*radiusFactor, Tween.Easing.OscillateSine(this.oscSpeed)(t));
        this.localy = M.lerp(-6*radiusFactor, 6*radiusFactor, Tween.Easing.OscillateSine(this.oscSpeed)(t + 0.25)) + this.localx * xfactor;
    }

    postUpdate(): void {
        let parent = this.getParentBall();
        if (parent) {
            this.layer = parent.layer;
            if (Tween.Easing.OscillateSine(this.oscSpeed)(this.life.time * this.direction + 0.25) < 0.5) World.Actions.orderWorldObjectAfter(this, parent.stars);
            else World.Actions.orderWorldObjectBefore(this, parent);
        }

        // Fix for Polarity Inverter's fan
        if (this.parent && this.parent instanceof Equipments.PolarityInverter && this.children.length === 1) {
            World.Actions.orderWorldObjectAfter(this.children[0], this);
        }
    }

    setForShare(): void {
        this.life.time = Random.element([0, 0.5]);
        this.updatePosition();
    }
}