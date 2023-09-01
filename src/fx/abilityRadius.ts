class AbilityRadius extends WorldObject {
    private ballParent: Ball;
    private getAbilityRadius: () => number;
    private color1: number;
    private color2: number;
    private alpha: number;

    private visibleRadius: number;

    constructor(ballParent: Ball, getAbilityRadius: () => number, color1: number, color2: number, alpha: number) {
        super({
            copyFromParent: ['layer'],
        });

        this.ballParent = ballParent;
        this.getAbilityRadius = getAbilityRadius;
        this.color1 = color1;
        this.color2 = color2;
        this.alpha = alpha;

        this.visibleRadius = getAbilityRadius();
    }

    onAdd(): void {
        super.onAdd();
        this.updateVisibleRadius();
    }

    update() {
        super.update();
        this.updateVisibleRadius();
    }

    private updateVisibleRadius() {
        let radiusMoveSpeed = 500;

        if (this.ballParent.isNullified()) {
            this.visibleRadius = M.moveToClamp(this.visibleRadius, 0, radiusMoveSpeed, this.delta);
        } else if (this.ballParent.isInYourSquadScene) {
            this.visibleRadius = 0;
        } else if (this.ballParent.isInShop && !this.ballParent.isBeingMoved()) {
            this.visibleRadius = 0;
        } else {
            this.visibleRadius = M.moveToClamp(this.visibleRadius, this.getAbilityRadius(), radiusMoveSpeed, this.delta);
        }
    }

    postUpdate(): void {
        super.postUpdate();
        World.Actions.orderWorldObjectBefore(this, this.ballParent);
    }

    render(texture: Texture, x: number, y: number): void {
        Draw.brush.color = this.color1 === this.color2 ? this.color1
                            : Color.lerpColorByLch(this.color1, this.color2, Tween.Easing.OscillateSine(2)(this.life.time));
        Draw.brush.alpha = this.alpha;
        Draw.brush.thickness = 1;
        Draw.circleOutline(texture, x, y, this.visibleRadius, Draw.ALIGNMENT_INNER);

        super.render(texture, x, y);
    }
}