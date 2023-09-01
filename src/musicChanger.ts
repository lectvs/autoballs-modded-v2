function selectRandomShopMusic(gameId: string) {
    if (!gameId || gameId.length < 2) return 'music/shop';
    if (gameId.charCodeAt(0) % 2 === 1) return 'music/shop2';
    return 'music/shop';
}

function selectRandomBattleMusic(gameId: string) {
    if (!gameId || gameId.length < 2) return 'music/battle';
    if (gameId.charCodeAt(1) % 2 === 1) return 'music/battle2';
    return 'music/battle';
}

function pickMusicForThisRoundShop(gameData: GameData) {
    let musicType = getMusicType();
    if (musicType === 'Random') return gameData.shopMusic;
    if (musicType === 'Side A') return 'music/shop';
    if (musicType === 'Side B') return 'music/shop2';
    if (musicType === 'Themed') return _.includes(gameData.packs, 'classic') ? 'music/shop' : 'music/shop2';
    console.error('Invalid musicType:', musicType);
    return 'music/shop';
}

function pickMusicForThisRoundBattle(gameData: GameData) {
    let musicType = getMusicType();
    if (musicType === 'Random') return gameData.battleMusic;
    if (musicType === 'Side A') return 'music/battle';
    if (musicType === 'Side B') return 'music/battle2';
    if (musicType === 'Themed') return _.includes(gameData.packs, 'classic') ? 'music/battle' : 'music/battle2';
    console.error('Invalid musicType:', musicType);
    return 'music/battle';
}

class MusicChanger extends WorldObject {
    update(): void {
        super.update();
        if (!this.everyNSeconds(0.5)) return;

        let battleState = getBattleState(this.world);

        if (!battleState || battleState === Ball.States.PREP) {
            let currentMusic = global.game.musicManager.currentMusicKey;
            let newMusic = pickMusicForThisRoundShop(GAME_DATA);

            if (currentMusic?.includes('shop') && currentMusic !== newMusic) {
                global.game.musicManager.playMusic(newMusic, 1);
            }
        }

        if (battleState === Ball.States.BATTLE) {
            let currentMusic = global.game.musicManager.currentMusicKey;
            let newMusic = pickMusicForThisRoundBattle(GAME_DATA);

            if (currentMusic?.includes('battle') && currentMusic !== newMusic) {
                global.game.musicManager.playMusic(newMusic, 1);
            }
        }
    }
}