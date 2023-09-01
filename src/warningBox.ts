class WarningBox extends Sprite {
    private static WIDTH = 184;
    private static HEIGHT = 84;
    private static PADDING = 6;

    private content: Sprite | SpriteText;
    private cancelButton: MenuTextButton;
    private playButton: MenuTextButton;

    constructor(x: number, y: number, tipe: 'gold' | 'noballs', onPlay: () => void) {
        super({
            x, y,
            texture: InfoBox.getTextureForSize(WarningBox.WIDTH, WarningBox.HEIGHT),
            layer: Battle.Layers.warning,
        });

        if (tipe === 'gold') {
            this.content = this.addChild(new SpriteText({
                y: -WarningBox.HEIGHT/2 + WarningBox.PADDING,
                text: `Gold does not carry over to the next round! Continue?`,
                anchor: Vector2.TOP,
                maxWidth: WarningBox.WIDTH - 2*WarningBox.PADDING,
                copyFromParent: ['layer'],
            }));
        } else {
            if (loadNoBalls()) {
                this.content = this.addChild(new Sprite({
                    x: -1, y: -WarningBox.HEIGHT/2 + WarningBox.PADDING - 3,
                    texture: 'noballs',
                    copyFromParent: ['layer'],
                }));
            } else {
                this.content = this.addChild(new SpriteText({
                    y: -WarningBox.HEIGHT/2 + WarningBox.PADDING + 8,
                    text: `Your squad has no balls! Continue?`,
                    anchor: Vector2.TOP,
                    maxWidth: WarningBox.WIDTH - 2*WarningBox.PADDING,
                    copyFromParent: ['layer'],
                }));
                saveNoBalls(true);
            }
        }

        this.cancelButton = this.addChild(new MenuTextButton({
            x: -WarningBox.WIDTH/2 + WarningBox.PADDING + 8, y: WarningBox.HEIGHT/2 - WarningBox.PADDING,
            text: "Cancel",
            anchor: Vector2.BOTTOM_LEFT,
            copyFromParent: ['layer'],
            onClick: () => {
                global.game.playSound('click');
                WarningBox.hide(this.world);
            }
        }));

        this.playButton = this.addChild(new MenuTextButton({
            x: WarningBox.WIDTH/2 - WarningBox.PADDING - 8, y: WarningBox.HEIGHT/2 - WarningBox.PADDING,
            text: "Play >",
            anchor: Vector2.BOTTOM_RIGHT,
            copyFromParent: ['layer'],
            onClick: () => {
                global.game.playSound('click');
                WarningBox.hide(this.world);
                onPlay();
            }
        }));
    }

    postUpdate() {
        super.postUpdate();

        World.Actions.orderWorldObjectAfter(this.content, this);
        World.Actions.orderWorldObjectAfter(this.cancelButton, this);
        World.Actions.orderWorldObjectAfter(this.playButton, this);
    }
}

namespace WarningBox {
    export function isShowing(world: World) {
        return !!world.select.type(WarningBox, false);
    }

    export function show(world: World, tipe: 'gold' | 'noballs', onPlay: () => void) {
        world.addWorldObject(new WarningBox(world.width/2, world.height/2, tipe, onPlay));
        world.select.type(BallMover)?.removeFromWorld();
        world.select.type(BallFreezer)?.removeFromWorld();
        world.select.type(BallHighlighter)?.removeFromWorld();
        world.select.type(InfoBox)?.removeFromWorld();

        let boundsInfoBox = world.select.type(BoundsInfoBox)
        if (boundsInfoBox) boundsInfoBox.enabled = false;

        let restockButton = world.select.name<Sprite>('restockbutton').getModule(Button);
        if (restockButton) restockButton.enabled = false;

        let playButton = world.select.name<Sprite>('playbutton').getModule(Button);
        if (playButton) playButton.enabled = false;

        let playButtonVs = world.select.name<Sprite>('playbutton_vs').getModule(Button);
        if (playButtonVs) playButtonVs.enabled = false;
    }

    export function hide(world: World) {
        if (!world.select.type(BallMover, false)) world.addWorldObject(new BallMover());
        if (!world.select.type(BallFreezer, false)) world.addWorldObject(new BallFreezer());
        if (!world.select.type(BallHighlighter, false)) world.addWorldObject(new BallHighlighter());
        if (!world.select.type(InfoBox, false)) world.addWorldObject(new InfoBox());
        world.select.typeAll(WarningBox).forEach(wb => wb.removeFromWorld());

        
        let boundsInfoBox = world.select.type(BoundsInfoBox)
        if (boundsInfoBox) boundsInfoBox.enabled = true;

        let restockButton = world.select.name<Sprite>('restockbutton').getModule(Button);
        if (restockButton) restockButton.enabled = true;

        let playButton = world.select.name<Sprite>('playbutton').getModule(Button);
        if (playButton) playButton.enabled = true;

        let playButtonVs = world.select.name<Sprite>('playbutton_vs').getModule(Button);
        if (playButtonVs) playButtonVs.enabled = true;
    }
}