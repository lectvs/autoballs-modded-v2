function patchSnapshots(snapshots: Texture[], callback: (blob: Blob, err: string) => void) {
    let mainCanvas = document.createElement('canvas');
    mainCanvas.width = M.max(snapshots, s => s.width)*Main.config.canvasScale;
    mainCanvas.height = A.sum(snapshots, s => s.height)*Main.config.canvasScale;
    let ctx = mainCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let currentY = 0;
    for (let snapshot of snapshots) {
        let canvas = snapshot.toCanvas();
        ctx.drawImage(
            canvas,
            0, 0,
            snapshot.width, snapshot.height,
            0*Main.config.canvasScale, currentY*Main.config.canvasScale,
            snapshot.width*Main.config.canvasScale, snapshot.height*Main.config.canvasScale,
        );
        currentY += snapshot.height;
    }

    mainCanvas.toBlob(blob => {
        if (!blob) {
            callback(undefined, 'blank blob');
            return;
        }
        callback(blob, undefined);
    });
}

class PatchedSnapshotsShareButton extends ShareButton {
    constructor(x: number, y: number, snapshots: Texture[]) {
        super(x, y, 'imagelogosmall', function*() {
            let saveBlob: Blob;
            let saveError: string;
            patchSnapshots(snapshots, (blob, err) => {
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