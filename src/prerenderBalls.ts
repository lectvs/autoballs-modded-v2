namespace PrerenderBalls {
    export function render() {
        for (let ballType in TYPE_TO_BALL_TYPE_DEF) {
            let ball = squadBallToWorldBall({
                x: 0, y: 0,
                properties: {
                    type: parseInt(ballType),
                    damage: 1,
                    health: 1,
                    level: 1,
                    equipment: -1,
                    metadata: {},
                }
            }, undefined, -1, 'friend');
            
            ball.render(Texture.NOOP, 0, 0);
            for (let child of ball.children) {
                child.render(Texture.NOOP, 0, 0);
            }
        }
    } 
}