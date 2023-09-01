Main.loadConfig(() => ({
    gameCodeName: "committeejam",
    gameWidth: 320,
    gameHeight: 240,
    canvasScale: 3,
    backgroundColor: 0x000000,
    fpsLimit: 15,
    preventScrollOnCanvas: true,

    preloadBackgroundColor: 0x000000,
    preloadProgressBarColor: 0xFFFFFF,

    textures: Assets.textures,
    sounds: Assets.sounds,
    tilesets: Assets.tilesets,
    pyxelTilemaps: Assets.pyxelTilemaps,
    fonts: Assets.fonts,
    customResources: Assets.customResources,
    spriteTextTags: Assets.spriteTextTags,
    dialogProfiles: dialogProfiles,

    defaultZBehavior: 'threequarters',
    defaultSpriteTextFont: 'deluxe16',

    simulateMouseWithTouches: true,
    defaultOptions: {
        volume: 1,
        sfx_volume: 0.5,
        music_volume: 0.5,
        controls: {
            // General
            'fullscreen':                ['f'],

            // Game
            'click':                     ['MouseLeft'],
            'rightclick':                ['MouseRight'],
            'pausebattle':               [' ', 'MouseLeft'],
            'speedupbattle':             ['ArrowRight', 'MouseRight'],

            'left':                      ['ArrowLeft', 'a'],
            'right':                     ['ArrowRight', 'd'],
            'up':                        ['ArrowUp', 'w'],
            'down':                      ['ArrowDown', 's'],
            'grab':                      [' '],

            'ach_cheat':                 ['p'],

            // Presets
            'game_advanceCutscene':      ['x', 'z'],
            'game_pause':                ['Escape', 'Backspace'],
            'game_closeMenu':            ['Escape'],
            'game_select':               ['MouseLeft'],

            'debug_moveCameraUp':        ['i'],
            'debug_moveCameraDown':      ['k'],
            'debug_moveCameraLeft':      ['j'],
            'debug_moveCameraRight':     ['l'],
            'debug_recordMetrics':       ['0'],
            'debug_showMetricsMenu':     ['9'],
            'debug_toggleOverlay':       ['o'],
            'debug_frameSkipStep':       ['1'],
            'debug_frameSkipRun':        ['2'],
            'debug_frameSkipDisable':    ['3'],
            'debug_skipRate':            ['4'],

            // Debug
            '1':                         ['1'],
            '2':                         ['2'],
            '3':                         ['3'],
            '4':                         ['4'],
            '5':                         ['5'],
            '6':                         ['6'],
            '7':                         ['7'],
            '8':                         ['8'],
            '9':                         ['9'],
            '0':                         ['0'],
            'lmb':                       ['MouseLeft'],
            'rmb':                       ['MouseRight'],
        }
    },

    game: {
        entryPointMenu: () => new LoadMenu(),
        mainMenu: () => new MainMenu(),
        pauseMenu: () => new PauseMenu(),
        theaterFactory: () => new TheaterWithAchievements({
            dialogBox: () => new DialogBox({
                x: global.gameWidth/2, y: global.gameHeight - 40,
                texture: 'dialogbox',
                defaultTextFont: 'deluxe16',
                textAreaFull: { x: -150, y: -30, width: 300, height: 60 },
                textAreaPortrait: { x: -72, y: -30, width: 222, height: 60 },
                portraitPosition: { x: -120, y: 0 },
                nameTexture: 'dialogbox_name',
                nameFont: 'deluxe16',
                namePosition: { x: -150, y: -40 },
                nameTextOffset: { x: 0, y: -2 },
                defaultDialogStart: null,
                defaultDialogSpeak: 'dialogspeak',
            }),
        }),
    },

    debug: {
        debug: false,
        font: 'deluxe16',
        fontStyle: { color: 0xFFFFFF },
        showAllPhysicsBounds: false,
        showTouches: true,
        moveCameraWithArrows: true,
        showOverlay: false,
        overlayFeeds: [],
        skipRate: 1,
        programmaticInput: false,
        autoplay: true,
        skipMainMenuStage: undefined,
        frameStepEnabled: false,
        resetOptionsAtStart: false,
        experiments: {},
    },

    persistIntervalSeconds: 30,
    persist: () => {
        
    },

    beforePreload: () => { IS_MODDED = true;
        CloudSave.load();
        LiveVersion.load();
        Weekly.load({ onSuccess() {}, onError() {} });
    },

    beforeStart: () => {
        PrerenderBalls.render();
    },
}));
