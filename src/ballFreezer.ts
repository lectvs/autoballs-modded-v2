class BallFreezer extends WorldObject {
    private currentMovingThing: Ball | BallItem;
    private movingTime: number = 0;

    update() {
        super.update();

        if (IS_MOBILE) {
            this.updateFreezeMobile();
        } else {
            this.updateFreezePc();
        }
    }

    private updateFreezePc() {
        if (Input.justDown('rightclick')) {
            let mousePos = this.world.getWorldMousePosition();
            let balls = this.world.select.typeAll(Ball);
            let ballItems = this.world.select.typeAll(BallItem);
            let hoveredBall: Ball | BallItem = balls.find(ball => ball.bounds.containsPoint(mousePos));
            if (!hoveredBall) hoveredBall = ballItems.find(item => item.bounds.containsPoint(mousePos));

            if (this.canFreezeOrUnfreezeThing(hoveredBall)) {
                this.freezeOrUnfreezeThing(hoveredBall);
            }
        }
    }

    private updateFreezeMobile() {
        let ballMover = this.world.select.type(BallMover);
        if (!ballMover) {
            this.currentMovingThing = undefined;
            return;
        }

        let nextMovingThing = ballMover.movingThing;
        if (nextMovingThing === this.currentMovingThing) {
            this.movingTime += this.delta;
            return;
        }

        if (this.currentMovingThing === undefined || nextMovingThing !== undefined) {
            this.currentMovingThing = nextMovingThing;
            this.movingTime = 0;
            return;
        }

        if (this.movingTime < 0.25 && ballMover.lastMovedMovedDistance < 10 && this.currentMovingThing.world && this.currentMovingThing.isInShop && !this.currentMovingThing.hasTag(Tags.PURCHASED_THIS_SHOP_PHASE)) {
            if (this.canFreezeOrUnfreezeThing(this.currentMovingThing)) {
                this.freezeOrUnfreezeThing(this.currentMovingThing);
            }
        }

        this.currentMovingThing = undefined;
    }

    private canFreezeOrUnfreezeThing(thing: Ball | BallItem) {
        return thing && (thing instanceof BallItem || thing.isInShop);
    }

    private freezeOrUnfreezeThing(thing: Ball | BallItem) {
        if (thing.frozen) {
            this.world.playSound('unfreeze');
            thing.unfreeze();
        } else if (thing.canFreeze) {
            this.world.playSound('freeze');
            thing.freeze(false);
            GAME_DATA.hasFrozen = true;
        } else {
            this.world.playSound('error', { humanized: false });
            this.world.addWorldObject(new BallMoverError(thing.x, thing.y, 'CANNOT\nFREEZE'));
        }
    }
}