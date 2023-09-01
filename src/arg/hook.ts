class ArgHook extends Sprite {
    constructor(x: number, y: number) {
        super({
            x, y,
            texture: 'arg/hook',
        });

        this.stateMachine.addState('idle', {
            transitions: [{ toState: 'moving', condition: () => this.isMouseCloseEnough() }],
        });
        this.stateMachine.addState('moving', {
            update: () => {
                let mouseBounds = this.world.getWorldMouseBounds();
                this.teleport(mouseBounds);

                if (this.isCollidingWithWalls()) {
                    this.world.playSound('shake2');
                    global.game.stopMusic();
                    this.setState('dying');
                }
            },
        });
        this.stateMachine.addState('dying', {
            update: () => {
                if (this.everyNFrames(4)) {
                    this.setVisible(!this.isVisible());
                }
            },
            transitions: [{ toState: 'dead', delay: 2 }],
        });
        this.stateMachine.addState('dead', {
            update: () => {
                this.setVisible(true);
            },
        });
    }

    postUpdate(): void {
        super.postUpdate();

        if (this.state === 'dead') {
            if (this.y > this.world.camera.y + 64) this.y = this.world.camera.y + 64;
            if (this.y < 280) this.y = 280;
        }
    }

    private lastRsy: number = 0;
    getRenderScreenY(): number {
        let rsy = super.getRenderScreenY();
        if (rsy <= this.lastRsy && rsy >= this.lastRsy-1.1) return this.lastRsy;
        this.lastRsy = rsy;
        return rsy;
    }

    private isMouseCloseEnough() {
        return true; //G.distance(this, this.world.getWorldMouseBounds()) < 50;
    }

    private isCollidingWithWalls() {
        let walls = this.world.select.name<Sprite>('walls');
        
        let r = 2;
        let n = 8;
        for (let i = 0; i < n; i++) {
            let px = this.x + r*M.cos(360*i/n);
            let py = this.y + r*M.sin(360*i/n);
            let wallsColor = Color.argbToVec4(walls.getTexture().getPixelRelativeARGB(px - walls.x, py - walls.y));
            if (wallsColor[0] > 0.5) {
                return true;
            }
        }

        return false;
    }
}