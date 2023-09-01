class BallHighlighter extends WorldObject {
    enabled: boolean = true;

    private mouseBounds = new CircleBounds(0, 0, 0);

    update() {
        super.update();

        let mousePos = this.world.getWorldMousePosition();
        this.mouseBounds.x = mousePos.x;
        this.mouseBounds.y = mousePos.y;
        this.mouseBounds.radius = Input.mouseRadius;

        let ballMover = this.world.select.type(BallMover, false);

        let movingThing = ballMover?.movingThing;
        if (movingThing) {
            movingThing.changeHighlight(true, 0xBBBB00, movingThing.defaultOutlineAlpha);
        }

        let balls = this.world.select.typeAll(Ball).filter(ball => ball !== movingThing);
        let ballItems = this.world.select.typeAll(BallItem).filter(item => item !== movingThing);

        let hoveredBall = this.getHoveredBall(balls, ballMover);
        for (let ball of balls) {
            if (ball === hoveredBall) {
                ball.changeHighlight(this.enabled || ball.isInShop, this.enabled ? 0xFFFF00 : ball.defaultOutline, ball.defaultOutlineAlpha);
                if (!ball.isInShop && GAME_MODE === 'mm') {  // Don't do this in VS mode because the fixed delta screws up ordering for some balls like Scrap Cannon
                    World.Actions.moveWorldObjectToFront(ball);
                }
                ball.orderBallComponents();
            } else if (ball !== movingThing) {
                ball.changeHighlight(ball.isInShop, ball.defaultOutline, ball.defaultOutlineAlpha);
            }
        }

        let hoveredItem = this.getHoveredItem(ballItems);

        for (let item of ballItems) {
            if (item === hoveredItem) {
                item.changeHighlight(true, 0xFFFF00, item.defaultOutlineAlpha);
            } else if (item !== movingThing) {
                item.changeHighlight(true, item.defaultOutline, item.defaultOutlineAlpha);
            }
        }
    }

    onRemove() {
        super.onRemove();
        let balls = this.world.select.typeAll(Ball);
        for (let ball of balls) {
            ball.changeHighlight(ball.isInShop, ball.defaultOutline, ball.defaultOutlineAlpha);
        }
    }

    getHoveredBall(balls: Ball[], ballMover: BallMover) {
        let movingThing = ballMover?.movingThing;
        if (movingThing) {
            return ballMover.getBallForApplication(movingThing);
        }

        let validBalls = balls.filter(ball => ball.bounds.isOverlapping(this.mouseBounds));
        return M.argmin(validBalls, ball => G.distance(ball, this.mouseBounds));
    }

    getHoveredItem(items: BallItem[]) {
        let validItems = items.filter(item => item.bounds.isOverlapping(this.mouseBounds));
        return M.argmin(validItems, ball => G.distance(ball, this.mouseBounds));
    }
}