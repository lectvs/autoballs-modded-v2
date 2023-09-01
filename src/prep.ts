namespace Stages {
    export function PREP() {
        return _PREP(false);
    }

    export function PREP_SKIP_PRE_SHOP_EFFECTS() {
        return _PREP(true);
    }

    function _PREP(skipPreShopEffects: boolean) {
        if (GAME_MODE === 'vs') {
            GAME_DATA.round = VS_GAME.round;
            GAME_DATA.health = VS_GAME.yourhealth;
            GAME_DATA.wins = 8 - VS_GAME.enemyhealth;
        }

        if (GAME_MODE === 'mm' && !skipPreShopEffects) {
            saveMatchmakingOrChallengeModeOrDailyGameData({
                gameData: GAME_DATA,
                state: 'startshop',
                lock: gameDataLock(),
            }, CHALLENGE_MODE_ENABLED, DAILY);
        }

        if (GAME_MODE === 'vs' && !skipPreShopEffects) {
            saveVersusModeGameData({
                gameData: GAME_DATA,
                state: 'startshop',
            });
        }

        Main.fixedDelta = undefined;
        SWAP_DIRECTIONS = false;

        let world = Arenas.BASE();

        Arenas.SET_FOR_ARENA(world, GAME_DATA.arena);

        let abilitySystem = world.addWorldObject(new AbilitySystem());

        let mmShopName = GAME_DATA.lap > 1 ? crownedName(GAME_DATA.squad.name) : GAME_DATA.squad.name;
        let mmShopNameX = GAME_DATA.lap > 1 ? 6 : 2;

        let shopNames = world.addWorldObject(new SpriteText({
            x: mmShopNameX, y: 0,
            text: mmShopName,
            layer: Battle.Layers.playernames,
            anchor: Vector2.TOP_LEFT,
            effects: { outline: { color: 0x000000 }},
        }));

        if (GAME_MODE === 'vs') {
            shopNames.setText(`[color ${Ball.getTeamColor('friend')}]${VS_GAME.yourname}[/]\n[color ${Ball.getTeamColor('enemy')}]${VS_GAME.enemyname}[/]`);

            let vsHearts = world.addWorldObject(new Sprite({
                x: 2 + shopNames.getTextWidth() + 4, y: 0,
                texture: 'vshearts',
                layer: Battle.Layers.playernames,
            }));

            let vsHealthText = world.addWorldObject(new SpriteText({
                x: vsHearts.x + 17, y: 0,
                text: `${VS_GAME.yourhealth}\n${VS_GAME.enemyhealth}`,
                layer: Battle.Layers.playernames,
                anchor: Vector2.TOP_LEFT,
                effects: { outline: { color: 0x000000 }},
            }));

            let yourCheckmark = world.addWorldObject(new Sprite({
                x: vsHealthText.x + vsHealthText.getTextWidth() + 10, y: 6,
                texture: 'checkmark',
                layer: Battle.Layers.playernames,
                tint: 0x4CFF00,
                effects: { outline: { color: 0x000000 }},
                visible: !!VS_GAME.yoursquad,
            }));
            let enemyCheckmark = world.addWorldObject(new Sprite({
                x: vsHealthText.x + vsHealthText.getTextWidth() + 10, y: 21,
                texture: 'checkmark',
                layer: Battle.Layers.playernames,
                tint: 0x4CFF00,
                effects: { outline: { color: 0x000000 }},
                visible: !!VS_GAME.enemysquad,
            }));
            world.addWorldObject(new VsStatusCheckmarker(yourCheckmark, enemyCheckmark));
        }

        world.addWorldObject(new SpriteText({
            name: 'opponentname',
            x: world.width-2, y: 0,
            layer: Battle.Layers.playernames,
            anchor: Vector2.TOP_RIGHT,
            effects: { outline: { color: 0x000000 }},
        }));

        world.addWorldObject(new PhysicsWorldObject({
            name: 'midwall',
            physicsGroup: Battle.PhysicsGroups.walls,
            bounds: new InvertedRectBounds(0, 0, global.gameWidth/2, global.gameHeight),
            immovable: true,
        }));

        if (GAME_MODE === 'mm' && GAME_DATA.arg2Trigger.strategy) {
            world.addWorldObject(new Sprite({
                name: 'strategy',
                x: 0, y: 0,
                texture: 'strategy',
                layer: Battle.Layers.ground,
                alpha: 0.8,
            }));
        }

        let sidePanel = world.addWorldObject(new WorldObject({ name: 'sidepanel' }));

        sidePanel.addChildren(lciDocumentToWorldObjects('preppanel'));

        let goldcoin = world.select.name('goldcoin');
        sidePanel.addChild(new DisplayedGold(goldcoin.x + 8, goldcoin.y + 1));

        let trophy = world.select.name('trophy');
        if (GAME_MODE === 'vs') {
            trophy.setVisible(false);
        } else {
            let winText = sidePanel.addChild(new SpriteText({
                x: trophy.x + 9, y: trophy.y + 1,
                text: `${GAME_DATA.wins}/${GET_MAX_WINS()}`,
                layer: Battle.Layers.ui,
                anchor: Vector2.CENTER_LEFT,
            }));
            if (GAME_DATA.lap > 1) {
                addVictoryLapCount(world, sidePanel);
                winText.style.color = 0xFFD800;
            }
        }

        let heart = world.select.name('heart');
        if (GAME_MODE === 'vs') {
            heart.setVisible(false);
        } else {
            sidePanel.addChild(new SpriteText({
                x: heart.x + 9, y: heart.y + 1,
                text: `${GAME_DATA.health}`,
                layer: Battle.Layers.ui,
                anchor: Vector2.CENTER_LEFT,
            }));
        }

        let round = world.select.name('round');
        if (GAME_MODE === 'vs') {
            round.setVisible(false);
        } else {
            sidePanel.addChild(new SpriteText({
                x: round.x + 9, y: round.y + 1,
                text: `${GAME_DATA.round}`,
                layer: Battle.Layers.ui,
                anchor: Vector2.CENTER_LEFT,
            }));
        }

        let round_vs = world.select.name('round_vs');
        if (GAME_MODE === 'vs') {
            sidePanel.addChild(new SpriteText({
                x: round_vs.x + 9, y: round_vs.y + 1,
                text: `${GAME_DATA.round}`,
                layer: Battle.Layers.ui,
                anchor: Vector2.CENTER_LEFT,
            }));
        } else {
            round_vs.setVisible(false);
        }

        let timelimit = world.select.name('timelimit');
        if (GAME_MODE === 'vs' && GET_TIME_LIMIT() > 0) {
            let timeLimitTimer = new Timer(GET_TIME_LIMIT() + 1, () => {
                if (WarningBox.isShowing(world)) {
                    WarningBox.hide(world);
                }
                GameFragments.playPrep(world);
            });
            sidePanel.addChild(new SpriteText({
                name: 'timelimittimer',
                x: timelimit.x + 9, y: timelimit.y + 1,
                text: secondsToFormattedTime(GET_TIME_LIMIT()),
                layer: Battle.Layers.ui,
                anchor: Vector2.CENTER_LEFT,
                timers: [timeLimitTimer],
                update: function() {
                    this.setText(secondsToFormattedTime(Math.max(GET_TIME_LIMIT() - timeLimitTimer.time, 0)));
                    if (GET_TIME_LIMIT() - timeLimitTimer.time < 29) {
                        this.style.color = Tween.Easing.OscillateSine(4)(timeLimitTimer.time) > 0.5 ? 0xFFFFFF : 0xFF8888;
                    }
                }
            }));
        } else {
            timelimit.setVisible(false);
        }

        if (GAME_MODE === 'vs') {
            world.addWorldObject(new PhysicsWorldObject({
                bounds: new RectBounds(169, 0, 36, 21),
                update: function() { this.data.infoBoxDescription = `${GAME_DATA.gold} gold`; }
            }));

            world.addWorldObject(new PhysicsWorldObject({
                bounds: new RectBounds(205, 0, 33, 21),
                update: function() { this.data.infoBoxDescription = `Round ${GAME_DATA.round}`; }
            }));
        } else {
            world.addWorldObject(new PhysicsWorldObject({
                bounds: new RectBounds(169, 0, 36, 21),
                update: function() { this.data.infoBoxDescription = `${GAME_DATA.gold} gold`; }
            }));

            world.addWorldObject(new PhysicsWorldObject({
                bounds: new RectBounds(205, 0, 45, 21),
                update: function() { let lap = GAME_DATA.lap === 1 ? '' : `Lap ${GAME_DATA.lap-1}, `; this.data.infoBoxDescription = `${lap}${GAME_DATA.wins}/${GET_MAX_WINS()} wins`; }
            }));

            world.addWorldObject(new PhysicsWorldObject({
                bounds: new RectBounds(250, 0, 29, 21),
                update: function() { this.data.infoBoxDescription = `${GAME_DATA.health} losses\nto game over`; }
            }));

            world.addWorldObject(new PhysicsWorldObject({
                bounds: new RectBounds(279, 0, 33, 21),
                update: function() { this.data.infoBoxDescription = `Facing Round ${GAME_DATA.round}\nopponents`; }
            }));
        }

        let versus = world.select.name('versus');
        if (GAME_MODE !== 'vs' || GET_TIME_LIMIT() > 0) {
            versus.setVisible(false);
        }

        let shopLevel = getShopTierForRound(GAME_DATA.round);
        let shopLevelDisplay = (shopLevel === 4 ? '3+' : `${shopLevel}`);
        let instructionsText = IS_MOBILE ? '[offset 5 -3]<touch_hold_t>[/] Info [offset 5 -3]<touch_tap_t>[/] [fb]Freeze[/fb]\\ '
                                        : '<lmb> [gold]Buy[/gold]  <rmb> [fb]Freeze[/fb]';
        let shopTierText = isTierCrown() ? '[gold]Shop Tier <crown>[/gold]'
                                        : `Shop Tier [color ${getColorForTier(shopLevel)}]${shopLevelDisplay}[/color] :)`;
        sidePanel.addChild(new SpriteText({
            x: 242, y: IS_MOBILE ? 36 : 34,
            text: shopLevel === 1 ? instructionsText : shopTierText,
            layer: Battle.Layers.ui,
            anchor: Vector2.CENTER,
            justify: 'center',
        }));

        let restockCostBase = 1 + getModifierRestockCostDiff();

        world.select.name<Sprite>('restockbutton').addChild(new SpriteText({
            x: -19, y: -19,
            font: 'smallnumbers',
            layer: Battle.Layers.ui,
            update: function() {
                if (GAME_DATA.freeRestocksUntilPlay > 0) {
                    this.setText(`[g]${GAME_DATA.freeRestocksUntilPlay}[/g]`);
                } else {
                    this.setText(`[gold]<coin>${restockCostBase}[/gold]`);
                }
            }
        }));

        world.select.name<Sprite>('restockbutton').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onClick: () => {
                world.playSound('click');
                let costOfRestock = GAME_DATA.freeRestocksUntilPlay > 0 ? 0 : restockCostBase;
                if (GAME_DATA.gold < costOfRestock) return;
                GAME_DATA.gold -= costOfRestock;
                GAME_DATA.freeRestocksUntilPlay = Math.max(GAME_DATA.freeRestocksUntilPlay-1, 0);
                if (GAME_DATA.argTrigger.zombie) {
                    GAME_DATA.argTrigger.restocks++;
                    if (GAME_DATA.argTrigger.restocks === 5) {
                        global.theater.runScript(glitchSmall(world));
                    }
                }
                GAME_DATA.hasRestocked = true;
                Shop.restockNormal(world);

                let playerBalls = world.select.typeAll(Ball).filter(ball => !ball.isInShop);
                for (let ball of playerBalls) {
                    ball.queueAbilities('onRestock');
                }
            },
        }));

        let playbutton = world.select.name('playbutton');

        if (GAME_MODE === 'vs') {
            world.select.name('playbutton').setVisible(false);
            playbutton = world.select.name('playbutton_vs');
        } else {
            world.select.name('playbutton_vs').setVisible(false);
        }

        playbutton.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            canHover: () => !world.select.modules(Button).some(button => button.enabled && button.worldObject.hasTag(Tags.MODIFIER_ICON) && button.isOverlappingMouse()),
            onClick: () => {
                let ballHighlighter = world.select.type(BallHighlighter);
                let ballMover = world.select.type(BallMover);
                let balls = world.select.typeAll(Ball);
                let items = world.select.typeAll(BallItem);
                if (ballHighlighter.getHoveredBall(balls, ballMover) || ballHighlighter.getHoveredItem(items) || ballMover.movingThing) {
                    return;
                }
                
                if (GAME_DATA.squad.balls.length === 0) {
                    world.playSound('click');
                    WarningBox.show(world, 'noballs', () => {
                        GameFragments.playPrep(world);
                    });
                } else if (GAME_DATA.gold > 0) {
                    world.playSound('click');
                    WarningBox.show(world, 'gold', () => {
                        GameFragments.playPrep(world);
                    });
                } else {
                    GameFragments.playPrep(world);
                }
            },
        }));

        for (let i = 0; i < GAME_DATA.modifiers.length; i++) {
            let icon = sidePanel.addChild(getModifierIcon(playbutton.x + M.equidistantLine(0, 20, GAME_DATA.modifiers.length, i), playbutton.y + 21, GAME_DATA.modifiers[i]));
            icon.layer = Battle.Layers.ui;
        }

        world.addWorldObject(newOptionsGear());

        world.addWorldObject(new BoundsInfoBox(Vector2.TOP_RIGHT, 0));

        for (let i = 0; i < GAME_DATA.squad.balls.length; i++) {
            let ball = world.addWorldObject(squadBallToWorldBall(GAME_DATA.squad.balls[i], GAME_DATA.squad, i, 'friend'));
            ball.showAllStats();
        }

        if (!skipPreShopEffects) {
            setDataStartShop();
        }

        if (GAME_DATA.restocksThisRound === 0) {
            Shop.stockInitial(world);
        } else {
            Shop.stockRestock(world, true);
        }

        world.addWorldObject(new BallHighlighter());
        world.addWorldObject(new BallMover());
        world.addWorldObject(new BallFreezer());
        world.addWorldObject(new InfoBox());

        if (!skipPreShopEffects) {
            let seed = getRandomSeed(GAME_DATA.gameId, DAILY);
            Random.seed(`startshop_${seed}_${GAME_DATA.round}`);
            Ball.Random.seed(`startshop_${seed}_${GAME_DATA.round}`);

            // Start Shop abilities
            abilitySystem.reset();

            let playerBalls = world.select.typeAll(Ball).filter(ball => ball.team === 'friend' && !ball.isInShop);
            for (let ball of playerBalls) {
                ball.queueAbilities('onStartShop');
            }
            
            abilitySystem.activateAbilities();

            let shopItems = world.select.typeAll(BallItem);
            for (let item of shopItems) {
                item.onStartShopBeforeStartShopEffects();
            }

            GAME_DATA.bankedGold = GAME_DATA.bankedGold.filter(banked => {
                if (banked.roundsLeft > 0) {
                    addStartShopEffect({
                        type: 'gold',
                        sourceSquadIndex: banked.squadIndex,
                        gold: banked.goldPerRound,
                    });
                }

                banked.roundsLeft--;
                return banked.roundsLeft > 0;
            });

            applyStartShopEffects(GAME_DATA.startShopEffects, world);

            if (USELESS_CROWN_REPLACEMENT) {
                world.runScript(function*() {
                    yield;
                    updateAchievementProgress('Useless', p => p+1);
                });
                USELESS_CROWN_REPLACEMENT = false;
            }

            setDataStartShopPostEffects();
        }

        world.addWorldObject(new GameTimer());
        world.addWorldObject(new MusicChanger());
        if (GAME_MODE === 'mm') world.addWorldObject(new SaveValidator.Obj());

        world.addWorldObject(new BugChecker());

        world.onTransitioned = function() {
            global.game.playMusic(pickMusicForThisRoundShop(GAME_DATA), 0.1);
            global.game.allowPauseWithPauseKey = true;

            world.data.youArePlaying = true;

            if (GAME_DATA.round >= 12) {
                updateAchievementProgress('ReachRoundTwelve', p => Math.max(p, GAME_DATA.round));
            }

            if (GAME_DATA.round === 5 && GAME_DATA.squad.balls.some(ball => ball.properties.type ===  41)) {
                global.theater.runScript(glitchSmall(world));
            }
        }

        return world;
    }

    function addVictoryLapCount(world: World, sidePanel: WorldObject) {
        let lap = `${GAME_DATA.lap-1}`;
        let trophy = world.select.name('trophy');
        sidePanel.addChild(new Sprite({
            x: trophy.x, y: trophy.y,
            texture: new AnchoredTexture(Texture.filledRect(1 + 4*lap.length, 7, 0x000000), 0.5, 0.5),
            layer: Battle.Layers.ui,
        }));
        sidePanel.addChild(new SpriteText({
            x: trophy.x+1, y: trophy.y+1,
            text: lap,
            font: 'smallnumbers',
            layer: Battle.Layers.ui,
            anchor: Vector2.CENTER,
            style: { color: 0xFFD800 }
        }));
    }
}