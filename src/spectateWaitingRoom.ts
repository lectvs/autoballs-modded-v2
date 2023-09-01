namespace SpectateWaitingRoom {
    export function STAGE() {
        let world = Arenas.BASE();
        Arenas.SET_FOR_ARENA(world, VS_GAME.arena);

        let friendSquad: Squad = VS_GAME.yourlastsquad ?? { name: VS_GAME.yourname, balls: [] };
        let enemySquad: Squad = VS_GAME.enemylastsquad ?? { name: VS_GAME.enemyname, balls: [] };
        let friendHealth = VS_GAME.yourhealth;
        let enemyHealth = VS_GAME.enemyhealth;

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

        world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 8,
            text: `Round ${VS_GAME.round}`,
            layer: Battle.Layers.fg,
            anchor: Vector2.CENTER,
            justify: 'center',
            effects: { outline: { color: 0x000000 }},
        }));

        let statusText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 232,
            text: "Players are shopping...",
            layer: Battle.Layers.fg,
            anchor: Vector2.CENTER,
            justify: 'center',
            effects: { outline: { color: 0x000000 }},
            data: { highlight: 0xFFFFCC },
            update: function() {
                this.style.color = Color.lerpColorByRgb(0xFFFFFF, this.data.highlight, Tween.Easing.OscillateSine(1)(this.life.time));
            }
        }));

        let errorText = world.addWorldObject(new SpriteText({
            x: global.gameWidth/2, y: 178,
            text: "",
            layer: Battle.Layers.fg,
            anchor: Vector2.CENTER,
            justify: 'center',
            effects: { outline: { color: 0x000000 }},
        }));

        let gear = world.addWorldObject(new Sprite({
            name: 'gear',
            x: 11, y: global.gameHeight-11,
            texture: 'gear',
            layer: Battle.Layers.ui,
            bounds: new CircleBounds(0, 0, 11),
        }));
        gear.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onClick: () => {
                gear.tint = 0xFFFFFF;
                global.game.playSound('click');
                global.game.pauseGame();
            },
        }));

        seedAll(GAME_DATA.gameId, VS_GAME.round-1);

        let leftCheckmark = world.addWorldObject(new Sprite({
            y: 6,
            texture: 'checkmark',
            layer: Battle.Layers.playernames,
            tint: 0x4CFF00,
            effects: { outline: { color: 0x000000 }},
            visible: false,
        }));
        let rightCheckmark = world.addWorldObject(new Sprite({
            y: 6,
            texture: 'checkmark',
            layer: Battle.Layers.playernames,
            tint: 0x4CFF00,
            effects: { outline: { color: 0x000000 }},
            visible: false,
        }));

        let yourCheckmark: Sprite, enemyCheckmark: Sprite;

        if (friendSquad.name < enemySquad.name) {
            leftName.setText(formatName(friendSquad.name, friendHealth, 'friend'));
            rightName.setText(formatName(enemySquad.name, enemyHealth, 'enemy'));
            SWAP_DIRECTIONS = false;
            addSquad(world, friendSquad, 'friend', false);
            addSquad(world, enemySquad, 'enemy', true);
            yourCheckmark = leftCheckmark;
            enemyCheckmark = rightCheckmark;
        } else {
            leftName.setText(formatName(enemySquad.name, enemyHealth, 'enemy'));
            rightName.setText(formatName(friendSquad.name, friendHealth, 'friend'));
            SWAP_DIRECTIONS = true;
            addSquad(world, enemySquad, 'enemy', false);
            addSquad(world, friendSquad, 'friend', true);
            yourCheckmark = rightCheckmark;
            enemyCheckmark = leftCheckmark;
        }

        leftCheckmark.x = leftName.x + leftName.getTextWidth() + 9;
        rightCheckmark.x = rightName.x - rightName.getTextWidth() - 8;
        yourCheckmark.setVisible(!!VS_GAME.yoursquad);
        enemyCheckmark.setVisible(!!VS_GAME.enemysquad);

        world.addWorldObject(new BallHighlighter());
        world.addWorldObject(new InfoBox());

        setDataStartShop();
        setDataStartShopPostEffects();
        world.data.youArePlaying = false;

        world.addWorldObject(new AbilitySystem());

        global.game.playMusic(pickMusicForThisRoundShop(GAME_DATA), 0.1);

        world.addWorldObject(new GameTimer());
        world.addWorldObject(new MusicChanger());

        world.onTransitioned = function() {
            Main.fixedDelta = undefined;
        }

        world.runScript(function*() {
            yield S.wait(2);
            let result: { game?: API.VSGame } = {};
            yield GameFragments.waitForVSGameCondition(GAME_DATA.gameId, loadName(), true, game => {
                yourCheckmark.setVisible(!!game.yoursquad);
                enemyCheckmark.setVisible(!!game.enemysquad);
                return (game.yoursquad && game.enemysquad) || game.round > VS_GAME.round;
            }, result, err => errorText.setText(err ? 'An error occurred' : ''));

            if (result.game.round > VS_GAME.round) {
                statusText.setText('Missed the last round!');
                statusText.data.highlight = 0xFF8888;
            } else {
                statusText.setText('Battle is starting...');
                statusText.data.highlight = 0xFF8888;

                if (result.game.startTime && result.game.startTime >= Date.now() && result.game.startTime <= Date.now() + 6000) {
                    yield S.waitUntil(() => Date.now() >= result.game.startTime);
                }
    
                global.game.stopMusic(1);
            }

            yield S.wait(3);

            GameFragments.startVsGame(GAME_DATA.gameId, result.game, false, true);
        });

        return world;
    }

    function addSquad(world: World, squad: Squad, team: Ball.Team, flippedSide: boolean) {
        for (let i = 0; i < squad.balls.length; i++) {
            let ball = world.addWorldObject(squadBallToWorldBall(squad.balls[i], squad, team === 'friend' ? i : -1, team, flippedSide));
            ball.showAllStats();
        }
    }

    function formatName(name: string, health: number, team: Ball.Team) {
        let color = Ball.getTeamColor(team);
        return `[color ${color}]${name}[/]\n[r]<heart>[/r]${health}`;
    }

    function seedAll(gameid: string, round: number) {
        Random.seed(`custombattle_${gameid}_${round}`);
        Ball.Random.seed(`custombattle_ball_${gameid}_${round}`);
        debug('seeded', `custombattle_ball_${gameid}_${round}`)
    }
}