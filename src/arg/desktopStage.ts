namespace ARG.Stages {
    export function BASE_INNER_STAGE(scale: number, config: World.Config = {}) {
        let world = new World({
            width: 320/scale, height: 240/scale,
            scaleX: scale, scaleY: scale,
            backgroundColor: 0x000000,
            ...config,
        });

        return world;
    }

    export function DESKTOP() {
        let world = BASE_INNER_STAGE(1);

        world.addWorldObjects(lciDocumentToWorldObjects('arg/desktop'));

        for (let appName of ['sabapp', 'ffapp', 'docsapp']) {
            let app = world.select.name<Sprite>(appName);
            app.effects.pre.filters.push(new Effects.Filters.Outline(0x000000, 1));
            app.addModule(new DesktopIconButton(() => {
                if (appName === 'sabapp') {
                    global.theater.loadStage(ARG.SuperAutoBalls.INTRO);
                } else if (appName === 'ffapp') {
                    global.theater.loadStage(ARG.FarcicalFishing.GAME);
                } else if (appName === 'docsapp') {
                    global.theater.loadStage(ARG.Stages.SECRET_DOCUMENTS);
                }
            }));
        }

        world.addWorldObject(new DesktopTransitionObject());

        world.onTransitioned = function() {
            playMusicNoRestart('arg/computer', 1);
        }
        
        return new OverlayedStage(world);
    }
}