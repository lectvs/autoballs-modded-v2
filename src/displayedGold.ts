class DisplayedGold extends SpriteText {
    private reservedGold: number;

    constructor(x: number, y: number) {
        super({
            x, y,
            layer: Battle.Layers.ui,
            anchor: Vector2.CENTER_LEFT,
        });

        this.reservedGold = 0;
    }

    update(): void {
        super.update();
        this.updateText();
    }

    updateText() {
        this.setText(`${GAME_DATA.gold - this.reservedGold}`);
    }

    addReservedGold(reservedGold: number) {
        this.reservedGold += reservedGold;
    }

    removeReservedGold(reservedGold: number) {
        this.reservedGold -= reservedGold;
    }
}