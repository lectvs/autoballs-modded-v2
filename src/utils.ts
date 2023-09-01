function addTextTyped(spriteText: SpriteText, text: string, typeSpeedMin: number, typeSpeedMax: number, onType: (progress: number, currentSymbol: string) => void, onCustomCommand: (parts: string[]) => void) {
    return function*() {
        let i = 0;
        let currentSpeed = 1;
        while (i < text.length) {
            if (text[i] === '{') {
                let j = text.indexOf('}', i);
                let tag = text.substring(i+1, j);
                let parts = tag.split(' ');
                if (parts[0] === 'wait') {
                    yield S.wait(parseFloat(parts[1]));
                } else if (parts[0] === 'speed') {
                    currentSpeed = parseFloat(parts[1]);
                } else {
                    onCustomCommand(parts);
                }
                i = j+1;
                continue;
            }

            if (text[i] === '[') {
                let j = text.indexOf(']', i);
                spriteText.setText(spriteText.getCurrentText() + text.substring(i, j+1));
                i = j+1;
                continue;
            }

            if (text[i] === '<') {
                let j = text.indexOf('>', i);
                spriteText.setText(spriteText.getCurrentText() + text.substring(i, j+1));
                i = j+1;
                continue;
            }

            if (text[i] === ' ' || text[i] === '\n') {
                spriteText.setText(spriteText.getCurrentText() + text[i]);
                if (i > 0) {
                    if (text[i-1] === ',') yield S.wait(0.15);
                    if (text[i-1] === '.' || text[i-1] === '?' || text[i-1] === '!') yield S.wait(0.5);
                }
                i++;
                continue;
            }

            // Regular text
            let textToAdd = '';
            if (text[i] === '\\') {
                textToAdd += text[i];
                i++;
            }

            if (i < text.length) {
                textToAdd += text[i];
            }

            spriteText.setText(spriteText.getCurrentText() + textToAdd);
            onType(i / text.length, i < text.length ? text[i] : '');

            yield S.wait(Random.float(1/currentSpeed/typeSpeedMax, 1/currentSpeed/typeSpeedMin));
            i++;
        }
    }
}

const ARENA_FIRST_NAME = 'Classic';
const ARENA_BDAY_NAME = 'Birthday';
const ARENA_SPACE_NAME = 'Core';
const ARENA_ICE_NAME = 'Frozen';
const ARENA_GRAVITY_NAME = 'Trampoline';
const ARENA_FACTORY_NAME = 'Factory';

function arenaIdToName(id: string) {
    if (id === Arenas.ARENA_BDAY) return ARENA_BDAY_NAME;
    if (id === Arenas.ARENA_SPACE) return ARENA_SPACE_NAME;
    if (id === Arenas.ARENA_ICE) return ARENA_ICE_NAME;
    if (id === Arenas.ARENA_GRAVITY) return ARENA_GRAVITY_NAME;
    if (id === Arenas.ARENA_FACTORY) return ARENA_FACTORY_NAME;
    return ARENA_FIRST_NAME;
}

function arenaNameToId(name: string) {
    if (name === ARENA_BDAY_NAME) return Arenas.ARENA_BDAY;
    if (name === ARENA_SPACE_NAME) return Arenas.ARENA_SPACE;
    if (name === ARENA_ICE_NAME) return Arenas.ARENA_ICE;
    if (name === ARENA_GRAVITY_NAME) return Arenas.ARENA_GRAVITY;
    if (name === ARENA_FACTORY_NAME) return Arenas.ARENA_FACTORY;
    return Arenas.ARENA_FIRST;
}

function buffText(dmg: number | string, hp: number | string) {
    return `[r]${dmg}<sword>[/r] [g]${hp}<heart>[/g]`;
}

function crownedName(name: string) {
    return `[gold][offsetx -3]<crown>[/offsetx][/gold]${name}`;
}

function getAllies(world: World, source: Ball) {
    if (!world) return [source];
    return world.select.typeAll(Ball).filter(ball => ball.team === source.team && ball.alive && !ball.dead);
}

function getAlliesNotSelf(world: World, source: Ball) {
    if (!world) return [];
    return getAllies(world, source).filter(ball => ball !== source);
}

function getEnemies(world: World, source: Ball) {
    if (!world) return [];
    return world.select.typeAll(Ball).filter(ball => ball.team !== source.team && ball.alive && !ball.dead);
}

function glitchSmall(world: World) {
    return function*() {
        let g = new Effects.Filters.Glitch(30, 1, 30);
        g.setUniform('t', Random.float(0, 10));
        world.effects.post.filters.push(g);

        let glitchSound = world.playSound('arg/glitch_dialog');
        glitchSound.volume = 0.5;
        yield S.wait(0.3);
        glitchSound.stop();

        A.removeAll(world.effects.post.filters, g);
    }
}

function hash(s: string): number {
    // From https://stackoverflow.com/a/15710692
    return s.split("").reduce(function(a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
}

function juiceObject(obj: WorldObject & { scaleX: number, scaleY: number }, power: number) {
    obj.data.juiceScript?.finishImmediately();

    let startScaleX = obj.scaleX;
    let startScaleY = obj.scaleY;

    obj.data.juiceScript = obj.runScript(function*() {
        yield [
            S.tween(0.5, obj, 'scaleX', (1.2**power) * startScaleX, startScaleX, Tween.Easing.OutElastic(1)),
            S.tween(0.5, obj, 'scaleY', (0.85**power) * startScaleY, startScaleY, Tween.Easing.OutElastic(1)),
        ];
    });
}

function juiceButton(power: number) {
    return function(this: Button) {
        let worldObject = this.worldObject;
        if (!(worldObject instanceof Sprite)) return;
        let sprite = worldObject as Sprite;

        juiceObject(sprite, power);
    }
}

const PACK_CLASSIC_NAME = 'Classic';
const PACK_COMMUNITY_NAME = 'Community';
const PACK_WEEKLY_NAME = 'Shuffle';

const PACK_ALL_NAME = 'All';
const PACK_ALL_ID = 'all';

function packIdToName(id: string) {
    if (id === 'classic') return PACK_CLASSIC_NAME;
    if (id === 'community') return PACK_COMMUNITY_NAME;
    if (id === 'weekly') return PACK_WEEKLY_NAME;
    return 'Unknown';
}

function packNameToId(name: string) {
    if (name === PACK_CLASSIC_NAME) return 'classic';
    if (name === PACK_COMMUNITY_NAME) return 'community';
    if (name === PACK_WEEKLY_NAME) return 'weekly';
    return 'classic';
}

function playMusicNoRestart(key: string, fadeTime?: number) {
    if (global.game.musicManager.currentMusicKey !== key) global.game.playMusic(key, fadeTime)
}

class RectangleOutlineObject extends WorldObject {
    width: number;
    height: number;
    color: number;
    alpha: number;

    constructor(x: number, y: number, width: number, height: number, color: number, alpha: number, config: WorldObject.Config = {}) {
        super({ x, y, ...config });
        this.width = width;
        this.height = height;
        this.color = color;
        this.alpha = alpha;
    }

    render(texture: Texture, x: number, y: number): void {
        if (this.width > 0 && this.height > 0) {
            Draw.brush.color = this.color;
            Draw.brush.alpha = this.alpha;
            Draw.brush.thickness = 1;
            Draw.rectangleOutline(texture, x, y, this.width, this.height, Draw.ALIGNMENT_INNER);
        }
        super.render(texture, x, y);
    }
}

function secondsToFormattedTime(seconds: number) {
    seconds = Math.max(seconds, 0);
    
    let left = Math.ceil(seconds);
    let s = left % 60;
    left = (left - s) / 60;
    let m = left % 60;
    left = (left - m) / 60;
    let h = left;

    let spadded = St.padLeft(`${s}`, 2, '0');
    let mpadded = St.padLeft(`${m}`, 2, '0');

    if (h === 0) {
        return `${m}:${spadded}`;
    }

    return `${h}:${mpadded}:${spadded}`;
}

function shake(world: World, intensity: number, time: number) {
    return function*() {
        if (!world || world === _MENUS_ARENA_WORLD || world.camera.shakeIntensity >= intensity) return;
        world.camera.shakeIntensity += intensity;
        let timer = new Timer(time);
        while (!timer.done) {
            timer.update(global.script.delta);
            yield;
        }
        world.camera.shakeIntensity -= intensity;
    }
}

// Transform from YYYY-MM-DD to MM/DD
function transformDailyDate(date: string) {
    let month = date[5] === '0' ? date.substring(6, 7) : date.substring(5, 7);
    let day = date[8] === '0' ? date.substring(9, 10) : date.substring(8, 10);

    return `${month}/${day}`;
}

function waitWithTimeout(timeoutMs: number, result: { err: string, done: boolean }, fn: () => void, ) {
    return function*() {
        let startTime = Date.now();

        fn();
        yield S.waitUntil(() => result.done || Date.now() - startTime > timeoutMs);
        if (!result.done) {
            result.err = 'TIMED_OUT';
        }
    }
}
