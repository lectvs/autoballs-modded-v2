class Keyboard extends WorldObject {
    private numberKeys: Keyboard.Key[];
    private lowercaseKeys: Keyboard.Key[];
    private uppercaseKeys: Keyboard.Key[];
    private spaceKey: Keyboard.Key;
    private backspaceKey: Keyboard.Key;
    private shiftKey: Keyboard.Key;
    private enterKey: Keyboard.Key;

    private type: 'full' | 'gameid';
    private shifted: boolean;

    constructor(x: number, y: number, onTypeCharacter: (char: string) => void, type: 'full' | 'gameid') {
        super({
            x, y,
        });

        let keys = this.createKeys(onTypeCharacter, type);
        this.numberKeys = keys.numberKeys;
        this.lowercaseKeys = keys.lowercaseKeys;
        this.uppercaseKeys = keys.uppercaseKeys;
        this.spaceKey = keys.spaceKey;
        this.backspaceKey = keys.backspaceKey;
        this.shiftKey = keys.shiftKey;
        this.enterKey = keys.enterKey;

        this.type = type;
        this.shifted = false;
        this.convertToType();
    }

    onAdd() {
        super.onAdd();
        this.addChildren(this.numberKeys);
        this.addChildren(this.lowercaseKeys);
        this.addChildren(this.uppercaseKeys);
        this.addChild(this.spaceKey);
        this.addChild(this.backspaceKey);
        this.addChild(this.shiftKey);
        this.addChild(this.enterKey);
    }

    private createKeys(onTypeCharacter: (char: string) => void, type: 'full' | 'gameid') {
        let numberKeys: Keyboard.Key[] = [];
        for (let i = 1; i <= 10; i++) {
            numberKeys.push(Keyboard.charKey(M.equidistantLine(0, 24, 10, i-1), -48, `${i % 10}`, onTypeCharacter));
        }

        let lowercaseKeys: Keyboard.Key[] = [];
        let uppercaseKeys: Keyboard.Key[] = [];
        for (let i = 0; i < 26; i++) {
            let x: number, y: number;
            if (i < 8) {
                x = M.equidistantLine(-17, 24, 8, i);
                y = -24;
            } else if (i < 18) {
                x = M.equidistantLine(0, 24, 10, i-8);
                y = 0;
            } else {
                x = M.equidistantLine(-17, 24, 8, i-18);
                y = 24;
            }
            lowercaseKeys.push(Keyboard.charKey(x, y, A.ALPHABET_LOWERCASE[i], char => {
                onTypeCharacter(char);
                if (this.shifted) this.shift();
            }));
            uppercaseKeys.push(Keyboard.charKey(x, y, A.ALPHABET_UPPERCASE[i], char => {
                onTypeCharacter(char);
                if (this.shifted) this.shift();
            }));
        }

        let spaceKey = Keyboard.spaceKey(0, 50, char => {
            onTypeCharacter(char);
            if (this.shifted) this.shift();
        });
        let backspaceKey = Keyboard.backspaceKey(96, -24, char => {
            onTypeCharacter(char);
            if (this.shifted) this.shift();
        });
        let shiftKey = Keyboard.shiftKey(96, 24, () => {
            global.world.playSound('typename');
            this.shift();
        });
        let enterKey = Keyboard.enterKey(89, 50, onTypeCharacter);

        return { numberKeys, lowercaseKeys, uppercaseKeys, spaceKey, backspaceKey, shiftKey, enterKey };
    }

    private convertToType() {
        if (this.type === 'full') {
            this.uppercaseKeys.forEach(key => key.disable());
        } else if (this.type === 'gameid') {
            this.spaceKey.disable();
            this.shiftKey.disable();
            this.enterKey.x = this.shiftKey.x;
            this.enterKey.y = this.shiftKey.y;
            this.lowercaseKeys.forEach(key => key.disable());
            this.shifted = true;
        }
    }

    private shift() {
        // Do not shift for gameid type
        if (this.type === 'gameid') return;

        if (this.shifted) {
            // Unshift
            this.lowercaseKeys.forEach(key => key.enable());
            this.uppercaseKeys.forEach(key => key.disable());
            this.shiftKey.baseTint = 0xFFFFFF;
            this.shifted = false;
        } else {
            // Shift
            this.lowercaseKeys.forEach(key => key.disable());
            this.uppercaseKeys.forEach(key => key.enable());
            this.shiftKey.baseTint = 0x0094FF;
            this.shifted = true;
        }
    }
}

namespace Keyboard {
    export class Key extends Sprite {
        baseTint: number;

        constructor(x: number, y: number, texture: Texture, onClick: () => void) {
            super({
                x, y,
                texture,
                bounds: new RectBounds(-texture.width/2, -texture.height/2, texture.width, texture.height),
            });

            this.baseTint = 0xFFFFFF;
    
            this.addModule(new Button({
                baseTint: this.baseTint,
                clickTint: 0x666666,
                hoverTint: 0xBBBBBB,
                onClick: onClick,
            }));
        }

        update() {
            super.update();
            this.getModule(Button).baseTint = this.baseTint;
        }

        enable() {
            this.setVisible(true);
            this.setActive(true);
        }

        disable() {
            this.setVisible(false);
            this.setActive(false);
        }
    }

    export function charKey(x: number, y: number, char: string, onClick: (char: string) => void) {
        return new Key(x, y, charKeyTexture(char), () => onClick(char));
    }

    export function spaceKey(x: number, y: number, onClick: (char: string) => void) {
        return new Key(x, y, AssetCache.getTexture('keyboardkeyspace'), () => onClick(' '));
    }

    export function backspaceKey(x: number, y: number, onClick: (char: string) => void) {
        return new Key(x, y, AssetCache.getTexture('keyboardkeybackspace'), () => onClick('Backspace'));
    }

    export function shiftKey(x: number, y: number, onClick: () => void) {
        return new Key(x, y, AssetCache.getTexture('keyboardkeyshift'), onClick);
    }

    export function enterKey(x: number, y: number, onClick: (char: string) => void) {
        return new Key(x, y, AssetCache.getTexture('keyboardkeyenter'), () => onClick('Enter'));
    }
    
    function charKeyTexture(char: string) {
        return lazy(`keyboardCharKeyTexture/${char}`, () => {
            let texture = AssetCache.getTexture('keyboardkey').clone('Keyboard.charKeyTexture');
            let charTexture = AssetCache.getTexture(`deluxe16/chars/${char}`);
            charTexture.renderTo(texture, { x: 6, y: 3 });
            return texture;
        });
    }
}
