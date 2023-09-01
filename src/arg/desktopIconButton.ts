class DesktopIconButton extends Button {
    get worldObject() { return this._worldObject as Sprite; }

    private whenClicked: () => void;
    private phaseOneClicked: boolean;
    private lastClicked: number;

    constructor(whenClicked: () => void) {
        super({
            onClick: () => this.doClick(),
            onHover: () => this.doHover(),
            onUnhover: () => this.doUnhover(),
        });

        this.whenClicked = whenClicked;
        this.phaseOneClicked = false;
        this.lastClicked = 0;
    }

    update(): void {
        super.update();

        if (Input.justDown(Input.GAME_SELECT)) {
            if (!this.isHovered()) {
                this.phaseOneClicked = false;
            }
        }

        if (this.phaseOneClicked) {
            this.worldObject.tint = 0xFFFFFF;
        } else {
            this.worldObject.tint = 0x000000;
        }
    }

    private doClick() {
        let now = performance.now();

        global.game.playSound('arg/click');
        
        if (this.phaseOneClicked) {
            if (now - this.lastClicked < 500) {
                this.whenClicked();
            }
        } else {
            this.phaseOneClicked = true;
        }

        this.lastClicked = now;
    }

    private doHover() {
        this.worldObject.effects.outline.enabled = true;
        this.worldObject.effects.outline.color = 0xFFFFFF;
    }

    private doUnhover() {
        this.worldObject.effects.outline.enabled = false;
    }
}