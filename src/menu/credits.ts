class CreditsMenu extends Menu {
    constructor(oldMenuSnapshot: Texture) {
        super({
            backgroundColor: 0x000000,
            volume: 0,
        });

        this.addWorldObject(new Sprite({
            texture: oldMenuSnapshot,
        }));

        let fade = this.addWorldObject(new Sprite({
            texture: Texture.filledRect(this.width, this.height, 0x000000),
            alpha: 0,
        }));

        let objs = <(WorldObject & { alpha: number })[]>this.addWorldObjects(lciDocumentToWorldObjects('credits/1'));
        objs.forEach(obj => obj.y += this.height);

        let time = 0.2;
        this.runScript(S.simul(
            S.tween(time, fade, 'alpha', 0, 1),
            ...objs.map(obj => S.tween(time, obj, 'y', obj.y, obj.y - this.height, Tween.Easing.OutQuad)),
        ));

        let numberOfCreditsMenus = 3;

        let menu = this;
        this.runScript(function*() {
            for (let current = 1; current <= numberOfCreditsMenus; current++) {
                let nextButton = menu.select.name(`next${current}`);
                let clickedNext = false;
                nextButton.addModule(new Button({
                    hoverTint: 0xFFFF00,
                    clickTint: 0xBBBB00,
                    onJustHovered: juiceButton(2),
                    onClick: function() {
                        global.game.playSound('click');
                        this.enabled = false;
                        clickedNext = true;
                    },
                }));

                yield S.waitUntil(() => clickedNext);

                if (current === numberOfCreditsMenus) {
                    menu.back();
                    return;
                }

                let next = current+1;

                yield S.simul(...objs.map(obj => S.tween(0.2, obj, 'alpha', 1, 0)));
                World.Actions.removeWorldObjectsFromWorld(objs);

                objs = <Sprite[]>menu.addWorldObjects(lciDocumentToWorldObjects(`credits/${next}`));

                if (next === 3) {
                    let almanacExperts = A.batch(LiveVersion.ALMANAC_EXPERTS, 9);

                    for (let i = 0; i < almanacExperts.length; i++) {
                        objs.push(menu.addWorldObject(new SpriteText({
                            x: M.equidistantLine(menu.width/2, 90, almanacExperts.length, i), y: 61,
                            text: almanacExperts[i].join('\n'),
                            style: { color: 0xFFD800 },
                            justify: 'center',
                            anchor: Vector2.TOP_CENTER,
                        })));
                    }
                }

                objs.forEach(obj => obj.alpha = 0);

                yield objs.map(obj => S.tween(0.2, obj, 'alpha', 0, 1));
            }
        });

        global.game.musicManager.volumeScale /= 3;
    }

    update() {
        super.update();

        if (Input.justDown(Input.GAME_CLOSE_MENU)) {
            Input.consume(Input.GAME_CLOSE_MENU);
            this.back();
        }
    }

    back() {
        global.game.musicManager.volumeScale *= 3;
        global.game.menuSystem.back();
    }
}