class PatchNotesMenu extends Menu {
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

        let objs = this.addWorldObjects(lciDocumentToWorldObjects('patchnotesmenu'));

        this.select.name<Sprite>('title').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time) * 3;
        };

        this.select.name<Sprite>('back').updateCallback = function() {
            this.angle = Math.sin(2*this.life.time+1) * 3;
        };
        this.select.name('back').addModule(new Button({
            hoverTint: 0xFFFF00,
            clickTint: 0xBBBB00,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                this.back();
            },
        }));

        let patchNotes = A.clone(PATCH_NOTES);
        if (LiveVersion.BDAY) patchNotes.splice(0, 0, '[r]Happy Birthday Auto Balls!!![/r]\n');
        if (LiveVersion.APRIL_FOOLS) patchNotes.splice(0, 0, '[r]April Fools! ;)[/r]\n');

        let notesContainer = this.addWorldObject(new WorldObject({ x: 16, y: 36 }));
        let notes = notesContainer.addChild(new WorldObject());
        let notesHeight = 0;
        for (let noteText of patchNotes) {
            let noteObject = notes.addChild(new SpriteText({
                y: notesHeight,
                text: noteText,
                style: { color: 0x000000 },
                maxWidth: 280,
                mask: {
                    offsetx: 0, offsety: 0,
                    type: 'screen',
                    texture: Texture.filledRect(288, 172, 0xFFFFFF),
                },
                update: function() {
                    this.mask.offsetx = notesContainer.x;
                    this.mask.offsety = notesContainer.y;
                }
            }));
            notesHeight += noteObject.getTextHeight() + 15;
        }
        objs.push(notesContainer);

        let visibleHeight = 172;
        let scrollBar = this.addWorldObject(new ScrollBar(302, 36, 'patchnotesscrollbar', notesHeight, 32,
            p => notes.localy = M.lerp(0, -Math.max(notesHeight - visibleHeight, 0), p)));
        objs.push(scrollBar);

        this.addWorldObject(new DragScroller(scrollBar, notesHeight, rect(30, 30, 260, 180)));

        objs.forEach(obj => obj.y += this.height);

        let time = 0.2;
        this.runScript(S.simul(
            S.tween(time, fade, 'alpha', 0, 1),
            ...objs.map(obj => S.tween(time, obj, 'y', obj.y, obj.y - this.height, Tween.Easing.OutQuad)),
        ));

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