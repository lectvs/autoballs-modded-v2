class TheaterWithAchievements extends Theater {
    private currentAchievementCompletion: { [ach in AchievementName]: boolean };

    constructor(config: Theater.Config) {
        super(config);

        this.currentAchievementCompletion = <{ [ach in AchievementName]: boolean }>_.mapObject(ACHIEVEMENTS, (ach, achName: AchievementName, obj) => hasCompletedAchievement(achName));

        this.addWorldObject(new BattleSpeedController());
        this.addWorldObject(new AbilitySystem());
    }

    update(): void {
        this.updateBattleSpeedController();

        if (this.currentWorld) {
            updateInGameUpdateAchievements(this.currentWorld);
            updateAlmanacEntriesSeen(this.currentWorld);
        }

        this.updateAchievementCompletion();
        super.update();
    }

    loadStageImmediate(stage: () => World, transition?: Transition, onTransitioned?: (world: World) => void): void {
        super.loadStageImmediate(stage, transition, onTransitioned);
        this.select.type(BattleSpeedController).reset();
        this.select.type(BattleSpeedController).enabled = false;
    }

    private updateBattleSpeedController() {
        if (!this.currentWorld) return;

        let battleSpeedController = this.select.type(BattleSpeedController);
        if (GAME_MODE === 'mm') {
            if (battleSpeedController.enabled) {
                this.stageManager.currentWorld.timeScale = battleSpeedController.getProducedTimescale();
            }
            this.stageManager.currentWorldAsWorldObject.multiExecutionTimeScale = 1;
        } else {
            if (battleSpeedController.enabled) {
                this.stageManager.currentWorld.timeScale = 1;
                this.stageManager.currentWorldAsWorldObject.multiExecutionTimeScale = battleSpeedController.getProducedTimescale();
            } else {
                this.stageManager.currentWorldAsWorldObject.multiExecutionTimeScale = 1;
            }
        }
    }

    private updateAchievementCompletion() {
        let completedAchivements: AchievementName[] = [];
        for (let ach in ACHIEVEMENTS) {
            let achName = <AchievementName>ach;
            if (!this.currentAchievementCompletion[achName] && hasCompletedAchievement(achName)) {
                completedAchivements.push(achName);
            }
            this.currentAchievementCompletion[achName] = hasCompletedAchievement(achName);
        }

        if (completedAchivements.length > 0) {
            this.sendAchievementGetNotifications(completedAchivements);
        }
    }

    private sendAchievementGetNotifications(achNames: AchievementName[]) {
        for (let i = 0; i < achNames.length; i++) {
            this.sendAchievementGetNotification(achNames[i], i);
        }
        this.playSound('achievement');
    }

    private sendAchievementGetNotification(achName: AchievementName, i: number) {
        setSheenSeen('unlockables', false);

        let theater = this;
        this.runScript(function*() {
            let box = theater.addWorldObject(new Sprite({
                x: theater.width + 103, y: 24 + 44*i,
                texture: AchievementsMenu.achievementBox.get(),
            }));

            let iconBox = box.addChild(new Sprite({
                x: -83, y: 0,
                texture: 'achievementrewardbox',
            }));

            let beams = iconBox.addChild(new Sprite({
                texture: 'buffbeams',
                scale: 20 / 64,
                vangle: 90,
            }));
            
            let reward = iconBox.addChild(ACHIEVEMENTS[achName].rewardObjectFactory());

            let progress = box.addChild(new SpriteText({
                x: 100, y: 18,
                text: `COMPLETE!`,
                font: 'smallnumbers',
                style: { color: 0x00FF00 },
                anchor: Vector2.BOTTOM_RIGHT,
            }));

            let desc = box.addChild(new SpriteText({
                x: -60, y: 0,
                text: ACHIEVEMENTS[achName].description,
                anchor: Vector2.CENTER_LEFT,
                justify: 'left',
                maxWidth: 160,
                style: { color: ACHIEVEMENTS[achName].secret ? 0xFFD800 : 0xFFFFFF },
            }));

            yield S.tween(1, box, 'x', box.x, theater.width - 103 + 3, Tween.Easing.OutQuad);
            yield S.wait(4);
            yield S.tween(1, box, 'x', box.x, theater.width + 103, Tween.Easing.InQuad);

            box.removeFromWorld();
        });
    }
}