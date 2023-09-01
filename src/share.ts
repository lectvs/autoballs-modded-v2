class ShareButton extends WorldObject {
    alpha: number = 1;

    private image: WorldObject & { alpha: number };
    protected shared: boolean = false;

    constructor(x: number, y: number, texture: string, shareScript: Script.Function) {
        super({
            name: `share_${texture}`,
            x, y,
            useGlobalTime: true,
        });

        let sb = this;
        this.stateMachine.addState('share', {
            callback: () => {
                this.image?.kill();
                this.image = this.addChild(new Sprite({
                    texture: texture,
                    bounds: new RectBounds(-8, -8, 16, 16),
                    data: { on: true },
                    update: function() {
                        let on = this.bounds.containsPoint(this.world.getWorldMousePosition());
                        if (on && !this.data.on) {
                            sb.onHover(false);
                        }
                        this.data.on = on;
                    }
                }));
                this.image.addModule(new Button({
                    hoverTint: 0xBBBBBB,
                    clickTint: 0x888888,
                    onClick: () => {
                        global.game.playSound('click');
                        this.setState('load');
                    }
                }));
            },
        });

        this.stateMachine.addState('load', {
            callback: () => {
                this.image?.kill();
                this.image = this.addChild(new Spinner(0, 0, 1.5, 4));
                this.image.useGlobalTime = true;
            },
            script: shareScript,
            transitions: [{ toState: 'share' }],
        });

        this.stateMachine.addState('error', {
            callback: () => {
                this.image?.kill();
                this.image = undefined;
                this.onHover(true);

            },
            transitions: [{ toState: 'share', delay: 3 }],
        });

        this.setState('share');
    }

    postUpdate(): void {
        super.postUpdate();
        World.Actions.orderWorldObjectBefore(this, this.parent);
        if (this.image) {
            this.image.alpha = this.alpha;
            World.Actions.orderWorldObjectBefore(this.image, this);
        }
    }

    onHover(errored: boolean) {
        
    }
}

class TwitterShareButton extends ShareButton {
    constructor(x: number, y: number, result: 'win' | 'loss') {
        super(x, y, 'twitterlogosmall', function*() {
            let fetchedUrl: string;
            let fetchError: string;
            Share.shareGetUrl(result, (url, error) => {
                fetchedUrl = url;
                fetchError = error;
            });

            let timeOut = 5;
            while (!fetchedUrl && !fetchError && timeOut > 0) {
                timeOut -= global.script.delta;
                yield;
            }

            if (timeOut <= 0) {
                fetchError = ERROR_TIMED_OUT;
            }

            if (fetchError) {
                console.error('Error sharing:', fetchError);
                sb.setState('error');
                return;
            }

            debug('Shared squad at url:', fetchedUrl);
            sb.shared = true;
            Share.loadUrl(fetchedUrl, result);
        });

        let sb = this;
    }

    onHover(errored: boolean): void {
        super.onHover(errored);
        let text = errored ? '[r]ERROR[/r]' : 'TWITTER';
        this.world.select.name<SpriteText>('sharetext')?.setText(text);
    }
}

class ImageShareButton extends ShareButton {
    constructor(x: number, y: number) {
        super(x, y, 'imagelogosmall', function*() {
            // if (IS_MOBILE) {
            //     let url = Share.shareGetOctetStream();
            //     let a = document.createElement('a');
            //     a.href = url;
            //     a.download = `autoballs_${GAME_ID}.png`;
            //     debug('Saved squad image on mobile');
            //     a.click();
            //     return;
            // }

            let saveBlob: Blob;
            let saveError: string;
            Share.shareSaveToClipboard((blob, err) => {
                saveBlob = blob;
                saveError = err;
            });

            let timeOut = 5;
            while (!saveBlob && !saveError && timeOut > 0) {
                timeOut -= global.script.delta;
                yield;
            }

            if (timeOut <= 0) {
                saveError = ERROR_TIMED_OUT;
            }

            if (saveError) {
                console.error('Error opening image:', saveError);
                sb.setState('error');
                return;
            }

            debug('Opened squad image in new tab');
            sb.shared = true;
            window.open(URL.createObjectURL(saveBlob), '_blank');
        });

        let sb = this;
    }

    onHover(errored: boolean): void {
        super.onHover(errored);
        let text = errored ? '[r]ERROR[/r]' : 'SAVE IMAGE';
        this.world.select.name<SpriteText>('sharetext')?.setText(text);
    }
}

namespace Share {
    export function shareGetUrl(result: 'win' | 'loss', callback: (url: string, err: string) => void) {
        prepare();
        let imageData = getSnapshot('half');
        unprepare();
        API.share(callback, GAME_DATA.squad.name, GAME_DATA.gameId, GAME_DATA.round, result, imageData);
    }

    export function loadUrl(url: string, result: 'win' | 'loss') {
        let message = encodeURIComponent(getMessage(result));
        let encodedUrl = encodeURIComponent(url);
        window.open(`https://twitter.com/intent/tweet?text=${message}&url=${encodedUrl}&hashtags=AutoBalls`);
    }

    export function shareSaveToClipboard(callback: (blob: Blob, err: string) => void) {
        prepare();
        getSnapshotBlob(callback);
        unprepare();
    }

    export function shareGetOctetStream() {
        prepare();
        let snapshot = getSnapshot('full');
        unprepare();
        return snapshot.replace("image/png", "image/octet-stream");
    }

    function prepare() {
        let yourTeamWorld = global.world.select.type(YourTeamWorld);
        if (yourTeamWorld) {
            let balls = yourTeamWorld.containedWorld.select.typeAll(Ball);
            for (let ball of balls) {
                ball.setForShare();
            }
        }
        global.world.select.name('sharetext')?.setVisible(false);
        global.world.select.name('continuebutton')?.setVisible(false);
        global.world.select.name('victorylapbutton', false)?.setVisible(false);
        global.world.select.type(TwitterShareButton)?.setVisible(false);
        global.world.select.type(ImageShareButton, false)?.setVisible(false);
        Main.forceRender();
    }

    function unprepare() {
        global.world.select.name('sharetext')?.setVisible(true);
        global.world.select.name('continuebutton')?.setVisible(true);
        global.world.select.name('victorylapbutton', false)?.setVisible(true);
        global.world.select.type(TwitterShareButton)?.setVisible(true);
        global.world.select.type(ImageShareButton, false)?.setVisible(true);
    }

    function getSnapshot(type: 'full' | 'half') {
        let canvas = type === 'full' ? getCanvasForSnapshotFull() : getCanvasForSnapshot();
        return canvas.toDataURL('image/png');
    }

    function getSnapshotBlob(callback: (blob: Blob, err: string) => void) {
        getCanvasForSnapshotFull().toBlob(blob => {
            if (!blob) {
                callback(undefined, 'blank blob');
                return;
            }
            callback(blob, undefined);
        });
    }

    function getCanvasForSnapshot() {
        let hcanvas = document.createElement('canvas');
        hcanvas.width = 320*Main.config.canvasScale;
        hcanvas.height = 167*Main.config.canvasScale;

        let hctx = hcanvas.getContext('2d');
        hctx.drawImage(
            Main.renderer.view,
            0*Main.config.canvasScale, 25*Main.config.canvasScale,
            320*Main.config.canvasScale, 167*Main.config.canvasScale,
            0*Main.config.canvasScale, 0*Main.config.canvasScale,
            320*Main.config.canvasScale, 167*Main.config.canvasScale,
        );

        return hcanvas;
    }

    function getCanvasForSnapshotFull() {
        let hcanvas = document.createElement('canvas');
        hcanvas.width = 320*Main.config.canvasScale;
        hcanvas.height = 240*Main.config.canvasScale;

        let hctx = hcanvas.getContext('2d');
        hctx.drawImage(
            Main.renderer.view,
            0*Main.config.canvasScale, 0*Main.config.canvasScale,
            320*Main.config.canvasScale, 240*Main.config.canvasScale,
            0*Main.config.canvasScale, 0*Main.config.canvasScale,
            320*Main.config.canvasScale, 240*Main.config.canvasScale,
        );

        return hcanvas;
    }

    function getMessage(result: 'win' | 'loss') {
        let messages: string[] = [];

        if (result === 'win') {
            messages.push("Auto Balls VICTORY!");
            messages.push("This game is easy B)");
            if (GAME_DATA.health === 1) messages.push("One heart left, but I did it!");
        } else {
            messages.push("Didn't quite get to the end, but check out my squad!");
            messages.push("This game is hard!");
            if (GAME_DATA.wins === GET_MAX_WINS()-2) messages.push("So close!");

            if (GAME_DATA.squad.balls.length === 0) {
                messages = ["Lost with zero balls B)"];
            }
        }

        return Random.element(messages);
    }
}