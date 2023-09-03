type Achievement = {
    description: string;
    rewardIconBase: string;
    rewardObjectFactory: Factory<WorldObject>;
    completeProgress: number;
    secret: boolean;
}

type AchievementName = keyof typeof ACHIEVEMENTS;

const ACHIEVEMENTS = {
    'PlayFiveGames': requireType<Achievement>({
        description: 'Play 5 games',
        rewardIconBase: 'achievements/playfivegames',
        rewardObjectFactory: () => getRewardItem(14),
        completeProgress: 5,
        secret: false,
    }),
    'WinGame': requireType<Achievement>({
        description: 'Win your first game',
        rewardIconBase: 'achievements/wingame',
        rewardObjectFactory: () => getRewardBall(25),
        completeProgress: 1,
        secret: false,
    }),
    'StrongBall': requireType<Achievement>({
        description: 'Have a ball with at least [r]15<sword>[/r] [g]15<heart>[/g]',
        rewardIconBase: 'achievements/strongball',
        rewardObjectFactory: () => getRewardBall(24),
        completeProgress: 1,
        secret: false,
    }),
    'RoundsInARow': requireType<Achievement>({
        description: 'Win 3 rounds in a row',
        rewardIconBase: 'achievements/roundsinarow',
        rewardObjectFactory: () => getRewardItem(17),
        completeProgress: 3,
        secret: false,
    }),
    'HaveTwentyGold': requireType<Achievement>({
        description: 'Have at least 20 gold at once',
        rewardIconBase: 'achievements/havetwentygold',
        rewardObjectFactory: () => getRewardItem(20),
        completeProgress: 20,
        secret: false,
    }),
    'ReachRoundTwelve': requireType<Achievement>({
        description: 'Reach Round 12',
        rewardIconBase: 'achievements/reachroundtwelve',
        rewardObjectFactory: () => getRewardBall(34),
        completeProgress: 12,
        secret: false,
    }),
    'PlayHundredRounds': requireType<Achievement>({
        description: 'Play 100 rounds',
        rewardIconBase: 'achievements/playhundredrounds',
        rewardObjectFactory: () => getRewardItem(24),
        completeProgress: 100,
        secret: false,
    }),
    'WinFiftyRounds': requireType<Achievement>({
        description: 'Win 50 rounds',
        rewardIconBase: 'achievements/winfiftyrounds',
        rewardObjectFactory: () => getRewardItem(23),
        completeProgress: 50,
        secret: false,
    }),
    'VictoryWithTwoBalls': requireType<Achievement>({
        description: 'Win the final round with <lte>3 balls',
        rewardIconBase: 'achievements/victorywithtwoballs',
        rewardObjectFactory: () => getRewardBall(32),
        completeProgress: 1,
        secret: false,
    }),
    'MakeFiveHundredPurchases': requireType<Achievement>({
        description: 'Make 500 shop purchases',
        rewardIconBase: 'achievements/makefivehundredpurchases',
        rewardObjectFactory: () => getRewardBall(35),
        completeProgress: 500,
        secret: false,
    }),
    'CatEarsOnSquad': requireType<Achievement>({
        description: 'Equip cat ears on all five balls',
        rewardIconBase: 'achievements/catearsonsquad',
        rewardObjectFactory: () => getRewardBall(28, -3, 3),
        completeProgress: 1,
        secret: false,
    }),
    'WinInTenMinutes': requireType<Achievement>({
        description: 'Win a game in 15 minutes or less',
        rewardIconBase: 'achievements/winintenminutes',
        rewardObjectFactory: () => getRewardItem(21),
        completeProgress: 1,
        secret: false,
    }),
    'StrongSquad': requireType<Achievement>({
        description: 'Have all five balls with at least [r]7<sword>[/r] [g]7<heart>[/g]',
        rewardIconBase: 'achievements/strongsquad',
        rewardObjectFactory: () => getRewardItem(15),
        completeProgress: 1,
        secret: false,
    }),
    'WinWithoutEquipment': requireType<Achievement>({
        description: 'Win a game without buying equipment',
        rewardIconBase: 'achievements/winwithoutequipment',
        rewardObjectFactory: () => getRewardBall(30),
        completeProgress: 1,
        secret: false,
    }),
    'WinWithoutFreezing': requireType<Achievement>({
        description: 'Win a game without freezing anything\\ ',
        rewardIconBase: 'achievements/winwithoutfreezing',
        rewardObjectFactory: () => getRewardBall(39),
        completeProgress: 1,
        secret: false,
    }),
    'DealDamage': requireType<Achievement>({
        description: 'Deal 1000 total damage',
        rewardIconBase: 'achievements/dealdamage',
        rewardObjectFactory: () => getRewardBall(43),
        completeProgress: 1000,
        secret: false,
    }),
    'DefeatCrownedSquads': requireType<Achievement>({
        description: 'Defeat a\n[gold][offsetx -3]<crown>[/offsetx][/gold]Crowned squad',
        rewardIconBase: 'achievements/defeatcrownedsquads',
        rewardObjectFactory: () => getRewardItem(27),
        completeProgress: 1,
        secret: false,
    }),
    'MidLevelBall': requireType<Achievement>({
        description: 'Have a ball at 4[gold]<star>[/gold] or greater',
        rewardIconBase: 'achievements/midlevelball',
        rewardObjectFactory: () => getRewardBall(49),
        completeProgress: 1,
        secret: false,
    }),
    'HealHp': requireType<Achievement>({
        description: 'Heal a total of [g]100<heart>[/g]',
        rewardIconBase: 'achievements/healhp',
        rewardObjectFactory: () => getRewardBall(127),
        completeProgress: 100,
        secret: false,
    }),
    'BallGoBrrr': requireType<Achievement>({
        description: 'Make a ball go at 250% speed',
        rewardIconBase: 'achievements/ballgobrrr',
        rewardObjectFactory: () => getRewardBall(110),
        completeProgress: 250,
        secret: false,
    }),
    'SameBall': requireType<Achievement>({
        description: 'Win a round with 3 of the same ball',
        rewardIconBase: 'achievements/sameball',
        rewardObjectFactory: () => getRewardBall(116),
        completeProgress: 1,
        secret: false,
    }),
    'SellCoin': requireType<Achievement>({
        description: 'Sell a Coin for 10 gold',
        rewardIconBase: 'achievements/sellcoin',
        rewardObjectFactory: () => getRewardItem(46),
        completeProgress: 1,
        secret: false,
    }),
    'WinDaily': requireType<Achievement>({
        description: 'Win a Daily game',
        rewardIconBase: 'achievements/windaily',
        rewardObjectFactory: () => getRewardBall(139),
        completeProgress: 1,
        secret: false,
    }),
    'DealBurnDamage': requireType<Achievement>({
        description: 'Burn enemies for 200 total damage',
        rewardIconBase: 'achievements/dealburndamage',
        rewardObjectFactory: () => getRewardBall(138),
        completeProgress: 200,
        secret: false,
    }),
    'ShootProjectiles': requireType<Achievement>({
        description: 'Shoot 250 projectiles',
        rewardIconBase: 'achievements/shootprojectiles',
        rewardObjectFactory: () => getRewardItem(52),
        completeProgress: 250,
        secret: false,
    }),
    'FiveRemainingBalls': requireType<Achievement>({
        description: 'Win a round with at least 5 balls left\\ ',
        rewardIconBase: 'achievements/fiveremainingballs',
        rewardObjectFactory: () => getRewardBall(137),
        completeProgress: 1,
        secret: false,
    }),
    'CompleteBallmanacEntries': requireType<Achievement>({
        description: 'Win 20 entries in the Ballmanac',
        rewardIconBase: 'achievements/completeballmanacentries',
        rewardObjectFactory: () => getRewardBall(140),
        completeProgress: 20,
        secret: false,
    }),
    'KillBeforeBattle': requireType<Achievement>({
        description: 'Kill an enemy before the battle starts',
        rewardIconBase: 'achievements/killbeforebattle',
        rewardObjectFactory: () => getRewardItem(55),
        completeProgress: 1,
        secret: false,
    }),
    'KillEnemiesInRound': requireType<Achievement>({
        description: 'Kill 3 enemies with a single ball',
        rewardIconBase: 'achievements/killenemiesinround',
        rewardObjectFactory: () => getRewardBall(143),
        completeProgress: 3,
        secret: false,
    }),
    'WinWeekly': requireType<Achievement>({
        description: 'Win a Weekly Shuffle game',
        rewardIconBase: 'achievements/winweekly',
        rewardObjectFactory: () => getRewardBall(52),
        completeProgress: 1,
        secret: false,
    }),
    'ArgPart1': requireType<Achievement>({
        description: 'Break the game',
        rewardIconBase: 'achievements/argpart1',
        rewardObjectFactory: () => getRewardBall(42),
        completeProgress: 1,
        secret: true,
    }),
    'B': requireType<Achievement>({
        description: 'Free the virus',
        rewardIconBase: 'achievements/b',
        rewardObjectFactory: () => {
            let r = getRewardSprite('achievements/b/1', '[m]_... . _ ._[/m]');
            r.effects.post.filters.push(new Effects.Filters.Glitch(4, 2, 4));
            return r;
        },
        completeProgress: 1,
        secret: true,
    }),
    'C': requireType<Achievement>({
        description: 'Beat the game',
        rewardIconBase: 'achievements/c',
        rewardObjectFactory: () => getRewardSprite('achievements/c/1', '[m]._ _[/m] / [m]_ .... .[/m] / [m]. _. _..[/m]\n[m]___ .._.[/m] / [m]_ .... .[/m]\n[m].__ ___ ._. ._.. _..[/m]'),
        completeProgress: 1,
        secret: true,
    }),
    'CompleteTheBallmanac': requireType<Achievement>({
        description: 'Complete the Ballmanac',
        rewardIconBase: 'achievements/completetheballmanac',
        rewardObjectFactory: () => getRewardSprite('achievements/completetheballmanac/1', 'You did it!!!'),
        completeProgress: 1,
        secret: true,
    }),
    'TimeOut': requireType<Achievement>({
        description: 'Time out',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'WinWithoutLosing': requireType<Achievement>({
        description: 'Win a game without losing a round',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'ReallyStrongBall': requireType<Achievement>({
        description: 'Have a ball with at least [r]50<sword>[/r] [g]50<heart>[/g]',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'HighLevelBall': requireType<Achievement>({
        description: 'Have a ball at 6[gold]<star>[/gold] or greater',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'DefeatLectvs': requireType<Achievement>({
        description: 'Defeat lectvs in Matchmaking',
        rewardIconBase: 'achievements/defeatlectvs',
        rewardObjectFactory: () => getRewardSprite('achievements/defeatlectvs/1', 'The developer of\nAuto Balls!'),
        completeProgress: 1,
        secret: true,
    }),
    'DefeatMaterwelons': requireType<Achievement>({
        description: 'Defeat Materwelons in Matchmaking',
        rewardIconBase: 'achievements/defeatmaterwelons',
        rewardObjectFactory: () => getRewardSprite('achievements/defeatmaterwelons/1', 'The Community Bash Versus\nMode tournament winner!'),
        completeProgress: 1,
        secret: true,
    }),
    'DefeatXephia': requireType<Achievement>({
        description: 'Defeat Xephia in Matchmaking',
        rewardIconBase: 'achievements/defeatxephia',
        rewardObjectFactory: () => {
            let r = getRewardSprite('achievements/defeatxephia/1', 'The Shuffle Scuffle Versus\nMode tournament winner!');
            let g = new Effects.Filters.Glitch(0, 1, 2);
            r.effects.post.filters.push(g);
            r.updateCallback = function() {
                if (M.sin(240*this.life.time) > 0.93) {
                    g.strength = 4;
                } else {
                    g.strength = 0;
                }
            }
            return r;
        },
        completeProgress: 1,
        secret: true,
    }),
    'Useless': requireType<Achievement>({
        description: 'Useless! >:(',
        rewardIconBase: 'achievements/useless',
        rewardObjectFactory: () => getRewardSprite('achievements/useless/1', "Your Crown was replaced\nwith a useless ball..."),
        completeProgress: 1,
        secret: true,
    }),
    'TonsOfBalls': requireType<Achievement>({
        description: 'Have 25 balls in battle at once',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'OneBall': requireType<Achievement>({
        description: 'Win the final round with one ball',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'CompleteVictoryLap': requireType<Achievement>({
        description: 'Complete a Victory Lap',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'CompleteTwoVictoryLaps': requireType<Achievement>({
        description: 'Complete 2 Victory Laps in one game',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'NoRestocks': requireType<Achievement>({
        description: 'Win a game without restocking the shop',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'NoLevelUp': requireType<Achievement>({
        description: 'Win a game without leveling up',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'NoSell': requireType<Achievement>({
        description: 'Win a game without selling',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'NoItems': requireType<Achievement>({
        description: 'Win a game without buying an item',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'DrawsInARow': requireType<Achievement>({
        description: 'Draw 3 rounds in a row',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 3,
        secret: true,
    }),
    'WinWithGlitchedBall': requireType<Achievement>({
        description: 'Win a game with the ?/? Glitched Ball',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'WinVSGame': requireType<Achievement>({
        description: 'Win a Versus Mode game',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'WinChallengeMode': requireType<Achievement>({
        description: 'Win a Challenge Mode game',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'WinBirthdayMode': requireType<Achievement>({
        description: 'Happy Birthday\nAuto Balls!',
        rewardIconBase: 'achievements/birthday',
        rewardObjectFactory: () => getRewardSprite('achievements/birthday/1', 'Happy Birthday!!'),
        completeProgress: 1,
        secret: true,
    }),
    'PeaceWasNeverAnOption': requireType<Achievement>({
        description: 'Peace was never an option',
        rewardIconBase: 'achievements/peacewasneveranoption',
        rewardObjectFactory: () => getRewardSprite('achievements/peacewasneveranoption/1', "Win a game with Dove\nin your squad"),
        completeProgress: 1,
        secret: true,
    }),
    'NoBallsDied': requireType<Achievement>({
        description: 'Win a round without losing a ball',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'WinFast': requireType<Achievement>({
        description: 'Win a round in 3 seconds',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'GetRevenge': requireType<Achievement>({
        description: 'Revenge!',
        rewardIconBase: 'achievements/getrevenge',
        rewardObjectFactory: () => getRewardSprite('achievements/getrevenge/1', "Win a round against a\nplayer who beat you in\nthe same game"),
        completeProgress: 1,
        secret: true,
    }),
    'NumberOne': requireType<Achievement>({
        description: 'You Are Number One!',
        rewardIconBase: 'achievements/numberone',
        rewardObjectFactory: () => getRewardSprite('achievements/numberone/1', 'Place first overall\nin a Daily'),
        completeProgress: 1,
        secret: true,
    }),
    'SellBall50': requireType<Achievement>({
        description: 'Sell a ball for 50 gold',
        rewardIconBase: 'achievements/secret',
        rewardObjectFactory: () => getRewardSprite('achievements/secret/1'),
        completeProgress: 1,
        secret: true,
    }),
    'BugSquad': requireType<Achievement>({
        description: 'Bug your entire squad',
        rewardIconBase: 'achievements/bugsquad',
        rewardObjectFactory: () => getRewardSprite('achievements/bugsquad/1'),
        completeProgress: 1,
        secret: true,
    }),
}
var ACHIEVEMENTS_PROGRESS: { [ach in AchievementName]?: number } = {};
setNewAchievementsProgress();

function setNewAchievementsProgress() {
    ACHIEVEMENTS_PROGRESS = {};
    for (let ach in ACHIEVEMENTS) {
        ACHIEVEMENTS_PROGRESS[<AchievementName>ach] = 0;
    }
}

function updateAchievementProgress(achievement: AchievementName, update: (currentProgress: number) => number) {
    if (!ACHIEVEMENTS_PROGRESS) setNewAchievementsProgress();
    if (!(achievement in ACHIEVEMENTS)) return;
    ACHIEVEMENTS_PROGRESS[achievement] = update(ACHIEVEMENTS_PROGRESS[achievement]);
    saveAchievementsProgress();
}

function grantAchievement(achievement: AchievementName) {
    if (!ACHIEVEMENTS_PROGRESS) setNewAchievementsProgress();
    if (!(achievement in ACHIEVEMENTS)) return;
    if (hasCompletedAchievement(achievement)) return;
    ACHIEVEMENTS_PROGRESS[achievement] = ACHIEVEMENTS[achievement].completeProgress;
    saveAchievementsProgress();
}

function hasCompletedAchievement(achievement: AchievementName) {
    if (!ACHIEVEMENTS_PROGRESS) setNewAchievementsProgress();
    return ACHIEVEMENTS_PROGRESS[achievement] >= ACHIEVEMENTS[achievement].completeProgress;
}

function getAchievementsCompleteCount() {
    let completeCount = 0;
    let secretCompleteCount = 0;
    for (let ach in ACHIEVEMENTS) {
        if (hasCompletedAchievement(<AchievementName>ach)) {
            if (ACHIEVEMENTS[<AchievementName>ach].secret) secretCompleteCount++;
            else completeCount++;
        }
    }
    return { completeCount, secretCompleteCount };
}

function getAchievementsCount() {
    let count = Object.keys(ACHIEVEMENTS).filter(ach => !ACHIEVEMENTS[<AchievementName>ach].secret).length;
    let secretCount = Object.keys(ACHIEVEMENTS).filter(ach => ACHIEVEMENTS[<AchievementName>ach].secret).length;
    return { count, secretCount };
}

function clearAchievements() {
    if (!ACHIEVEMENTS_PROGRESS) setNewAchievementsProgress();
    for (let achievement in ACHIEVEMENTS) {
        ACHIEVEMENTS_PROGRESS[achievement] = 0;
    }
    saveAchievementsProgress();
}

function unlockAllAchievements(includeSecret?: boolean) {
    if (!ACHIEVEMENTS_PROGRESS) setNewAchievementsProgress();
    for (let achievement in ACHIEVEMENTS) {
        if (ACHIEVEMENTS[achievement].secret && !includeSecret) continue;
        ACHIEVEMENTS_PROGRESS[achievement] = Math.max(ACHIEVEMENTS_PROGRESS[achievement], ACHIEVEMENTS[achievement].completeProgress);
    }
    saveAchievementsProgress();
}

function saveAchievementsProgress() {
    LocalStorage.setString(`${global.gameCodeName}_ach`, btoa(JSON.stringify(ACHIEVEMENTS_PROGRESS)));
}

function loadAchievementsProgress() {
    if (!ACHIEVEMENTS_PROGRESS) setNewAchievementsProgress();
    let achString = LocalStorage.getString(`${global.gameCodeName}_ach`);
    if (!achString) return;
    let achivementsProgress = JSON.parse(atob(achString));

    mergeAchievementsProgresses(achivementsProgress, ACHIEVEMENTS_PROGRESS);
}

function mergeAchievementsProgressAndSave(progress: any) {
    mergeAchievementsProgresses(progress, ACHIEVEMENTS_PROGRESS);
    saveAchievementsProgress();
}

function mergeAchievementsProgresses(progress: any, into: any) {
    if (!progress || !_.isObject(progress) || Object.keys(progress).some(ach => !_.isNumber(progress[ach]))) {
        return;
    }

    for (let ach in progress) {
        if (!_.isNumber(progress[ach])) continue;
        let currentProgress = into[ach] || 0;
        into[ach] = Math.max(currentProgress, progress[ach]);
    }
}

function getRewardBall(type: number, x: number = 0, y: number = 0) {
    let ball = squadBallToWorldBall({
        x, y,
        properties: {
            type: type,
            health: 1,
            damage: 1,
            equipment: -1,
            level: 1,
            metadata: {},
        }
    }, undefined, -1, 'friend');
    ball.hideAllStats();
    ball.layer = World.DEFAULT_LAYER;
    ball.physicsGroup = undefined;
    ball.isInShop = true;
    return ball;
}

function getRewardItem(type: number) {
    let item = itemTypeToBallItem(type, 0, 0);
    item.layer = World.DEFAULT_LAYER;
    return item;
}

function getRewardSprite(texture: string, desc?: string) {
    return new Sprite({
        texture: texture,
        layer: World.DEFAULT_LAYER,
        bounds: new CircleBounds(0, 0, 10),
        tags: ['reward', 'secret'],
        data: { desc },
    });
}

function updateInGameUpdateAchievements(world: World) {
    if (!youArePlaying(world)) return;

    let friendlyBalls = world.select.typeAll(Ball).filter(ball => ball.team === 'friend' && !ball.isInShop);

    if (friendlyBalls.some(ball => ball.dmg >= 15 && ball.hp >= 15) && !hasCompletedAchievement('StrongBall')) {
        updateAchievementProgress('StrongBall', p => 1);
    }
    if (friendlyBalls.some(ball => ball.dmg >= 50 && ball.hp >= 50) && !hasCompletedAchievement('ReallyStrongBall')) {
        updateAchievementProgress('ReallyStrongBall', p => 1);
    }

    if (GAME_DATA.gold && isFinite(GAME_DATA.gold)) {
        updateAchievementProgress('HaveTwentyGold', p => Math.max(p, GAME_DATA.gold));
    }

    if (friendlyBalls.filter(ball => ball.equipment && ball.equipment instanceof Equipments.CatEars).length >= 5 && !hasCompletedAchievement('CatEarsOnSquad')) {
        updateAchievementProgress('CatEarsOnSquad', p => 1);
    }

    if (friendlyBalls.filter(ball => ball.dmg >= 7 && ball.hp >= 7).length >= 5 && !hasCompletedAchievement('StrongSquad')) {
        updateAchievementProgress('StrongSquad', p => 1);
    }

    if (friendlyBalls.some(ball => ball.level >= 5) && !hasCompletedAchievement('MidLevelBall')) {
        updateAchievementProgress('MidLevelBall', p => 1);
    }

    if (friendlyBalls.some(ball => ball.level >= 7) && !hasCompletedAchievement('HighLevelBall')) {
        updateAchievementProgress('HighLevelBall', p => 1);
    }

    if (friendlyBalls.length >= 25 && !hasCompletedAchievement('TonsOfBalls')) {
        updateAchievementProgress('TonsOfBalls', p => 1);
    }

    let maxEnemiesKilled = M.max(friendlyBalls, ball => ball.timesKilledEnemy);
    if (maxEnemiesKilled && isFinite(maxEnemiesKilled)) updateAchievementProgress('KillEnemiesInRound', p => Math.max(p, maxEnemiesKilled));

    let maxMaxSpeed = M.max(friendlyBalls, ball => ball.getBoostMaxSpeedMultiplier());
    if (maxMaxSpeed && isFinite(maxMaxSpeed)) updateAchievementProgress('BallGoBrrr', p => Math.max(p, 100*maxMaxSpeed));

    let almanacEntriesCompleted = getAlmanacEntriesCompleted();
    if (almanacEntriesCompleted && isFinite(almanacEntriesCompleted)) {
        updateAchievementProgress('CompleteBallmanacEntries', p => Math.max(p, getAlmanacEntriesCompleted()));
    }

    if (isAlmanacComplete()) {
        updateAchievementProgress('CompleteTheBallmanac', p => 1);
    }
}

ACHIEVEMENTS.C.description = "Play the sequel";