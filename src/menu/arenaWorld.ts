var _MENUS_ARENA_WORLD: World;

function setArenaWorld(arena: string) {
    if (!_MENUS_ARENA_WORLD) {
        _MENUS_ARENA_WORLD = createArenaWorld();
    }

    Arenas.SET_FOR_ARENA(_MENUS_ARENA_WORLD, arena);
}

function createArenaWorld() {
    let arenaWorld = Arenas.BASE();

    arenaWorld.volume = 0.3;

    arenaWorld.addWorldObject(new AbilitySystem());

    arenaWorld.data.battleState = Ball.States.BATTLE;
    arenaWorld.data.packs = [Random.element(['classic', 'community'])];
    arenaWorld.data.summon = () => {
        for (let i = 0; i < 5; i++) {
            for (let team of <Ball.Team[]>['enemy', 'friend']) {
                if (arenaWorld.select.typeAll(Ball).filter(ball => ball.team === team).length >= 5) continue;
                let p = vec2(Random.int(48, global.gameWidth-48), Random.int(48, global.gameHeight-48));
                let squadBall: SquadBall;
                do {
                    squadBall = randomSquadBall(p.x, p.y, 10, arenaWorld.data.packs, undefined);
                } while (squadBall.properties.type === 113); // No Watchers
                let ball = arenaWorld.addWorldObject(squadBallToWorldBall(squadBall, undefined, -1, team));
                ball.setState(Ball.States.BATTLE);
                ball.v = Random.onCircle(150);
            }
        }
    }

    arenaWorld.runScript(function*() {
        while (true) {
            arenaWorld.data.summon();
            yield S.wait(1);
        }
    });

    return arenaWorld;
}

function setArenaWorldForPacks(packs: Pack[]) {
    _MENUS_ARENA_WORLD.select.typeAll(Ball).forEach(ball => ball.kill());
    _MENUS_ARENA_WORLD.data.packs = packs;
    _MENUS_ARENA_WORLD.runScript(function*() {
        yield;
        _MENUS_ARENA_WORLD.data.summon();
    });
}