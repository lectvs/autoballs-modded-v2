class AbilityAura extends WorldObject {
    private ballParent: Ball;
    private getAbilityRadius: () => number;
    private color: number;
    private alpha: number;

    private visibleRadius: number;

    constructor(ballParent: Ball, getAbilityRadius: () => number, color: number, alpha: number) {
        super({
            copyFromParent: ['layer'],
        });

        this.ballParent = ballParent;
        this.getAbilityRadius = getAbilityRadius;
        this.color = color;
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
        let auraTexture = AssetCache.getTexture('aura');

        let scale = this.visibleRadius / 64;

        auraTexture.renderTo(texture, {
            x, y,
            tint: this.color,
            alpha: this.alpha,
            scaleX: scale,
            scaleY: scale,
        });

        super.render(texture, x, y);
    }
}