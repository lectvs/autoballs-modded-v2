class BattleSpeedController extends WorldObject {
    paused: boolean = false;
    speed: number = 1;
    enabled: boolean = true;
    endOfGame: boolean = false;

    private touchTime: number = 0;

    private producedTimescale: number = 1;

    constructor() {
        super({
            useGlobalTime: true,
        });
    }

    update() {
        super.update();

        let world = global.theater.currentWorld ?? this.world;

        if (this.enabled) {
            if (IS_MOBILE) {
                this.updateSpeedMobile(world);
            } else {
                this.updateSpeedPc(world);
            }

            let targetSpeed = this.paused ? 0 : this.speed;
            this.producedTimescale = M.lerpTime(this.producedTimescale, targetSpeed, 10, global.game.delta);
        }
    }

    getProducedTimescale() {
        if (this.enabled) return this.producedTimescale;
        return 1;
    }

    reset() {
        this.paused = false;
        this.speed = 1;
        this.producedTimescale = 1;
        this.enabled = false;
        this.endOfGame = false;
    }

    private canControl(world: World) {
        if (!world) return false;
        if (world.select.modules(Button).some(button => button.isHovered())) return false;
        return true;
    }

    private updateSpeedPc(world: World) {
        if (!this.canControl(world)) return;

        if (Input.justDown('pausebattle')) {
            this.pause(world);
        }

        if (Input.justDown('speedupbattle')) {
            this.speedUp();
        }
    }

    private updateSpeedMobile(world: World) {
        if (!this.canControl(world)) return;

        if (Input.isDown('lmb')) {
            let lastTouchTime = this.touchTime;
            this.touchTime += this.delta;

            let infoBox = world.select.type(InfoBox, false);
            let infoBoxTriggering = infoBox?.isTriggering;

            let speedUpRate = 3;
            if ((getBattleState(world) === Ball.States.BATTLE || !infoBoxTriggering) && !this.paused && this.touchTime > 1/speedUpRate && Math.floor(lastTouchTime*speedUpRate) !== Math.floor(this.touchTime*speedUpRate)) {
                this.speedUp();
            }

            return;
        }

        if (this.touchTime === 0) return;

        if (this.touchTime < 0.33) {
            this.pause(world);
            this.touchTime = 0;
            return;
        }

        this.touchTime = 0;
    }

    private pause(world: World) {
        this.paused = !this.paused;
        this.speed = 1;
        if (this.paused) {
            world.select.typeAll(Ball).forEach(ball => ball.showAllStats());
            global.game.musicManager.pauseMusic();
            global.theater.playSound('pause', { humanized: false });
        } else {
            if (getBattleState(world) === Ball.States.BATTLE) {
                world.select.typeAll(Ball).forEach(ball => ball.hideAllStats());
            }
            global.game.musicManager.unpauseMusic();
            global.theater.playSound('unpause', { humanized: false });
        }
        this.flashSprite('pause');
    }

    private speedUp() {
        this.paused = false;
        if (this.speed < 4) {
            this.speed++;
            this.flashSprite('fastforward');
            global.game.musicManager.unpauseMusic();
            global.theater.playSound('speedup', { humanized: false });
        }
    }

    private flashSprite(texture: string) {
        global.theater.addWorldObject(new Sprite({
            x: global.gameWidth/2, y: global.gameHeight/2,
            texture,
            layer: Theater.LAYER_SLIDES,
            life: 0.5,
            update: function() {
                this.alpha = 1 - this.life.progress;
            },
        }));
    }
}