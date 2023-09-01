abstract class Scientist extends Sprite {
    abstract idle(): void;
    abstract pause(): void;
    abstract look(d: 'down' | 'left' | 'right' | 'up'): void;
    abstract lookImmediate(d: 'down' | 'left' | 'right' | 'up'): void;
    abstract unlook(): void;
}

class NullScientist extends Scientist {
    idle() {}
    pause() {}
    look(d: 'down' | 'left' | 'right' | 'up') {}
    lookImmediate(d: 'down' | 'left' | 'right' | 'up') {}
    unlook() {}
}

class Scientist1 extends Scientist {
    constructor(x: number, y: number) {
        super({
            x, y,
            layer: ARG.Layers.onground,
            animations: [
                Animations.fromTextureList({ name: 'idle',   textureRoot: 'arg/scientist1', textures: [0, 1], frameRate: 4, count: Infinity }),
                Animations.fromTextureList({ name: 'look',   textureRoot: 'arg/scientist1', textures: [0, 2, 2, 3], frameRate: 8, nextFrameRef: 'look/3' }),
                Animations.fromTextureList({ name: 'unlook', textureRoot: 'arg/scientist1', textures: [3, 3, 2, 1], frameRate: 4, nextFrameRef: 'idle/0' }),
            ],
            defaultAnimation: 'idle',
        });
    }

    idle() {
        this.playAnimation('idle');
    }

    pause() {
        this.animationManager.stop();
    }

    look(d: 'down' | 'left' | 'right' | 'up') {
        this.playAnimation('look');
    }

    lookImmediate(d: 'down' | 'left' | 'right' | 'up') {
        this.animationManager.setCurrentFrame('look/3');
    }

    unlook() {
        //this.playAnimation('unlook');
        this.playAnimation('idle');
    }
}

class Scientist2 extends Scientist {
    private current_d: 'down' | 'left' | 'right' | 'up';

    constructor(x: number, y: number) {
        super({
            x, y,
            layer: ARG.Layers.onground,
            animations: [
                Animations.fromTextureList({ name: 'idle',         textureRoot: 'arg/scientist2', textures: [0, 1], frameRate: 4, count: Infinity }),
                Animations.fromTextureList({ name: 'look_right',   textureRoot: 'arg/scientist2', textures: [0, 2, 2, 3], frameRate: 8, nextFrameRef: 'look_right/3' }),
                Animations.fromTextureList({ name: 'look_down',    textureRoot: 'arg/scientist2', textures: [0, 4, 4, 5], frameRate: 8, nextFrameRef: 'look_down/3' }),
                Animations.fromTextureList({ name: 'look_up',      textureRoot: 'arg/scientist2', textures: [0, 6, 6, 7], frameRate: 8, nextFrameRef: 'look_up/3' }),
                Animations.fromTextureList({ name: 'unlook_right', textureRoot: 'arg/scientist2', textures: [3, 3, 2, 1], frameRate: 4, nextFrameRef: 'idle/0' }),
                Animations.fromTextureList({ name: 'unlook_down',  textureRoot: 'arg/scientist2', textures: [5, 5, 4, 1], frameRate: 4, nextFrameRef: 'idle/0' }),
                Animations.fromTextureList({ name: 'unlook_up',    textureRoot: 'arg/scientist2', textures: [7, 7, 6, 1], frameRate: 4, nextFrameRef: 'idle/0' }),
            ],
            defaultAnimation: 'idle',
        });
        this.current_d = 'right';
    }

    idle() {
        this.playAnimation('idle');
    }

    pause() {
        this.animationManager.stop();
    }

    look(d: 'down' | 'left' | 'right' | 'up') {
        this.playAnimation(`look_${d}`);
        this.current_d = d;
    }

    lookImmediate(d: 'down' | 'left' | 'right' | 'up') {
        this.animationManager.setCurrentFrame(`look_${d}/3`);
        this.current_d = d;
    }

    unlook() {
        //this.playAnimation(`unlook_${this.current_d}`);
        this.playAnimation('idle');
    }
}

class Scientist3 extends Scientist {
    private current_d: 'down' | 'left' | 'right' | 'up';

    constructor(x: number, y: number) {
        super({
            x, y,
            layer: ARG.Layers.onground,
            animations: [
                Animations.fromTextureList({ name: 'idle',         textureRoot: 'arg/scientist3', textures: [0, 1], frameRate: 4, count: Infinity }),
                Animations.fromTextureList({ name: 'look_right',   textureRoot: 'arg/scientist3', textures: [0, 2, 2, 3], frameRate: 8, nextFrameRef: 'look_right/3' }),
                Animations.fromTextureList({ name: 'look_down',    textureRoot: 'arg/scientist3', textures: [0, 4, 4, 5], frameRate: 8, nextFrameRef: 'look_down/3' }),
                Animations.fromTextureList({ name: 'look_up',      textureRoot: 'arg/scientist3', textures: [0, 6, 6, 7], frameRate: 8, nextFrameRef: 'look_up/3' }),
                Animations.fromTextureList({ name: 'look_left',    textureRoot: 'arg/scientist3', textures: [0, 8, 8, 9], frameRate: 8, nextFrameRef: 'look_left/3' }),
                Animations.fromTextureList({ name: 'unlook_right', textureRoot: 'arg/scientist3', textures: [3, 3, 2, 1], frameRate: 4, nextFrameRef: 'idle/0' }),
                Animations.fromTextureList({ name: 'unlook_down',  textureRoot: 'arg/scientist3', textures: [5, 5, 4, 1], frameRate: 4, nextFrameRef: 'idle/0' }),
                Animations.fromTextureList({ name: 'unlook_up',    textureRoot: 'arg/scientist3', textures: [7, 7, 6, 1], frameRate: 4, nextFrameRef: 'idle/0' }),
                Animations.fromTextureList({ name: 'unlook_left',  textureRoot: 'arg/scientist3', textures: [9, 9, 8, 1], frameRate: 4, nextFrameRef: 'idle/0' }),
            ],
            defaultAnimation: 'idle',
        });
        this.current_d = 'right';
    }

    idle() {
        this.playAnimation('idle');
    }

    pause() {
        this.animationManager.stop();
    }

    look(d: 'down' | 'left' | 'right' | 'up') {
        this.playAnimation(`look_${d}`);
        this.current_d = d;
    }

    lookImmediate(d: 'down' | 'left' | 'right' | 'up') {
        this.animationManager.setCurrentFrame(`look_${d}/3`);
        this.current_d = d;
    }

    unlook() {
        //this.playAnimation(`unlook_${this.current_d}`);
        this.playAnimation('idle');
    }
}