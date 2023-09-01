namespace DialogSystem {
    export type Line = {
        spriteText: SpriteText;
        height: number;
    }
}

class DialogSystem extends WorldObject {
    private textOffsetX = 50;
    private textOffsetY = -37;
    private lineMaxWidth = 214;
    private mask: TextureFilters.Mask.WorldObjectMaskConfig = {
        offsetx: 4,
        offsety: 244,
        texture: Texture.filledRect(312, 90, 0xFFFFFF),
        type: 'world',
    }

    private portrait: Sprite;
    private lines: DialogSystem.Line[];

    constructor() {
        super({
            x: 44, y: 281,
        });

        this.portrait = this.addChild(new Sprite());
        this.lines = [];
    }

    update(): void {
        super.update();

        let dy = this.getLocalBottomOfText() - 45;

        if (dy > 0) {
            for (let line of this.lines) {
                line.spriteText.y -= Math.min(dy, 120 * this.delta);
            }
        }
    }

    dialogKay(text: string) {
        let ds = this;
        return function*() {
            yield ds.dialog(text, 0xFFFFFF, 0, 1, 'kay');
            yield S.wait(1.5);
        }
    }

    dialogBeta(text: string, nowait?: 'nowait') {
        let ds = this;
        return function*() {
            yield ds.dialog(text, 0xFF0000, 8, 0.8, 'arg/tear');
            if (!nowait) yield S.wait(1.5);
        }
    }

    private dialog(text: string, color: number, offsetx: number, speed: number, sound: string) {
        let ds = this;
        return function*() {
            let line = ds.addDialog(color, offsetx);

            yield S.either(
                addTextTyped(line.spriteText, ds.wordWrap(text), 20*speed, 50*speed, (p, s) => {
                    if (p > 0.9 || Random.boolean(0.7) || s.includes('.')) {
                        ds.world.playSound(sound);
                    }
                }, parts => {
                    if (parts[0] === 'portrait') {
                        ds.showPortrait(parts[1]);
                    }
                    if (parts[0] === 'booms') {
                        global.game.playMusic('arg/booms', parts.length > 1 ? parseInt(parts[1]) : 0);
                    }
                    if (parts[0] === 'stopmusic') {
                        global.game.stopMusic(parts.length > 1 ? parseInt(parts[1]) : 0);
                    }
                }),
                S.doOverTime(Infinity, _ => line.height = line.spriteText.getTextHeight()),
            );
        }
    }

    private addDialog(color: number, offsetx: number) {
        let spriteText = this.addChild(new SpriteText({
            p: this.getNextLineLocalPos().add(offsetx, 0),
            style: { color: color },
            maxWidth: this.lineMaxWidth,
            copyFromParent: ['layer'],
            mask: this.mask,
        }));

        let line: CommandSystem.Line = {
            isPrompt: false,
            spriteText: spriteText,
            height: 15,
        };

        this.lines.push(line);
        return line;
    }

    showPortrait(id: string) {
        let oldPortrait = this.portrait;
        let mask: TextureFilters.Mask.WorldObjectMaskConfig = {
            offsetx: -40,
            offsety: -120,
            texture: Texture.filledRect(80, 80, 0xFFFFFF),
            type: 'local',
        };
        this.portrait = this.addChild(new Sprite({
            texture: `arg/kayportraits/${id}`,
            mask: mask,
        }));

        this.runScript(function*() {
            yield S.doOverTime(0.5, t => mask.offsety = t === 1 ? -40 : M.roundToNearest(M.lerp(-120, -40, t)+3, 4)-3);
            oldPortrait.kill();
        });
    }

    private getLocalBottomOfText() {
        if (_.isEmpty(this.lines)) return this.textOffsetY;
        return M.max(this.lines, line => line.spriteText.localy + line.height) + 8;
    }

    private getNextLineLocalPos() {
        return vec2(this.textOffsetX, this.getLocalBottomOfText());
    }

    private wordWrap(text: string) {
        let i = 0;
        let result = "";
        let currentWord = "";
        let currentLineWidth = 0;
        let currentWordWidth = 0;

        text += " ";

        while (i < text.length) {
            if (text[i] === '{') {
                let j = text.indexOf('}', i);
                currentWord += text.substring(i, j+1);
                i = j+1;
                continue;
            }

            if (text[i] === '[') {
                let j = text.indexOf(']', i);
                currentWord += text.substring(i, j+1);
                i = j+1;
                continue;
            }

            if (text[i] === '<') {
                let j = text.indexOf('>', i);
                currentWord += text.substring(i, j+1);
                i = j+1;
                continue;
            }

            if (text[i] === ' ' || text[i] === '\n') {
                if (result.length === 0 || result[result.length-1] === '\n') {
                    result += currentWord;
                    currentLineWidth += currentWordWidth;
                } else if (currentLineWidth + 8 + currentWordWidth <= this.lineMaxWidth) {
                    result += " " + currentWord;
                    currentLineWidth += 8 + currentWordWidth;
                } else {
                    result += '\n' + currentWord;
                    currentLineWidth = currentWordWidth;
                }

                if (text[i] === '\n') {
                    result += '\n';
                    currentLineWidth = 0;
                }

                currentWord = "";
                currentWordWidth = 0;
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
                currentWordWidth += 8;
            }

            currentWord += textToAdd;
            i++;
        }

        return result;
    }
}