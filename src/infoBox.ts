class InfoBox extends Sprite {
    private nameText: SpriteText;
    private tierText: SpriteText;
    private descText: SpriteText;

    private floatTimer: Timer;

    private onlyOperateInBounds: Rect;
    
    enabled: boolean;
    disableWhenGameIsRunning: boolean;
    isTriggering: boolean;
    showCredits: boolean;

    constructor(onlyOperateInBounds?: Rect) {
        super({
            layer: Battle.Layers.infobox,
            visible: false,
            useGlobalTime: true,
        });

        this.nameText = this.addChild(new SpriteText({
            anchor: Vector2.TOP,
            justify: 'center',
            copyFromParent: ['layer'],
        }));

        this.tierText = this.addChild(new SpriteText({
            font: 'smallnumbers',
            anchor: Vector2.TOP,
            justify: 'center',
            copyFromParent: ['layer'],
        }));

        this.descText = this.addChild(new SpriteText({
            anchor: Vector2.TOP,
            justify: 'center',
            maxWidth: 150,
            copyFromParent: ['layer'],
        }));

        this.floatTimer = new Timer(0.25, () => this.setVisible(true));
        this.enabled = true;
        this.disableWhenGameIsRunning = false;
        this.onlyOperateInBounds = onlyOperateInBounds;
        this.isTriggering = false;
        this.showCredits = false;
    }

    update() {
        super.update();

        let lookAt = this.getLookAtThing();

        if (Input.justDown('lmb')) {
            this.setVisible(false);
            this.floatTimer.reset();
        }

        this.isTriggering = lookAt && this.isTriggeringInfoBox(lookAt);

        if (this.isTriggering) {
            this.updateInfoBoxData(lookAt);
            this.updatePosition();
            this.floatTimer.update(this.delta);
        } else if (this.isUntriggeringInfoBox()) {
            this.setVisible(false);
            this.floatTimer.reset();
        }
    }

    private updateInfoBoxData(lookAt: Ball | BallItem) {
        let name = lookAt.getName();
        let desc = lookAt.getDesc();
        let type = lookAt.getType().toUpperCase();
        let tier = lookAt.tier;

        let descPrefix = lookAt.getDescPrefix();
        if (descPrefix) {
            desc = `${descPrefix}\n\n${desc}`;
        }

        if (lookAt instanceof Ball && lookAt.equipment && !St.isBlank(lookAt.equipment.getDesc())) {
            desc += `\n-----------------\n${lookAt.equipment.getDesc()}`;
        }

        if (this.showCredits && !_.isEmpty(lookAt.getCredits())) {
            let formattedCredits = lookAt.getCredits().map(c => `[gold]${c}[/gold]`);
            desc += `\n-----------------\nConcept by: ${formattedCredits.join(', ')}`;
        }

        let tierDisplay = (tier === 4 ? 'III+' : 'I'.repeat(tier));
        this.nameText.setText(name);
        this.tierText.setText(`TIER ${tierDisplay} ${type}`);
        this.tierText.style.color = getColorForTier(tier);
        this.descText.setText(desc);

        let width = Math.max(this.nameText.getTextWidth() + 12, 160);
        let height = 39 + this.descText.getTextHeight();
        this.setTexture(InfoBox.getTextureForSize(width, height));
        this.nameText.localy = -height/2 + 6;
        this.tierText.localy = -height/2 + 21;
        this.descText.localy = -height/2 + 33;
    }

    private updatePosition() {
        this.x = this.world.getWorldMouseX();
        this.y = this.world.getWorldMouseY();

        let texture = this.getTexture();
        let extraMove = IS_MOBILE ? 20 : 0;

        if (this.x < global.gameWidth/2) this.x += texture.width/2 + extraMove;
        else this.x -= texture.width/2 + extraMove;

        if (this.y < global.gameHeight/2 + 16) this.y += texture.height/2 + extraMove;
        else this.y -= texture.height/2 + extraMove;

        if (texture.height <= global.gameHeight) {
            this.y = M.clamp(this.y, texture.height/2, global.gameHeight - texture.height/2);
        } else {
            this.y = texture.height/2;
        }
    }

    private isTriggeringInfoBox(lookAt: Ball | BallItem) {
        let ballMover = this.world.select.type(BallMover, false);

        let inBounds = !this.onlyOperateInBounds || G.overlapRectangles(this.onlyOperateInBounds, lookAt.getVisibleScreenBounds())
        let movingThing = ballMover?.movingThing;

        if (IS_MOBILE) {
            let hasMoved = lookAt === movingThing && ballMover?.hasMovedAwayFromStartPos();
            return this.isEnabled() && !hasMoved && inBounds;
        }

        return this.isEnabled() && !movingThing && inBounds;
    }

    private isUntriggeringInfoBox() {
        if (IS_MOBILE) {
            let ballMover = this.world.select.type(BallMover, false);
            let isMovingThing = ballMover && ballMover.movingThing && ballMover.hasMovedAwayFromStartPos();

            return !this.isEnabled() || isMovingThing;
        }

        return true;
    }

    private isEnabled() {
        let battleSpeedController = global.theater?.select?.type(BattleSpeedController);
        let gamePaused = battleSpeedController?.paused;
        let battleSpeedControllerEnabled = battleSpeedController?.enabled;
        return this.enabled && (!this.disableWhenGameIsRunning || !battleSpeedControllerEnabled || gamePaused);
    }

    private getLookAtThing() {
        let ballMover = this.world.select.type(BallMover, false);
        let movingThing = ballMover?.movingThing;
        if (movingThing) return movingThing;

        let balls = this.world.select.typeAll(Ball);
        let items = this.world.select.typeAll(BallItem);
        let ballHighlighter = this.world.select.type(BallHighlighter, false);
        let hoveredBall = ballHighlighter?.getHoveredBall(balls, ballMover);
        let hoveredItem = ballHighlighter?.getHoveredItem(items);
        return hoveredItem || hoveredBall;
    }
}

namespace InfoBox {
    const textureCache = new DualKeyPool((width: number, height: number) => {
        let texture = AssetCache.getTexture('infobox_9p');
        if (!texture) return undefined;
        return new AnchoredTexture(Texture.ninepatch(texture, rect(4, 4, 4, 4), width, height), 0.5, 0.5);
    },
    (width: number, height: number) => `${width},${height}`);

    export function getTextureForSize(width: number, height: number) {
        let texture = textureCache.borrow(width, height);
        textureCache.return(width, height, texture);
        return texture;
    }
}