class BallMover extends WorldObject {
    private static SELL_BOUNDS = rect(175, 186, 42, 42);

    movingThing: Ball | BallItem;
    movedDistance = 0;
    lastMovedMovedDistance = 0;
    hasMovedFast = false;
    private mouseStartPos = vec2(0, 0);
    private movingThingStartPos = vec2(0, 0);

    private dragOffset: Vector2 = vec2(0, 0);

    private hoverText: SpriteText;

    constructor() {
        super();

        this.hoverText = this.addChild(new SpriteText({
            text: `REPLACE`,
            font: 'smallnumbers',
            anchor: Vector2.CENTER,
            effects: { outline: { color: 0x000000 }},
            layer: Battle.Layers.drag,
            visible: false,
        }));
    }

    update() {
        super.update();

        let mouseBounds = this.world.getWorldMouseBounds();

        if (Input.justDown('click') && !this.isClicked()) {
            let balls = this.world.select.typeAll(Ball);
            let ballItems = this.world.select.typeAll(BallItem);
            let hoveredBall: Ball | BallItem = M.argmin(balls.filter(ball => ball.bounds.isOverlapping(mouseBounds)), ball => G.distance(ball, mouseBounds));
            if (!hoveredBall) hoveredBall = M.argmin(ballItems.filter(item => item.bounds.isOverlapping(mouseBounds)), item => G.distance(item, mouseBounds));

            if (hoveredBall) {
                this.world.playSound('pickupball');
                this.movingThing = hoveredBall;
                this.movingThing.colliding = false;
                this.movingThing.layer = Battle.Layers.drag;
                this.movingThingStartPos.set(this.movingThing);
                this.mouseStartPos.set(mouseBounds);
                this.dragOffset.set(mouseBounds.x - this.movingThing.x, mouseBounds.y - this.movingThing.y);
                this.movedDistance = 0;
                this.lastMovedMovedDistance = 0;
                this.hasMovedFast = false;

                this.movingThing.onPickUp();
            }
        }

        if (Input.isUp('click') && this.isClicked()) {
            this.unclick();
        }

        if (this.movingThing) {
            if (IS_MOBILE) {
                this.movedDistance = Math.max(this.movedDistance, G.distance(mouseBounds, this.mouseStartPos));
                if (this.movingThing.isInShop && this.movingThing.x < 180) {
                    this.movedDistance = Infinity;
                }
                if (this.hasMovedAwayFromStartPos()) {
                    this.movingThing.x = mouseBounds.x - this.dragOffset.x;
                    this.movingThing.y = mouseBounds.y - this.dragOffset.y;
                    if (getBigDragging()) {
                        let radius = this.movingThing instanceof Ball ? this.movingThing.physicalRadius : 8;
                        this.movingThing.setMoveScale(radius === 0 ? 2 : 16/radius);
                        this.movingThing.alpha = 0.5;
                    }
                }
                if (!this.hasMovedFast && this.world.getWorldMouseSpeed() > 800) {
                    this.hasMovedFast = true;
                }
            } else {
                this.movingThing.x = mouseBounds.x - this.dragOffset.x;
                this.movingThing.y = mouseBounds.y - this.dragOffset.y;
            }
            this.lastMovedMovedDistance = this.movedDistance;
        }

        if (this.isAboutToSellBall() && this.movingThing instanceof Ball) {
            this.hoverText.x = this.movingThing.x;
            this.hoverText.y = this.movingThing.y - (IS_MOBILE ? 24 : 12);
            this.hoverText.setText(`SELL <coin>${this.movingThing.getSellValue()}`);
            this.hoverText.style.color = Color.lerpColorByLch(0xFFD800, 0xFFFFFF, Tween.Easing.OscillateSine(2)(this.life.time));
            this.hoverText.setVisible(true);
            World.Actions.orderWorldObjectAfter(this.hoverText, this.movingThing.stars);
        } else if (this.isAboutToReplaceItem()) {
            this.hoverText.x = this.movingThing.x;
            this.hoverText.y = this.movingThing.y - (IS_MOBILE ? 24 : 12);
            this.hoverText.setText(`REPLACE`);
            this.hoverText.style.color = Color.lerpColorByLch(0xFF0000, 0xFFFFFF, Tween.Easing.OscillateSine(2)(this.life.time));
            this.hoverText.setVisible(true);
            World.Actions.orderWorldObjectAfter(this.hoverText, this.movingThing);
        } else {
            this.hoverText.setVisible(false);
        }
    }

    unclick() {
        if (!this.isClicked()) return;

        this.world.playSound('putdownball');
        this.movingThing.colliding = true;
        this.movingThing.layer = Battle.Layers.balls;
        this.movingThing.changeHighlight(false);
        this.movingThing.setMoveScale(1);
        this.movingThing.alpha = 1;

        if (this.movingThing instanceof BallItem) {
            let targetBall = this.getValidItemBall(this.movingThing);
            let itemMoveError = this.getItemMoveError(this.movingThing, targetBall);
            if (itemMoveError !== null) {
                if (!St.isBlank(itemMoveError)) {
                    this.world.playSound('error', { humanized: false });
                    this.world.addWorldObject(new BallMoverError(this.movingThing.x, this.movingThing.y, itemMoveError));
                }
                this.movingThing.teleport(this.movingThingStartPos);
                this.movingThing.colliding = false;
                this.movingThing.layer = Battle.Layers.ui;
            } else {
                ShopActions.buyBallItem(this.movingThing, targetBall);
            }
        } else {
            let ballMoveError = this.getBallMoveError(this.movingThing);
            if (ballMoveError !== null) {
                if (!St.isBlank(ballMoveError)) {
                    this.world.playSound('error', { humanized: false });
                    this.world.addWorldObject(new BallMoverError(this.movingThing.x, this.movingThing.y, ballMoveError));
                }
                this.movingThing.teleport(this.movingThingStartPos);
                if (this.movingThing.isInShop) {
                    this.movingThing.colliding = false;
                    this.movingThing.layer = Battle.Layers.ui;
                }
            } else if (this.isAboutToSellBall()) {
                this.movingThing.colliding = false;
                ShopActions.sellBall(this.movingThing);
            } else {
                let levelUpBall = this.getClosestBallForLevelUp(this.movingThing);

                if (this.movingThing.isInShop) {
                    ShopActions.buyBall(this.movingThing);
                    if (!levelUpBall) this.movingThing.joinTeam();
                }

                if (levelUpBall) {
                    ShopActions.levelUpBall(levelUpBall, this.movingThing);
                    this.movingThing.colliding = false;
                }
            }
        }

        this.movingThing.onPutDown();
        this.movingThing = undefined;
        this.movedDistance = 0;
        this.hasMovedFast = false;
    }

    onRemove() {
        super.onRemove();
        this.unclick();
    }

    getBallForApplication(movingThing: Ball | BallItem) {
        if (!movingThing) return undefined;
        if (movingThing instanceof Ball) return this.getClosestBallForLevelUp(movingThing);
        return this.getValidItemBall(movingThing);
    }

    hasMovedAwayFromStartPos() {
        return this.movedDistance > 4;
    }

    private isClicked() {
        return !!this.movingThing;
    }

    private getBallMoveError(movingBall: Ball) {
        if (G.rectContainsPt(BallMover.SELL_BOUNDS, movingBall)) {
            if (movingBall.isInShop || movingBall.isBeingDisintegrated) return "";
            else return null;
        }
        if (movingBall.x + movingBall.radius > this.world.width/2) return "";

        let levelUpBall = this.getClosestBallForLevelUp(movingBall);

        if (levelUpBall) {
            if (levelUpBall.properties.type !== movingBall.properties.type) return "WRONG\nTYPE";
            if (levelUpBall.level !== movingBall.level) return "WRONG\nLEVEL";
        }
        
        if (movingBall.isInShop) {
            if (GAME_DATA.gold < movingBall.getShopCost()) return "BROKE";
            if (levelUpBall) return null;
            if (GAME_DATA.squad.balls.length >= GET_MAX_SQUAD_SIZE()) return "FULL";
        }

        if (!movingBall.isPurchasable()) return "";

        return null;
    }

    private getItemMoveError(movingItem: BallItem, targetBall: Ball) {
        if (!targetBall) return "";
        if (GAME_DATA.gold < movingItem.getShopCost()) return "BROKE";
        if (!movingItem.canApplyToBall(targetBall)) return "CANNOT APPLY";
        if (!movingItem.isPurchasable()) return "";
        return null;
    }

    private getClosestBallForLevelUp(withBall: Ball) {
        let balls = this.world.select.typeAll(Ball)
                    .filter(ball => ball !== withBall
                                 && ball.squadIndexReference >= 0
                                 && ball.team === 'friend'
                                 && !ball.isBeingDisintegrated
                                 && ball.applyBounds.containsPoint(withBall)
                    );
        return M.argmin(balls, ball => G.distance(ball, withBall));
    }

    private getValidItemBall(withItem: BallItem) {
        let balls = this.world.select.typeAll(Ball)
                    .filter(ball => ball.team === 'friend'
                                 && !ball.isBeingDisintegrated
                                 && ball.applyBounds.containsPoint(withItem)
                    );
        return M.argmin(balls, ball => G.distance(ball, withItem));
    }

    private isAboutToReplaceItem() {
        if (!this.movingThing) return false;
        if (!(this.movingThing instanceof BallItem)) return false;

        let targetBall = this.getValidItemBall(this.movingThing);
        return targetBall && this.movingThing.isAboutToReplace(targetBall);
    }

    private isAboutToSellBall() {
        if (!this.movingThing) return false;
        if (!(this.movingThing instanceof Ball)) return false;

        return !this.movingThing.isInShop && G.rectContainsPt(BallMover.SELL_BOUNDS, this.movingThing);
    }
}