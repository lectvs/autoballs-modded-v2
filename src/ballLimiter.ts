class BallLimiter extends WorldObject {
    private readonly BALL_LIMIT_PER_TEAM = 25;

    postUpdate(): void {
        super.postUpdate();
        let balls = this.world.select.typeAll(Ball);

        let ballsPerTeam = { 'friend': 0, 'enemy': 0 };

        for (let ball of balls) {
            if (ballsPerTeam[ball.team] > this.BALL_LIMIT_PER_TEAM) {
                this.world.addWorldObject(newPuff(ball.x, ball.y, Battle.Layers.fx, 'medium'));
                ball.kill();
            }
            ballsPerTeam[ball.team]++;
        }
    }
}