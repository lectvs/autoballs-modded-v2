function newOptionsGear() {
    let gear = new Sprite({
        name: 'gear',
        x: 11, y: global.gameHeight-11,
        texture: 'gear',
        layer: Battle.Layers.ui,
        bounds: new CircleBounds(0, 0, 11),
        useGlobalTime: true,
        updateOnNonUpdate: true,
    });
    gear.addModule(new Button({
        hoverTint: 0xFFFF00,
        clickTint: 0xBBBB00,
        onClick: () => {
            gear.tint = 0xFFFFFF;
            global.game.playSound('click');
            global.game.pauseGame();
        },
    }));
    return gear;
}

function getAllowProfaneSquadNames() {
    return !!Options.getOption('allowProfaneSquadNames');
}

function setAllowProfaneSquadNames(allowProfaneSquadNames: boolean) {
    Options.updateOption('allowProfaneSquadNames', allowProfaneSquadNames);
}

function getFastBattleTransitions() {
    return !!Options.getOption('fastBattleTransitions');
}

function getBattleTransitionTimeScale() {
    return getFastBattleTransitions() ? 0.33 : 1;
}

function setFastBattleTransitions(fastBattleTransitions: boolean) {
    Options.updateOption('fastBattleTransitions', fastBattleTransitions);
}

function getBigDragging(): boolean {
    return Options.getOption('bigDragging') ?? true;
}

function setBigDragging(bigDragging: boolean) {
    Options.updateOption('bigDragging', bigDragging);
}

type MusicType = 'Themed' | 'Random' | 'Side A' | 'Side B';
function getMusicType(): MusicType {
    return Options.getOption('musicType') ?? 'Themed';
}

function setMusicType(musicType: MusicType) {
    Options.updateOption('musicType', musicType);
}

function addNumberSetting(world: World, x: number, y: number, minValue: number, maxValue: number, prefix: string, getAttr: Getter<number>, setAttr: Setter<number>) {
    let d = 48 / 2;

    world.addWorldObject(new MenuTextButton({
        x: x + d, y: y,
        text: '\\>',
        anchor: Vector2.TOP_RIGHT,
        justify: 'right',
        effects: { outline: { color: 0x000000 }, post: { filters: [new DropShadowFilter()] }},

        hoverColor: 0xFFFF00,
        onClick:  () => {
            global.game.playSound('click');
            let nextValue = getIncrValue(getAttr());
            if (nextValue > maxValue) nextValue = minValue;
            setAttr(nextValue);
        },
    }));

    world.addWorldObject(new MenuTextButton({
        x: x - d, y: y,
        text: '\\<',
        anchor: Vector2.TOP_RIGHT,
        justify: 'right',
        effects: { outline: { color: 0x000000 }, post: { filters: [new DropShadowFilter()] }},

        hoverColor: 0xFFFF00,
        onClick:  () => {
            global.game.playSound('click');
            let nextValue = getDecrValue(getAttr());
            if (nextValue < minValue) nextValue = maxValue;
            setAttr(nextValue);
        },
    }));

    world.addWorldObject(new SpriteText({
        x: x - 4, y: y,
        text: `${prefix}${getAttr()}`,
        anchor: Vector2.TOP_CENTER,
        justify: 'center',
        effects: { outline: { color: 0x000000 }, post: { filters: [new DropShadowFilter()] }},
        update: function() {
            this.setText(`${prefix}${getAttr()}`);
        }
    }));
}

function addOptionSetting(world: World, x: number, y: number, options: string[], prefix: string, getAttrOption: () => string, setAttrOption: (v: string) => void, onChange?: (v: string) => void) {
    let d = Math.max(M.max(options, op => op.length * 8 + 16), 48) / 2;

    world.addWorldObject(new MenuTextButton({
        x: x + d, y: y,
        text: '\\>',
        anchor: Vector2.TOP_RIGHT,
        justify: 'right',
        effects: { outline: { color: 0x000000 }, post: { filters: [new DropShadowFilter()] }},

        hoverColor: 0xFFFF00,
        onClick:  () => {
            global.game.playSound('click');
            let currentOptionIndex = options.indexOf(getAttrOption());
            let incrOptionIndex = currentOptionIndex < 0 ? 0 : currentOptionIndex+1;
            if (incrOptionIndex > options.length-1) incrOptionIndex = 0;
            setAttrOption(options[incrOptionIndex]);
        },
    }));

    world.addWorldObject(new MenuTextButton({
        x: x - d, y: y,
        text: '\\<',
        anchor: Vector2.TOP_RIGHT,
        justify: 'right',
        effects: { outline: { color: 0x000000 }, post: { filters: [new DropShadowFilter()] }},

        hoverColor: 0xFFFF00,
        onClick:  () => {
            global.game.playSound('click');
            let currentOptionIndex = options.indexOf(getAttrOption());
            let decrOptionIndex = currentOptionIndex < 0 ? 0 : currentOptionIndex-1;
            if (decrOptionIndex < 0) decrOptionIndex = options.length-1;
            setAttrOption(options[decrOptionIndex]);
        },
    }));

    world.addWorldObject(new SpriteText({
        x: x - 4, y: y,
        text: `${prefix}${getAttrOption()}`,
        anchor: Vector2.TOP_CENTER,
        justify: 'center',
        effects: { outline: { color: 0x000000 }, post: { filters: [new DropShadowFilter()] }},
        update: function() {
            let text = `${prefix}${getAttrOption()}`;
            if (this.getCurrentText() !== text && onChange) onChange(getAttrOption());
            this.setText(text);
        }
    }));

    if (onChange) onChange(getAttrOption());
}

function getIncrValue(currentValue: number) {
    if (Math.abs(currentValue) >= 20 && currentValue % 5 === 0) {
        return currentValue + 5;
    }
    return currentValue + 1;
}

function getDecrValue(currentValue: number) {
    if (Math.abs(currentValue) >= 25 && currentValue % 5 === 0) {
        return currentValue - 5;
    }
    return currentValue - 1;
}