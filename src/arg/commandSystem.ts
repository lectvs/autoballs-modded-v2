namespace CommandSystem {
    export type Line = {
        isPrompt: boolean;
        spriteText: SpriteText;
        height: number;
    }
}

class CommandSystem extends WorldObject {
    private static PROMPT = '\\[~\\]$ '; //'\\[admin@p-sec-621 ~\\]$ ';

    private textOffsetX = 2;
    private textOffsetY = 1;

    private lines: CommandSystem.Line[];
    border: RectangleOutlineObject;

    constructor() {
        super({
            x: 4, y: 4,
            layer: 'commands',
        });

        this.lines = [];
        this.border = this.addChild(new RectangleOutlineObject(0, 0, 312, 232, 0xFFFFFF, 1, { layer: 'borders' }));
    }

    update(): void {
        super.update();

        let dy = this.getLocalBottomOfText() - this.world.height + 15;

        if (dy > 0) {
            this.scroll(dy);
        }
    }

    postUpdate(): void {
        super.postUpdate();
        World.Actions.moveWorldObjectToFront(this.border);
    }

    prompt() {
        let cs = this;
        return function*() {
            cs.addPrompt();
        }
    }

    output(text: string, newLine?: 'nl') {
        let cs = this;
        return function*() {
            cs.addOutput(text, newLine);
        }
    }

    executeCommand(command: string, response: string) {
        let cs = this;
        return function*() {
            yield cs.typeCommand(command);
            yield S.wait(0.1);
            cs.world.playSound('typename', { volume: 0.5 });
            yield cs.output(response, 'nl');
            yield cs.prompt();
        }
    }

    typeCommand(command: string, speed: number = 1) {
        let cs = this;
        return function*() {
            let lastCommand = cs.getLastCommand();
            lastCommand.isPrompt = false;

            yield S.either(
                addTextTyped(lastCommand.spriteText, command, 6*speed, 20*speed, p => {
                    cs.world.playSound('typename', { volume: Random.float(0.8, 1) });
                }, parts => {}),
                S.doOverTime(Infinity, _ => lastCommand.height = lastCommand.spriteText.getTextHeight()),
            );
        }
    }

    scroll(dy: number) {
        for (let line of this.lines) {
            line.spriteText.y -= dy;
        }
    }

    addOutput(text: string, newLine?: 'nl') {
        let spriteText = this.addChild(new SpriteText({
            p: this.getNextLineLocalPos(),
            text: text,
            copyFromParent: ['layer'],
        }));

        let height = spriteText.getTextHeight();
        if (newLine) {
            height += 15;
        }

        let line: CommandSystem.Line = {
            isPrompt: false,
            spriteText: spriteText,
            height: height,
        };

        this.lines.push(line);
    }

    addPrompt() {
        let spriteText = this.addChild(new SpriteText({
            p: this.getNextLineLocalPos(),
            text: CommandSystem.PROMPT,
            copyFromParent: ['layer'],
        }));

        let line: CommandSystem.Line = {
            isPrompt: true,
            spriteText: spriteText,
            height: 15,
        };

        this.lines.push(line);
    }

    getBounds() {
        return rect(this.localx, this.localy, this.border.width, this.border.height);
    }

    setBounds(x: number, y: number, width: number, height: number) {
        this.localx = x;
        this.localy = y;
        this.border.width = width;
        this.border.height = height;
    }

    private getLastCommand() {
        return _.last(this.lines);
    }

    private getLocalBottomOfText() {
        if (_.isEmpty(this.lines)) return this.textOffsetY;
        return M.max(this.lines, line => line.spriteText.localy + line.height);
    }

    private getNextLineLocalPos() {
        return vec2(this.textOffsetX, this.getLocalBottomOfText());
    }
}