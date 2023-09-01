class OverlayedStage extends World {
    innerWorld: World;

    constructor(innerWorld: World) {
        super({
            width: 320, height: 240,
            backgroundColor: 0x000000,
        });

        this.innerWorld = innerWorld;
        this.addWorldObject(new Theater.WorldAsWorldObject(innerWorld));
        this.addWorldObjects(lciDocumentToWorldObjects('arg/overlay'));

        let { home } = this.select.names(Sprite, 'home');

        home.addModule(new DesktopIconButton(() => global.theater.loadStage(ARG.Stages.DESKTOP)));
    }

    onTransitioned(): void {
        super.onTransitioned();
        this.innerWorld.onTransitioned();
    }
}
