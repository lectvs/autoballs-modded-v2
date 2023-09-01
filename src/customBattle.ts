namespace CustomBattle {
    export function STAGE(friendSquad: Squad, enemySquad: Squad, gameid: string, round: number) {
        let world = Arenas.BASE();
        Arenas.SET_FOR_ARENA(world, VS_GAME.arena);

        world.addWorldObject(new AbilitySystem());

        let friendHealth = GAME_MODE === 'vs' || GAME_MODE === 'spectate' ? VS_GAME.yourhealth : 0;
        let enemyHealth = GAME_MODE === 'vs' || GAME_MODE === 'spectate' ? VS_GAME.enemyhealth : 0;

        let leftName = world.addWorldObject(new SpriteText({
            x: 2, y: 0,
            layer: Battle.Layers.playernames,
            anchor: Vector2.TOP_LEFT,
            justify: 'left',
            effects: { outline: { color: 0x000000 }},
        }));

        let rightName = world.addWorldObject(new SpriteText({
            name: 'opponentname',
            x: world.width-2, y: 0,
            layer: Battle.Layers.playernames,
            anchor: Vector2.TOP_RIGHT,
            justify: 'right',
            effects: { outline: { color: 0x000000 }},
        }));

        seedAll(gameid, round, DAILY);

        if (friendSquad.name < enemySquad.name) {
            leftName.setText(formatName(friendSquad.name, friendHealth, 'friend'));
            rightName.setText(formatName(enemySquad.name, enemyHealth, 'enemy'));
            SWAP_DIRECTIONS = false;
            addSquad(world, friendSquad, 'friend', false);
            addSquad(world, enemySquad, 'enemy', true);
        } else {
            leftName.setText(formatName(enemySquad.name, enemyHealth, 'enemy'));
            rightName.setText(formatName(friendSquad.name, friendHealth, 'friend'));
            SWAP_DIRECTIONS = true;
            addSquad(world, enemySquad, 'enemy', false);
            addSquad(world, friendSquad, 'friend', true);
        }

        let balls = world.select.typeAll(Ball);
        for (let ball of balls) {
            ball.onTeamsSpawned();
        }

        world.addWorldObject(new BallHighlighter());
        world.addWorldObject(new InfoBox());

        setDataStartShop();
        setDataStartShopPostEffects();

        world.addWorldObject(new GameTimer());
        world.addWorldObject(new MusicChanger());
        if (GAME_MODE === 'mm') world.addWorldObject(new SaveValidator.Obj());

        world.addWorldObject(new BugChecker());

        global.game.allowPauseWithPauseKey = false;

        world.select.modules(Button).forEach(button => button.enabled = false);

        world.addWorldObject(newOptionsGear());

        global.game.stopMusic(1);

        let pauseChar = IS_MOBILE ? '[offset 5 -3]<touch_tap>[/]' : '<lmb>';
        let speedUpChar = IS_MOBILE ? '[offset 5 -3]<touch_hold>[/]' : '<rmb>';
        world.addWorldObject(new SpriteText({
            x: world.width/2, y: 232,
            text: `${pauseChar} Pause    ${speedUpChar} Speed Up`,
            anchor: Vector2.CENTER,
            effects: { outline: { color: 0x000000, alpha: 1 }},
            layer: Battle.Layers.ui,
        }));

        world.onTransitioned = function() {
            if (GAME_MODE === 'vs' || GAME_MODE == 'spectate') {
                Main.fixedDelta = VS_GAME.frameTime;
            }
            seedAll(gameid, round, DAILY);
            world.data.youArePlaying = GAME_MODE !== 'spectate';
            global.theater.select.type(BattleSpeedController).enabled = true;
            world.runScript(GameFragments.gameCountdownAndStartScript(world));
        }

        return world;
    }

    function addSquad(world: World, squad: Squad, team: Ball.Team, flippedSide: boolean) {
        for (let i = 0; i < squad.balls.length; i++) {
            let ball = world.addWorldObject(squadBallToWorldBall(squad.balls[i], squad, team === 'friend' ? i : -1, team, flippedSide));
            ball.showAllStats();
        }
    }

    function formatName(name: string, health: number, team: Ball.Team) {
        if (GAME_MODE === 'vs' || GAME_MODE === 'spectate') {
            let color = Ball.getTeamColor(team);
            return `[color ${color}]${name}[/]\n[r]<heart>[/r]${health}`;
        }
        return name;
    }

    function seedAll(gameid: string, round: number, daily: API.Daily) {
        let seed = getRandomSeed(gameid, daily);
        Random.seed(`custombattle_${seed}_${round}`);
        Ball.Random.seed(`custombattle_ball_${seed}_${round}`);
        debug('seeded', `custombattle_ball_${seed}_${round}`);
    }
}