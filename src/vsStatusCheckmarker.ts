class VsStatusCheckmarker extends WorldObject {
    private yourCheckmark: Sprite;
    private enemyCheckmark: Sprite;

    constructor(yourCheckmark: Sprite, enemyCheckmark: Sprite) {
        super();
        this.yourCheckmark = yourCheckmark;
        this.enemyCheckmark = enemyCheckmark;

        this.addTimer(2, () => this.fetchAndUpdate(), Infinity);
    }

    private fetchAndUpdate() {
        API.getvsgame((vsgame, err) => {
            this.yourCheckmark.setVisible(!!vsgame.yoursquad);
            this.enemyCheckmark.setVisible(!!vsgame.enemysquad);
        }, GAME_DATA.gameId, VS_GAME.yourname, false, false, Persistence.getProfileId());
    }
}