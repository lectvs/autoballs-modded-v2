class PrepPanelInfoBox extends Sprite {
    static GOLD_BOUNDS = new RectBounds(169, 0, 36, 21);
    static WINS_BOUNDS = new RectBounds(205, 0, 45, 21);
    static HEALTH_BOUNDS = new RectBounds(250, 0, 29, 21);
    static ROUND_BOUNDS = new RectBounds(279, 0, 33, 21);

    static VS_GOLD_BOUNDS = new RectBounds(169, 0, 36, 21);
    static VS_ROUND_BOUNDS = new RectBounds(205, 0, 33, 21);

    static PADDING = vec2(8, 4);

    private text: SpriteText;
    private floatTimer: Timer;
    
    constructor() {
        super({
            layer: Battle.Layers.infobox,
            useGlobalTime: true,
        });

        this.text = this.addChild(new SpriteText({
            x: 1,
            anchor: Vector2.CENTER,
            justify: 'center',
            copyFromParent: ['layer'],
        }));

        this.floatTimer = new Timer(0, () => this.setVisible(true));
    }

    update() {
        super.update();

        let mouseBounds = this.world.getWorldMouseBounds();

        let desc: string = undefined;

        if (GAME_MODE === 'vs') {
            if (PrepPanelInfoBox.VS_GOLD_BOUNDS.containsPoint(mouseBounds)) {
                desc = `${GAME_DATA.gold} gold`;
            } else if (PrepPanelInfoBox.VS_ROUND_BOUNDS.containsPoint(mouseBounds)) {
                desc = `Round ${GAME_DATA.round}`;
            }
        } else {
            if (PrepPanelInfoBox.GOLD_BOUNDS.containsPoint(mouseBounds)) {
                desc = `${GAME_DATA.gold} gold`;
            } else if (PrepPanelInfoBox.WINS_BOUNDS.containsPoint(mouseBounds)) {
                let lap = GAME_DATA.lap === 1 ? '' : `Lap ${GAME_DATA.lap-1}, `;
                desc = `${lap}${GAME_DATA.wins}/${GET_MAX_WINS()} wins`;
            } else if (PrepPanelInfoBox.HEALTH_BOUNDS.containsPoint(mouseBounds)) {
                desc = `${GAME_DATA.health} losses\nto game over`;
            } else if (PrepPanelInfoBox.ROUND_BOUNDS.containsPoint(mouseBounds)) {
                desc = `Facing Round ${GAME_DATA.round}\nopponents`;
            }
        }

        if (desc) {
            this.text.setText(desc);

            let width = this.text.getTextWidth() + 2*PrepPanelInfoBox.PADDING.x;
            let height = this.text.getTextHeight() + 2*PrepPanelInfoBox.PADDING.y;
            this.setTexture(InfoBox.getTextureForSize(width, height));

            let extraMove = IS_MOBILE ? 20 : 0;
            
            this.x = mouseBounds.x - width/2 - extraMove;
            this.y = mouseBounds.y + height/2 + extraMove;

            this.floatTimer.update(this.delta);
        } else {
            this.setVisible(false);
            this.floatTimer.reset();
        }
    }
}