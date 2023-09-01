namespace AlmanacMenu {
    export type Page = Pack | 'items';
}

class AlmanacMenu extends Menu {
    private destroyedGift: boolean;

    constructor(initialPage: AlmanacMenu.Page) {
        super({
            backgroundColor: 0x000000,
            volume: 0,
            layers: [
                { name: 'world' },
                {
                    name: 'entries',
                    mask: {
                        offsetx: AlmanacMenu.MASK_X,
                        offsety: AlmanacMenu.MASK_Y,
                        texture: Texture.filledRect(AlmanacMenu.MASK_W, AlmanacMenu.MASK_H, 0xFFFFFF),
                    }
                },
            ],
        });

        this.destroyedGift = false;

        this.loadPage(initialPage);
    }

    update() {
        super.update();

        if (Input.justDown(Input.GAME_CLOSE_MENU)) {
            Input.consume(Input.GAME_CLOSE_MENU);
            global.game.menuSystem.back();
        }
    }

    private loadPage(page: AlmanacMenu.Page) {
        this.removeWorldObjects(A.clone(this.worldObjects));

        let wawo = this.addWorldObject(new Theater.WorldAsWorldObject(_MENUS_ARENA_WORLD));
        wawo.layer = 'world';
        
        this.addWorldObjects(lciDocumentToWorldObjects('almanacmenu'));

        this.select.name<Sprite>('title').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time) * 3;
        };
        
        let progressBar = this.select.name<Sprite>('progressbar');
        let progressWidth = progressBar.getTexture().width-2;

        let totalCompletionPercent = getAlmanacTotalCompletionPercent();

        this.addWorldObject(new Sprite({
            x: progressBar.x + 1, y: progressBar.y + 1,
            texture: Draw.PIXEL_TEXTURE,
            scaleX: progressWidth * totalCompletionPercent.seen,
            scaleY: 3,
        }));
        this.addWorldObject(new Sprite({
            x: progressBar.x + 1, y: progressBar.y + 1,
            texture: Draw.PIXEL_TEXTURE,
            scaleX: progressWidth * totalCompletionPercent.won,
            scaleY: 3,
            tint: 0xFFD800,
        }));

        this.setupGift(this);

        for (let p of ['classic', 'community', 'weekly', 'items']) {
            let baseTint: number;
            if (p === 'classic' || p === 'community' || p === 'weekly') {
                baseTint = getAlmanacBallCompletionPercent(p, { week: Weekly.LIVE_WEEK }) >= 1 ? 0xFFDB00 : 0xFFFFFF;
            } else {
                baseTint = getAlmanacItemCompletionPercent() >= 1 ? 0xFFDB00 : 0xFFFFFF;
            }

            if (p === page) {
                baseTint = Color.lerpColorByRgb(baseTint, 0x000000, 0.3);
            }

            let packButton = this.select.name(p).addModule(new Button({
                hoverTint: 0xFFFF00,
                clickTint: 0xBBBB00,
                baseTint: baseTint,
                onJustHovered: juiceButton(1),
                onClick: () => {
                    global.game.playSound('click');
                    this.loadPage(<any>p);
                },
            }));

            let cp = p;
            this.select.name(p).updateCallback = function() {
                if (cp === page) packButton.enabled = false;
            }

            if (p === 'weekly') {
                packButton.enabled = false;
                let packButtonHide = this.addWorldObject(new Sprite({
                    p: this.select.name(p),
                    texture: new AnchoredTexture(Texture.filledRect(56, 12, 0x000000), 0.5, 0.5),
                }));
        
                packButtonHide.addChild(new Spinner(0, 0, 1.5, 3));
        
                Weekly.load({
                    onSuccess() {
                        packButtonHide.kill();
                        packButton.enabled = true;
                    },
                    onError() {
                        // Nothing, just let the spinner spin indefinitely.
                    },
                });
            }
        }

        if (page === 'items') {
            this.select.name('levelup').setVisible(false);
            this.select.name('leveldown').setVisible(false);
        } else {
            this.select.name('levelup').addModule(new Button({
                hoverTint: 0xFFFF00,
                clickTint: 0xBBBB00,
                onJustHovered: juiceButton(1),
                onClick: () => {
                    global.game.playSound('click');
                    global.game.playSound('levelup');
                    juiceObject(this.select.name<Sprite>('levelup'), 1);
                    this.levelUpBalls();
                },
            }));
            this.select.name('leveldown').addModule(new Button({
                hoverTint: 0xFFFF00,
                clickTint: 0xBBBB00,
                onJustHovered: juiceButton(1),
                onClick: () => {
                    global.game.playSound('click');
                    global.game.playSound('reduce');
                    juiceObject(this.select.name<Sprite>('leveldown'), 1);
                    this.levelDownBalls();
                },
            }));
        }

        this.select.name<Sprite>('back').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time+1) * 3;
        };
        this.select.name('back').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                global.game.menuSystem.back();
            },
        }));

        this.addWorldObject(new AbilitySystem());

        let entriesBase = this.addWorldObject(new WorldObject({ x: this.width/2, y: AlmanacMenu.MASK_Y + 25 }));

        let textures: { bg: Texture, fg: Texture };
        if (page === 'classic' || page === 'community' || page === 'weekly') {
            textures = this.loadBallEntries(page, entriesBase);
        } else {
            textures = this.loadItemEntries(entriesBase);
        }

        let bgSprite = entriesBase.addChild(new Sprite({ x: -AlmanacMenu.MASK_W/2, y: -25, texture: textures.bg, layer: 'entries' }));
        World.Actions.moveWorldObjectToBack(bgSprite);
        let fgSprite = entriesBase.addChild(new Sprite({ x: -AlmanacMenu.MASK_W/2, y: -25, texture: textures.fg, layer: 'entries' }));
        World.Actions.moveWorldObjectToFront(fgSprite);

        let totalEntriesHeight = textures.bg.height;
        let startY = entriesBase.y;

        let scrollBar = this.addWorldObject(new ScrollBar(310, 59, 'almanacscrollbar', totalEntriesHeight, 48,
            p => entriesBase.y = startY - (totalEntriesHeight - AlmanacMenu.MASK_H) * p));
        scrollBar.effects.addOutline.color = 0xFFFFFF;

        this.addWorldObject(new DragScroller(scrollBar, totalEntriesHeight, rect(AlmanacMenu.MASK_X, AlmanacMenu.MASK_Y, AlmanacMenu.MASK_W, AlmanacMenu.MASK_H)));

        this.addWorldObject(new BallHighlighter());

        let infoBox = new InfoBox({ x: AlmanacMenu.MASK_X, y: AlmanacMenu.MASK_Y, width: AlmanacMenu.MASK_W, height: AlmanacMenu.MASK_H });
        infoBox.layer = World.DEFAULT_LAYER;
        infoBox.showCredits = true;
        this.addWorldObject(infoBox);

        this.update();
    }

    private loadBallEntries(pack: Pack, entriesBase: WorldObject) {
        let ballTypeList = getAlmanacDisplayedBallTypes(pack, { week: Weekly.LIVE_WEEK });

        let bgTexture = new BasicTexture(AlmanacMenu.MASK_W, Math.ceil(ballTypeList.length/8) * 52, 'AlmanacMenu.loadBallEntries');
        let fgTexture = new BasicTexture(AlmanacMenu.MASK_W, Math.ceil(ballTypeList.length/8) * 52, 'AlmanacMenu.loadBallEntries');

        let i = 0, j = 0;
        for (let type of ballTypeList) {
            let winCount = getAlmanacBallWinCount(type);

            this.renderEntryBox(bgTexture, i, j, winCount);

            if (hasSeenAlmanacBall(type)) {
                let ball = entriesBase.addChild(getRewardBall(type));
                ball.layer = 'entries';
                ball.hp = ball.maxhp = ball.getShopHp();
                ball.dmg = ball.getShopDmg();
                ball.showAllStats();
    
                ball.localx = M.equidistantLine(0, 36, 8, i) + ball.getShopRelativePosition().x;
                ball.localy = 52*j + ball.getShopRelativePosition().y;
            } else {
                this.renderEntryBoxMystery(bgTexture, i, j);
            }

            if (winCount > 0) {
                this.renderEntryBoxWinText(fgTexture, i, j, winCount);
            }

            i++;
            if (i >= 8) {
                i = 0;
                j++;
            }
        }

        return { bg: bgTexture, fg: fgTexture };
    }

    private loadItemEntries(entriesBase: WorldObject) {
        let itemTypeList = getAlmanacDisplayedItemTypes();

        let bgTexture = new BasicTexture(AlmanacMenu.MASK_W, Math.ceil(itemTypeList.length/8) * 52, 'AlmanacMenu.loadItemEntries');
        let fgTexture = new BasicTexture(AlmanacMenu.MASK_W, Math.ceil(itemTypeList.length/8) * 52, 'AlmanacMenu.loadItemEntries');

        let i = 0, j = 0;
        for (let type of itemTypeList) {
            let winCount = getAlmanacItemWinCount(type);

            this.renderEntryBox(bgTexture, i, j, winCount);

            if (hasSeenAlmanacItem(type)) {
                let item = entriesBase.addChild(getRewardItem(type));
                item.layer = 'entries';
                item.localx = M.equidistantLine(0, 36, 8, i);
                item.localy = 52*j;
            } else {
                this.renderEntryBoxMystery(bgTexture, i, j);
            }

            if (winCount > 0) {
                this.renderEntryBoxWinText(fgTexture, i, j, winCount);
            }

            i++;
            if (i >= 8) {
                i = 0;
                j++;
            }
        }

        return { bg: bgTexture, fg: fgTexture };
    }

    private levelUpBalls() {
        let balls = this.select.typeAll(Ball);
        for (let ball of balls) {
            ball.levelUp(undefined, false, false);
        }
    }

    private levelDownBalls() {
        let balls = this.select.typeAll(Ball);
        for (let ball of balls) {
            ball.levelDown();
        }
    }

    private renderEntryBox(texture: Texture, i: number, j: number, winCount: number) {
        let tint = winCount > 0 ? 0xFFDB00 : 0xFFFFFF;
        AssetCache.getTexture('almanacentrybox').renderTo(texture, { x: 17 + 36*i, y: 25 + 52*j, tint: tint });
    }

    private renderEntryBoxWinText(texture: Texture, i: number, j: number, winCount: number) {
        let spriteText = lazy('AlmanacMenuSpriteText', () => new SpriteText({
            font: 'smallnumbers',
            style: { color: 0xFFDB00 },
            layer: 'entries',
            effects: { outline: {} },
        }));

        spriteText.setText(`<crown2l><crown2r>${winCount}`);
        spriteText.render(texture, 2 + 36*i, 4 + 52*j);
    }

    private renderEntryBoxMystery(texture: Texture, i: number, j: number) {
        AssetCache.getTexture('almanacmystery').renderTo(texture, { x: 17 + 36*i, y: 25 + 52*j });
    }

    private setupGift(world: World) {
        let gift = world.select.name<Sprite>('gift');

        if (IS_MOBILE || this.destroyedGift) {
            gift.setVisible(false);
            return;
        }

        let revealGift = getAlmanacTotalCompletionPercent().won >= 0.25;

        if (revealGift) {
            gift.effects.post.filters.push(new TextureFilter({
                code: `
                    if (x >= 0.0 && x < width && y >= 0.0 && y < height && (inp.r > 0.0 && inp.r < 1.0)) {
                        float v = map(pnoise(x, y, 10.6 + 100.0*t), -1.0, 1.0, 0.0, 1.0);
                        float av = (1.0 - cos(PI*v)) / 2.0;
                        float aav = (1.0 - cos(PI*av)) / 2.0;
                        outp.rgb = vec3(1.0, 1.0, 1.0) * aav;
                    }
                `
            }));
        }

        gift.addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onClick: () => {
                if (revealGift) {
                    global.game.startGame(() => ARG.Stages.CODE());
                } else {
                    global.game.playSound('arg/glitch_short_low').volume = 1.5;
                    gift.kill();
                    this.destroyedGift = true;
                }
            },
            onJustHovered: () => {
                world.effects.glitch.enable(1, 0.5, 16);
            },
            onJustUnhovered: () => {
                world.effects.glitch.enabled = false;
            },
        }))
    }
}

namespace AlmanacMenu {
    export const MASK_X = 17;
    export const MASK_Y = 62;
    export const MASK_W = 286;
    export const MASK_H = 144;
}