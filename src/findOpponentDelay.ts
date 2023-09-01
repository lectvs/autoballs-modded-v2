var FIND_OPPONENT_WAIT_TIME = 0;

function waitUntilFindOpponentDelayComplete(world: World) {
    return function*() {
        while (FIND_OPPONENT_WAIT_TIME > 0) {
            FIND_OPPONENT_WAIT_TIME -= world.delta;
            yield;
        }

        yield S.waitUntil(() => _.isEmpty(world.select.tag(Tags.DELAY_PLAY)));
    }
}