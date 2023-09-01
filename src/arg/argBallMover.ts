class ArgBallMover extends WorldObject {
    private movingThing: ArgBall;
    private movingThingD: Vector2;
    private movingThingStartPos: Vector2;

    update(): void {
        super.update();

        let mouseBounds = this.world.getWorldMouseBounds();
        let balls = this.world.select.typeAll(ArgBall);

        if (Input.justDown('click') && !this.movingThing) {
            let intersectingBalls = balls.filter(ball => ball.bounds.containsPoint(mouseBounds));
            if (intersectingBalls.length > 0) {
                this.movingThing = intersectingBalls[0];
                this.movingThingD = this.movingThing.getPosition().subtract(mouseBounds);
                this.movingThingStartPos = this.movingThing.getPosition();
                this.movingThing.colliding = false;
                World.Actions.moveWorldObjectToFront(this.movingThing);
                this.world.playSound('arg/sabpickup');
            }
        }

        if (Input.justUp('click') && this.movingThing) {
            let ballsInSquad = balls.filter(ball => !ball.isInShop);
            let ballForLevelUp = balls.find(ball => ball !== this.movingThing && ball.level === this.movingThing.level && ball.bounds.containsPoint(mouseBounds));
            
            if (ballForLevelUp) {
                ballForLevelUp.levelUp();
                this.movingThing.kill();
            } else if (this.movingThing.x > 80 || (this.movingThing.isInShop && ballsInSquad.length >= 5)) {
                this.movingThing.teleport(this.movingThingStartPos);
            } else  {
                this.movingThing.isInShop = false;
                this.movingThing.colliding = true;
            }
            
            this.movingThing = undefined;
            this.movingThingD = undefined;
            this.movingThingStartPos = undefined;
            this.world.playSound('arg/sabputdown');
        }

        if (this.movingThing) {
            this.movingThing.teleport(mouseBounds.x + this.movingThingD.x, mouseBounds.y + this.movingThingD.y);
        }
    }
}