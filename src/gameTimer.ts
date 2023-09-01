class GameTimer extends WorldObject {
    constructor() {
        super({
            useGlobalTime: true
        });
    }

    update(): void {
        super.update();

        GAME_DATA.gameTime += this.delta;
    }
}