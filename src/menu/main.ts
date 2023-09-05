var DONE_YAY = false;

class MainMenu extends Menu {
    constructor() {
        super({
            backgroundColor: 0x000000,
            volume: 1,
        });

        loadAchievementsProgress();
        loadAlmanacEntries();
        loadSheens();
        loadEquipmentTypesToItemTypes();
        Arenas.loadArenaPolarizationFootprints();

        Main.fixedDelta = undefined;
        GAME_MODE = 'mm';
        global.theater?.select?.type(BattleSpeedController, false)?.reset();

        setArenaWorld(Arenas.ARENA_FIRST);
        this.addWorldObject(new Theater.WorldAsWorldObject(_MENUS_ARENA_WORLD));

        this.addWorldObjects(lciDocumentToWorldObjects('mainmenu'));

        if (IS_MODDED) {
            this.addWorldObject(new SpriteText({
                x: 2,
                text: `MODDED`,
                style: { color: 0xFF0000 },
            }));
        } else if (Debug.DEBUG) {
            this.addWorldObject(new SpriteText({
                x: 2,
                text: `DEBUG`,
                style: { color: 0xFF0000 },
            }));
        }

        let visibleMinorVersion = this.addWorldObject(new SpriteText({
            x: global.gameWidth-3, y: 13,
            text: `[minorverx].${API.VISIBLE_MINOR_VERSION}[/minorverx]`,
            font: 'smallnumbers',
            anchor: Vector2.BOTTOM_RIGHT,
        }));
        this.addWorldObject(new SpriteText({
            x: global.gameWidth-3 - visibleMinorVersion.getTextWidth(), y: 16,
            text: `[verx]v${API.VISIBLE_CORE_VERSION}[/verx].${API.VISIBLE_MAJOR_VERSION}`,
            anchor: Vector2.BOTTOM_RIGHT,
        }));

        this.select.name<Sprite>('title').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time) * 5;
        };

        this.select.name<Sprite>('title_bday').setVisible(false);

        if (LiveVersion.BDAY) {
            this.select.name<Sprite>('title').setTexture(this.select.name<Sprite>('title_bday').getTexture());
            this.select.name<Sprite>('title').effects.post.filters.push(new HueSpinFilter());
            this.addWorldObject(new BdayShower());
            if (!DONE_YAY) {
                global.game.playSound('yay').volume = 0.5;
                global.game.playSound('achievement').volume = 0.6;
                DONE_YAY = true;
            }
        }

        if (LiveVersion.APRIL_FOOLS) {
            this.select.name<Sprite>('title').flipX = true;
        }

        this.select.name<Sprite>('play').updateCallback = function() {
            this.angle = Math.sin(4*this.life.time + 12) * 3;
        };
        this.select.name('play').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                resetData();
                if (loadName()) {
                    global.game.startGame(PlayScreen.STAGE);
                } else {
                    global.game.startGame(() => EnterYourName.STAGE('mainmenu'));
                }
            },
        }));

        this.select.name<Sprite>('howtoplay').updateCallback = function() {
            this.angle = Math.sin(4*this.life.time + 1) * 3;
        };
        this.select.name('howtoplay').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                setSheenSeen('howToPlay', true);
                this.select.name<Sprite>('howtoplay').effects.post.filters = [];
                global.game.menuSystem.loadMenu(() => new TutorialMenu());
            },
        }));

        if (shouldSheen('howToPlay')) {
            this.select.name<Sprite>('howtoplay').effects.post.filters.push(new ShineFilter(0xFFFFBB));
        }

        this.select.name<Sprite>('unlockables').updateCallback = function() {
            this.angle = Math.sin(4*this.life.time + 2) * 2.5;
        };
        this.select.name('unlockables').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                setSheenSeen('unlockables', true);
                this.select.name<Sprite>('unlockables').effects.post.filters = [];
                global.game.menuSystem.loadMenu(() => new AchievementsMenu());
            },
        }));

        if (shouldSheen('unlockables')) {
            this.select.name<Sprite>('unlockables').effects.post.filters.push(new ShineFilter(0xFFFFBB));
        }

        this.select.name<Sprite>('almanac').updateCallback = function() {
            this.angle = Math.sin(4*this.life.time + 3) * 2.5;
        };
        this.select.name('almanac').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                setSheenSeen('almanac', true);
                this.select.name<Sprite>('almanac').effects.post.filters = [];
                global.game.menuSystem.loadMenu(() => new AlmanacMenu('classic'));
            },
        }));

        if (shouldSheen('almanac')) {
            this.select.name<Sprite>('almanac').effects.post.filters.push(new ShineFilter(0xFFFFBB));
        }

        this.select.name<Sprite>('credits').updateCallback = function() {
            this.angle = Math.sin(4*this.life.time + 4) * 3;
        };
        this.select.name('credits').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                global.game.menuSystem.loadMenu(() => new CreditsMenu(this.takeSnapshot()));
            },
        }));

        if (IS_MOBILE) {
            this.select.name<Sprite>('googleplay').setVisible(false);
        } else {
            this.select.name<Sprite>('googleplay').updateCallback = function() {
                this.angle = Math.sin(4*this.life.time + 5) * 2.5;
            };
            this.select.name('googleplay').addModule(new Button({
                hoverTint: 0xFFFF00,
                clickTint: 0xBBBB00,
                onJustHovered: juiceButton(1),
                onClick: () => {
                    global.game.playSound('click');
                    window.open('https://play.google.com/store/apps/details?id=net.lectvs.autoballs', '_blank');
                },
            }));
        }

        let gear = this.addWorldObject(new Sprite({
            x: 14, y: this.height-14,
            texture: 'gear',
            bounds: new CircleBounds(0, 0, 11),
        }));
        gear.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(2),
            onClick: () => {
                global.game.playSound('click');
                global.game.menuSystem.loadMenu(() => new OptionsMenu());
            },
        }));

        this.select.name<Sprite>('follow').updateCallback = function() {
            this.tint = Color.lerpColorByLch(0xFFFFFF, 0xFFFF00, Tween.Easing.OscillateSine(1)(this.life.time));
        };

        let twittery = this.select.name('twitter').y;
        this.select.name<Sprite>('twitter').updateCallback = function() {
            this.y = twittery + Math.sin(4*this.life.time) * 2;
        };
        this.select.name('twitter').addModule(new Button({
            hoverTint: 0xBBBBBB,
            clickTint: 0x888888,
            onJustHovered: juiceButton(2),
            onClick: () => {
                global.game.playSound('click');
                setSheenSeen('twitter', true);
                this.select.name<Sprite>('twitter').effects.post.filters = [];
                window.open('https://twitter.com/lectvs', '_blank');
            },
        }));

        if (shouldSheen('twitter')) {
            this.select.name<Sprite>('twitter').effects.post.filters.push(new ShineFilter(0xFFFFBB));
        }

        let discordy = this.select.name('discord').y;
        this.select.name<Sprite>('discord').updateCallback = function() {
            this.y = discordy + Math.sin(4*this.life.time + 2) * 2;
        };
        this.select.name('discord').addModule(new Button({
            hoverTint: 0xBBBBBB,
            clickTint: 0x888888,
            onJustHovered: juiceButton(2),
            onClick: () => {
                global.game.playSound('click');
                setSheenSeen('discord', true);
                this.select.name<Sprite>('discord').effects.post.filters = [];
                window.open('https://discord.gg/RXw6hHFhMr', '_blank');
            },
        }));

        if (shouldSheen('discord')) {
            this.select.name<Sprite>('discord').effects.post.filters.push(new ShineFilter(0xFFFFBB));
        }

        this.select.name('patchnotes').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(2),
            onClick: () => {
                global.game.playSound('click');
                setSheenSeen('patchNotes', true);
                this.select.name<Sprite>('patchnotes').effects.post.filters = [];
                global.game.menuSystem.loadMenu(() => new PatchNotesMenu(this.takeSnapshot()));
            },
        }));

        if (shouldSheen('patchNotes')) {
            this.select.name<Sprite>('patchnotes').effects.post.filters.push(new ShineFilter(0xFFFFBB));
        }

        this.select.name('wiki').addModule(new Button({
            hoverTint: 0xBBBBBB,
            clickTint: 0x888888,
            onJustHovered: juiceButton(2),
            onClick: () => {
                global.game.playSound('click');
                window.open('https://auto-balls.fandom.com/wiki/Auto_Balls_Wiki', '_blank');
            },
        }));

        if (API.BETA || IS_MODDED) {
            this.select.name('cloudsave').setVisible(false);
            
        }

        this.addWorldObject(new RestoreCode());

        let playlatestversion = this.select.name('playlatestversion');
        playlatestversion.addChildKeepWorldPosition(this.select.name('plvng'));
        playlatestversion.addChildKeepWorldPosition(this.select.name('plvitch'));

        playlatestversion.setVisible(false);
        API.getliveversion((response, err) => {
            if (response) API.B = response.b;
            if ((!err && response && API.cmpFormattedVersions(API.getFormattedVersion(), response.versions.version) >= 0) || err?.startsWith('Throttled')) {
                return;
            }

            this.select.name('plvng').addModule(new Button({
                hoverTint: 0xBBBBBB,
                clickTint: 0x888888,
                onClick: () => {
                    global.game.playSound('click');
                    window.open('https://www.newgrounds.com/portal/view/834986', '_blank');
                }
            }));

            this.select.name('plvitch').addModule(new Button({
                hoverTint: 0xBBBBBB,
                clickTint: 0x888888,
                onClick: () => {
                    global.game.playSound('click');
                    window.open('https://lectvs.itch.io/auto-balls', '_blank');
                }
            }));

            this.runScript(function*() {
                playlatestversion.x -= 220;
                playlatestversion.setVisible(true);

                yield S.tween(1, playlatestversion, 'x', playlatestversion.x, playlatestversion.x + 220, Tween.Easing.OutCubic);

                let playlatestversiony = playlatestversion.y;
                playlatestversion.updateCallback = function() {
                    this.y = playlatestversiony + Math.sin(4*this.life.time + 2) * 2;
                };
            });
        });

        global.game.playMusic('music/title', 0.2);
    }
}