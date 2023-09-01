namespace VSModeSettings {
    export type Settings = {
        startHealth: number;
        startRound: number;
        startGameGold: number;
        startRoundGold: number;
        maxSquadSize: number;
        timeLimit: number;
        speedCap: boolean;
        arena: string;
        hostPack: string;
        nonhostPack: string;
    }

    export function GET_DEFAULT_SETTINGS(): Settings {
        return {
            startHealth: 5,
            startRound: 1,
            startGameGold: 10,
            startRoundGold: 10,
            maxSquadSize: 5,
            timeLimit: -1,
            speedCap: true,
            arena: Arenas.ARENA_FIRST,
            hostPack: 'classic',
            nonhostPack: 'classic',
        };
    }



    export function STAGE() {
        let world = new World({
            backgroundColor: 0x000000,
            volume: 0,
            allowPause: false,
        });

        let settings = loadVsSettings();

        setArenaWorld(settings.arena);
        world.addWorldObject(new Theater.WorldAsWorldObject(_MENUS_ARENA_WORLD));
        
        world.addWorldObjects(lciDocumentToWorldObjects('vssettingsmenu'));

        world.select.name<Sprite>('gamesettings').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time-1) * 2;
        };

        let settingsY = 42;
        let padding = 40;

        world.addWorldObject(new SpriteText({
            x: padding, y: settingsY,
            text: "Start With Health\nStart At Round\nStart Game With Gold\nStart Round With Gold\nMax Squad Size\nShop Phase Time Limit\nSpeed Cap\nArena\nHost Pack\nNon-host Pack",
            anchor: Vector2.TOP_LEFT,
            justify: 'left',
            effects: { outline: { color: 0x000000 }, post: { filters: [new DropShadowFilter()] }},
        }));

        addNumberSetting(world, global.gameWidth - padding - 24, settingsY, 1, 10, '[r]<heart>[/r]', () => settings.startHealth, n => settings.startHealth = n);
        addNumberSetting(world, global.gameWidth - padding - 24, settingsY + 15, 1, 10, '', () => settings.startRound, n => settings.startRound = n);
        addNumberSetting(world, global.gameWidth - padding - 24, settingsY + 30, 0, 100, '[gold]<coin>[/gold]', () => settings.startGameGold, n => settings.startGameGold = n);
        addNumberSetting(world, global.gameWidth - padding - 24, settingsY + 45, 0, 100, '[gold]<coin>[/gold]', () => settings.startRoundGold, n => settings.startRoundGold = n);
        addNumberSetting(world, global.gameWidth - padding - 24, settingsY + 60, 1, 10, '', () => settings.maxSquadSize, n => settings.maxSquadSize = n);
        addOptionSetting(world, global.gameWidth - padding - 24, settingsY + 75, ['Off', '0:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00'], '', () => secondsToTime(settings.timeLimit), v => settings.timeLimit = timeToSeconds(v));
        addOptionSetting(world, global.gameWidth - padding - 24, settingsY + 90, ['On', 'Off'], '', () => settings.speedCap ? 'On' : 'Off', v => settings.speedCap = v !== 'Off');
        addOptionSetting(world, global.gameWidth - padding - 24, settingsY + 105, getArenas(), '', () => arenaIdToName(settings.arena), v => settings.arena = arenaNameToId(v), changeArenaTo);

        addOptionSetting(world, global.gameWidth - padding - 24, settingsY + 120, getPacks(), '', () => packIdToNameWithAll(settings.hostPack), v => {
            let packId = packNameToIdWithAll(v);
            if (settings.hostPack === settings.nonhostPack) {
                settings.nonhostPack = packId;
            }
            settings.hostPack = packId;
        }, changePackTo);
        addOptionSetting(world, global.gameWidth - padding - 24, settingsY + 135, getPacks(), '', () => packIdToNameWithAll(settings.nonhostPack), v => settings.nonhostPack = packNameToIdWithAll(v), changePackTo);

        world.addWorldObject(new MenuTextButton({
            x: global.gameWidth/2, y: 206,
            text: 'Reset Defaults',
            anchor: Vector2.CENTER,
            justify: 'center',
            effects: { outline: { color: 0x000000 }, post: { filters: [new DropShadowFilter()] }},
            style: { color: 0xFFFFDD },

            hoverColor: 0xFFFF00,
            onClick:  () => {
                global.game.playSound('click');
                settings = VSModeSettings.GET_DEFAULT_SETTINGS();
            },
        }));

        world.select.name<Sprite>('back').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time+2) * 3;
        };
        world.select.name('back').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                back(settings);
            },
        }));

        world.addWorldObject(new WorldObject({
            update: function() {
                if (Input.justDown(Input.GAME_CLOSE_MENU)) {
                    Input.consume(Input.GAME_CLOSE_MENU);
                    back(settings);
                }
            }
        }));

        world.onTransitioned = () => {
            global.game.playMusic('music/title');
        };

        return world;
    }

    function back(settings: VSModeSettings.Settings) {
        saveVsSettings(settings);
        global.theater.loadStage(() => VSModeScreen.STAGE(settings));
    }

    function getArenas() {
        let arenas = [ARENA_FIRST_NAME, ARENA_SPACE_NAME, ARENA_ICE_NAME, ARENA_GRAVITY_NAME, ARENA_FACTORY_NAME];
        if (LiveVersion.BDAY_VS) {
            arenas.push(ARENA_BDAY_NAME);
        }
        return arenas;
    }

    function changeArenaTo(name: string) {
        setArenaWorld(arenaNameToId(name));
    }

    function getPacks() {
        return [PACK_CLASSIC_NAME, PACK_COMMUNITY_NAME, PACK_WEEKLY_NAME, PACK_ALL_NAME];
    }

    function packNameToIdWithAll(name: string) {
        if (name === PACK_ALL_NAME) return PACK_ALL_ID;
        return packNameToId(name);
    }

    function packIdToNameWithAll(id: string) {
        if (id === PACK_ALL_ID) return PACK_ALL_NAME;
        return packIdToName(id);
    }

    function changePackTo(name: string) {
        let packs = (name === PACK_ALL_NAME || name === PACK_WEEKLY_NAME) ? OFFICIAL_PACKS : [packNameToId(name)];
        setArenaWorldForPacks(packs as Pack[]);
    }

    function timeToSeconds(v: string) {
        if (!v || v.split(':').length !== 2) {
            return -1;
        }
        try {
            return parseInt(v.split(':')[0])*60 + parseInt(v.split(':')[1]);
        } catch {
            console.error('Improper time format:', v);
            return -1;
        }
    }

    function secondsToTime(s: number) {
        if (s < 0) {
            return 'Off';
        }
        let minutes = Math.floor(s/60);
        let seconds = s%60;
        return `${minutes}:${seconds === 0 ? '00' : seconds}`;
    }
}