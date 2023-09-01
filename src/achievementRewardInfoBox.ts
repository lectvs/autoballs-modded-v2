class AchievementRewardInfoBox extends Sprite {
    static PADDING = vec2(8, 4);

    private text: SpriteText;
    private floatTimer: Timer;
    private onlyOperateInBounds: Rect;
    
    constructor(onlyOperateInBounds: Rect) {
        super({
            useGlobalTime: true,
        });

        this.text = this.addChild(new SpriteText({
            anchor: Vector2.CENTER,
            justify: 'center',
            copyFromParent: ['layer'],
        }));

        this.floatTimer = new Timer(0.25, () => this.setVisible(true));
        this.onlyOperateInBounds = onlyOperateInBounds;
    }

    update() {
        super.update();

        let mousePos = this.world.getWorldMousePosition();

        let rewards = this.world.select.tag<Sprite>('reward');
        let selectedReward = rewards.find(reward => reward.bounds.containsPoint(mousePos));

        // Yes, basic highlighting here...
        for (let reward of rewards) {
            if (reward === selectedReward) {
                reward.effects.outline.color = 0xFFFF00;
                reward.effects.outline.enabled = true;
            } else {
                reward.effects.outline.enabled = false;
            }
        }

        let inBounds = !selectedReward || G.overlapRectangles(this.onlyOperateInBounds, selectedReward.getVisibleScreenBounds());

        if (selectedReward && inBounds) {
            let text = '??????';
            if (selectedReward.hasTag('secret')) {
                text = selectedReward.data.desc ?? 'Secret Achievement :)';
            }
            this.text.setText(text);

            let width = this.text.getTextWidth() + 2*AchievementRewardInfoBox.PADDING.x - 1;
            let height = this.text.getTextHeight() + 2*AchievementRewardInfoBox.PADDING.y;
            this.setTexture(InfoBox.getTextureForSize(width, height));

            let extraMove = IS_MOBILE ? 20 : 0;
            
            this.x = mousePos.x + width/2 + extraMove;
            this.y = mousePos.y + height/2 + extraMove;

            this.floatTimer.update(this.delta);
        } else {
            this.setVisible(false);
            this.floatTimer.reset();
        }
    }
}