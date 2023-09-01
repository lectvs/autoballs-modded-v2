class BoundsInfoBox extends Sprite {
    static PADDING = vec2(8, 4);

    private anchor: Vector2;
    private text: SpriteText;
    private floatTimer: Timer;

    enabled = true;
    
    constructor(anchor: Vector2, floatTime: number) {
        super({
            useGlobalTime: true,
            visible: false,
        });

        this.anchor = vec2(anchor);

        this.text = this.addChild(new SpriteText({
            anchor: Vector2.CENTER,
            justify: 'center',
            copyFromParent: ['layer'],
        }));

        this.floatTimer = new Timer(floatTime, () => this.setVisible(true));
    }

    update() {
        super.update();

        let mouseBounds = this.world.getWorldMouseBounds();

        let objects = this.world.select.overlap(mouseBounds).filter(obj => obj.data.infoBoxDescription);
        let closestObject = M.argmin(objects, obj => G.distance(obj, mouseBounds));

        let desc = this.enabled ? closestObject?.data?.infoBoxDescription : undefined;

        if (desc) {
            this.text.setText(desc);

            let width = this.text.getTextWidth() + 2*BoundsInfoBox.PADDING.x;
            let height = this.text.getTextHeight() + 2*BoundsInfoBox.PADDING.y - 1;
            this.setTexture(InfoBox.getTextureForSize(width, height));

            let ax = M.map(this.anchor.x, 0, 1, 1, -1);
            let ay = M.map(this.anchor.y, 0, 1, 1, -1);

            let extraMove = IS_MOBILE ? 20 : 0;
            
            this.x = mouseBounds.x + ax * width/2 + ax * extraMove;
            this.y = mouseBounds.y + ay * height/2 + ay * extraMove;

            this.floatTimer.update(this.delta);
        } else {
            this.setVisible(false);
            this.floatTimer.reset();
        }

        this.keepOnScreen();
    }

    postUpdate(): void {
        super.postUpdate();
        World.Actions.moveWorldObjectToFront(this);
        World.Actions.moveWorldObjectToFront(this.text);
    }

    private keepOnScreen() {
        let width = this.getTexture().width;
        let height = this.getTexture().height;
        this.x = M.clamp(this.x, width/2, global.gameWidth - width/2);
        this.y = M.clamp(this.y, height/2, global.gameHeight - height/2);
    }
}