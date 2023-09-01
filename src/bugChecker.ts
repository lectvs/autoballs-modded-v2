class BugChecker extends WorldObject {
    update(): void {
        super.update();
        if (!youArePlaying(this.world)) return;

        let allies = this.world.select.typeAll(Ball).filter(ball => ball.team === 'friend' && !ball.isInShop);

        if (!GAME_DATA.hasBuggedSquad && allies.filter(ball => ball.equipment && ball.equipment instanceof Equipments.TheBug).length >= 5) {

            GAME_DATA.hasBuggedSquad = true;

            updateAchievementProgress('BugSquad', p => p+1);
            
            let world = this.world;
            this.kill();

            global.game.stopMusic();
            global.theater.playSound('windowserror');
            global.theater.loadStage(() => bugWorld(world));
        }
    }
}

function bugWorld(oldWorld: World) {
    let world = new World({
        allowPause: false,
    });

    world.addWorldObject(new Sprite({
        texture: oldWorld.takeSnapshot(),
        effects: { post: { filters: [new TextureFilter({ code: `outp.rgb = round(outp.rgb*4.0)/4.0;` })] }},
    }));

    world.addWorldObjects(lciDocumentToWorldObjects('bugged'));

    let { window, yes, no, ack } = world.select.names(Sprite, 'window', 'yes', 'no', 'ack');

    ack.setVisible(false);

    yes.addModule(new Button({
        hoverTint: 0xBBBBBB,
        clickTint: 0x888888,
        onClick: () => {
            global.game.playSound('click');
            global.theater.runScript(function*() {
                world.removeWorldObjects(A.clone(world.worldObjects));
                yield S.wait(0.6);
                global.game.loadMainMenu();
            });
        },
    }));

    no.addModule(new Button({
        hoverTint: 0xBBBBBB,
        clickTint: 0x888888,
        onClick: () => {
            global.game.playSound('click');
            global.theater.runScript(function*() {
                world.removeWorldObjects([window, yes, no]);
                ack.setVisible(true);
                yield S.wait(1.8);
                global.theater.loadStage(() => oldWorld);
            });
        },
    }));

    return world;
}