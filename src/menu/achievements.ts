class AchievementsMenu extends Menu {
    constructor() {
        super({
            backgroundColor: 0x000000,
            volume: 0,
            layers: [
                { name: 'world' },
                {
                    name: 'achievements',
                    mask: {
                        offsetx: 0,
                        offsety: 62,
                        texture: Texture.filledRect(global.gameWidth, 138, 0xFFFFFF),
                    }
                },
            ],
        });

        let achievementsComplete = getAchievementsCompleteCount();
        let achievementsCount = getAchievementsCount();
        let mainAchievementsComplete = achievementsComplete.completeCount === achievementsCount.count;
        let secretAchievementsComplete = achievementsComplete.secretCompleteCount === achievementsCount.secretCount;

        let wawo = this.addWorldObject(new Theater.WorldAsWorldObject(_MENUS_ARENA_WORLD));
        wawo.layer = 'world';
        
        this.addWorldObjects(lciDocumentToWorldObjects('achievementsmenu'));

        this.select.name<Sprite>('title').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time) * 3;
        };

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

        let progressWidthScale = (achievementsComplete.completeCount + achievementsComplete.secretCompleteCount) / achievementsCount.count;
        let progressBar = this.select.name<Sprite>('bar');
        let progressWidth = progressBar.getTexture().width-2;
        this.addWorldObject(new Sprite({
            x: progressBar.x + 1, y: progressBar.y + 1,
            texture: Draw.PIXEL_TEXTURE,
            scaleX: progressWidth * progressWidthScale,
            scaleY: 3,
            tint: mainAchievementsComplete ? 0xFFD800 : 0xFFFFFF,
        }));

        if (mainAchievementsComplete && secretAchievementsComplete) {
            this.select.name<Sprite>('title').tint = 0xFFD800;
        }

        let achievementsCompleteText = `${achievementsComplete.completeCount}`;
        if (achievementsComplete.secretCompleteCount > 0) {
            achievementsCompleteText += `[gold]+${achievementsComplete.secretCompleteCount}[/gold]`;
        }
        this.addWorldObject(new SpriteText({
            x: progressBar.x - 2, y: progressBar.y + 3,
            text: `[achx]${achievementsCompleteText}[/achx]/${achievementsCount.count}`,
            font: 'smallnumbers',
            style: { color: mainAchievementsComplete ? 0xFFD800 : 0xFFFFFF },
            effects: { outline: { color: 0x000000 } },
            anchor: Vector2.CENTER_RIGHT,
        }))

        let achievements = this.addWorldObject(new WorldObject({ x: this.width/2, y: 82 }));

        let achievementNameList = Object.keys(ACHIEVEMENTS).map(ach => <AchievementName>ach).filter(ach => {
            if (ach === 'ArgPart1') {
                return hasCompletedAchievement('ArgPart1') || (!IS_MOBILE && achievementsComplete.completeCount >= 6);
            }
            if (ACHIEVEMENTS[ach].secret && !hasCompletedAchievement(ach)) {
                return false;
            }
            return true;
        });

        let argPart1AchIndex = achievementNameList.indexOf('ArgPart1');
        if (argPart1AchIndex >= 0 && achievementNameList.length >= 6 && !hasCompletedAchievement('ArgPart1')) {
            achievementNameList.splice(argPart1AchIndex, 1);
            achievementNameList.splice(Random.int(5, achievementNameList.length-1), 0, 'ArgPart1');
        }

        let i = 0;
        for (let ach of achievementNameList) {
            let box = achievements.addChild(new Sprite({
                x: 0, y: 44*i,
                texture: AchievementsMenu.achievementBox.get(),
                layer: 'achievements',
                bounds: new RectBounds(-103, -20, 206, 40),
            }));

            let iconBox = box.addChild(new Sprite({
                x: -83, y: 0,
                texture: 'achievementrewardbox',
                layer: 'achievements',
            }));

            let complete = hasCompletedAchievement(ach);

            if (complete) {
                let beams = iconBox.addChild(new Sprite({
                    texture: 'buffbeams',
                    scale: 20 / 64,
                    vangle: 90,
                    layer: 'achievements',
                }));
                let reward = iconBox.addChild(ACHIEVEMENTS[ach].rewardObjectFactory());
                reward.layer = 'achievements';
            } else {
                let icon = iconBox.addChild(new Sprite({
                    x: 0, y: 0,
                    texture: `${ACHIEVEMENTS[ach].rewardIconBase}/${complete ? 1 : 0}`,
                    bounds: new CircleBounds(0, 0, 10),
                    tags: ['reward'],
                    layer: 'achievements',
                }));
            }

            let desc = box.addChild(new SpriteText({
                x: 17, y: 0,
                text: ACHIEVEMENTS[ach].description,
                anchor: Vector2.CENTER,
                justify: 'center',
                maxWidth: 164,
                style: { color: ACHIEVEMENTS[ach].secret ? 0xFFD800 : 0xFFFFFF },
                layer: 'achievements',
            }));

            let progress = box.addChild(new SpriteText({
                x: 100, y: 17,
                text: `[achx]${Math.floor(ACHIEVEMENTS_PROGRESS[ach])}[/achx]/${ACHIEVEMENTS[ach].completeProgress}`,
                font: 'smallnumbers',
                style: { color: complete ? 0x00FF00 : 0xFFFFFF },
                anchor: Vector2.BOTTOM_RIGHT,
                layer: 'achievements',
            }));

            let storedAch = ach;
            box.updateCallback = function() {
                let mask = this.world.getLayerByName('achievements').mask;
                let maskRect = mask ? rect(mask.offsetx, mask.offsety, mask.texture.width, mask.texture.height) : rect(0, 0, 0, 0);
                let mousePos = this.world.getWorldMousePosition();

                if (Input.justDown('click') && mask && G.rectContainsPt(maskRect, mousePos) && this.bounds.containsPoint(mousePos)) {
                    this.data.clicks = (this.data.clicks || 0) + 1;
                }

                if (Input.justDown('ach_cheat')) {
                    if (this.data.clicks >= 5 && !hasCompletedAchievement(storedAch)) {
                        grantAchievement(storedAch);
                        global.game.playSound('achievement');
                    }
                    this.data.clicks = 0;
                }
            }

            if (ach === 'ArgPart1' && !complete) {
                iconBox.kill();
                desc.kill();
                progress.kill();

                box.setTexture('argpart1box');
                box.alpha = 0.75;
                box.effects.post.filters.push(new Effects.Filters.Glitch(8, 6, 8));

                let currentUpdateCallback = box.updateCallback;
                box.updateCallback = function() {
                    if (currentUpdateCallback) currentUpdateCallback.call(this);
                    let mask = this.world.getLayerByName('achievements').mask;
                    let maskRect = mask ? rect(mask.offsetx, mask.offsety, mask.texture.width, mask.texture.height) : rect(0, 0, 0, 0);
                    let mousePos = this.world.getWorldMousePosition();

                    if (mask && G.rectContainsPt(maskRect, mousePos) && this.bounds.containsPoint(mousePos)) {
                        this.data.hoverTime = (this.data.hoverTime || 0) + this.delta;
                        this.effects.outline.enabled = true;
                        this.effects.outline.color = 0xFFFFFF;
                    } else {
                        this.data.hoverTime = 0;
                        this.effects.outline.enabled = false;
                    }

                    if (mask && G.rectContainsRect(maskRect, this.bounds.getBoundingBox())) {
                        this.data.seeTime = (this.data.seeTime || 0) + this.delta;
                    } else {
                        this.data.seeTime = 0;
                    }

                    if (this.data.hoverTime >= 3 || this.data.seeTime >= 8) {
                        global.game.menuSystem.loadMenu(() => new ArgIntroMenu(this.world.takeSnapshot()));
                    }
                }
            }

            i++;
        }

        let totalAchievementsHeight = i*44 - 4;
        let totalVisibleHeight = 138;
        let startY = achievements.y;

        let scrollBar = this.addWorldObject(new ScrollBar(265, 62, 'achievementscrollbar', totalAchievementsHeight, 32,
            p => achievements.y = startY - (totalAchievementsHeight - totalVisibleHeight) * p));

        this.addWorldObject(new DragScroller(scrollBar, totalAchievementsHeight, rect(60, 60, 200, 140)));

        this.addWorldObject(new BallHighlighter());

        let achievementScreenBounds = { x: 57, y: 62, width: 206, height: 138 };

        let infoBox = new InfoBox(achievementScreenBounds);
        infoBox.layer = World.DEFAULT_LAYER;
        this.addWorldObject(infoBox);

        this.addWorldObject(new AchievementRewardInfoBox(achievementScreenBounds));
    }

    update() {
        super.update();

        if (Input.justDown(Input.GAME_CLOSE_MENU)) {
            Input.consume(Input.GAME_CLOSE_MENU);
            global.game.menuSystem.back();
        }
    }

    static achievementBox = new LazyValue(() => new AnchoredTexture(Texture.ninepatch(AssetCache.getTexture('infobox_9p'), rect(4, 4, 4, 4), 206, 40), 0.5, 0.5))
}