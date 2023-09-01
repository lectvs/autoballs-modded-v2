namespace Rumper {
    export var CACHE: {
        balls: Dict<any>;
    } = {
        balls: {},
    };

    function getAllBallProperties() {
        let balls = Object.keys(TYPE_TO_BALL_TYPE_DEF).map(ballType => squadBallToWorldBall({
            x: 0, y: 0,
            properties: {
                type: parseInt(ballType),
                damage: 1,
                health: 1,
                level: 1,
                equipment: -1,
                metadata: {},
            }
        }, undefined, -1, 'friend'));

        let result: Dict<any> = {};
        for (let ball of balls) {
            let name = ball.constructor.name;
            let prototype = O.deepClone(Object.getPrototypeOf(ball));

            for (let key in prototype) {
                if (_.isFunction(prototype[key])) {
                    prototype[key] = prototype[key].toString();
                }
            }

            result[name] = prototype;
        }

        return result;
    }

    export function load() {
        CACHE.balls = getAllBallProperties();
    }

    export function check() {
        
    }
}