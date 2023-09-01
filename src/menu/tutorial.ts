class TutorialMenu extends Menu {
    constructor() {
        super({
            backgroundColor: 0x000000,
            volume: 0,
        });

        this.showTutorial('tutorial1',
            () => this.showTutorial('tutorial2',
                //() => this.showTutorial('tutorial3',
                    () => global.game.menuSystem.back()))//);
    }

    showTutorial(lciDocument: string, onNext: () => any) {
        this.removeWorldObjects(A.clone(this.worldObjects));

        let arenaWorld = Arenas.BASE();
        Arenas.SET_FOR_ARENA(arenaWorld, Arenas.ARENA_FIRST);
        arenaWorld.volume = 0.3;

        this.addWorldObject(new Theater.WorldAsWorldObject(arenaWorld));

        this.addWorldObjects(lciDocumentToWorldObjects(lciDocument));

        let tutorialNextFilter = new TutorialNextFilter();
        this.select.name<Sprite>('tutorial').effects.post.filters.push(new DropShadowFilter());

        let tutorialflash = this.select.name<Sprite>('tutorialflash', false);
        if (tutorialflash) {
            tutorialflash.effects.post.filters.push(new DropShadowFilter());
            tutorialflash.updateCallback = function() {
                this.tint = Color.lerpColorByLch(0xFFFFFF, 0xFFBB00, Tween.Easing.OscillateSine(1)(this.life.time));
            }
        }

        this.select.name<Sprite>('next').effects.post.filters.push(tutorialNextFilter, new DropShadowFilter());
        this.select.name<Sprite>('next').updateCallback = function() {
            tutorialNextFilter.setTintColor(M.colorToVec3(Color.lerpColorByLch(0xFF4300, 0xFFE900, Tween.Easing.OscillateSine(2)(this.life.time))));
        };
        this.select.name('next').addModule(new Button({
            hoverTint: 0xAAAAAA,
            clickTint: 0x666666,
            onJustHovered: juiceButton(1),
            onClick: () => {
                global.game.playSound('click');
                onNext();
            },
        }));
    }
}