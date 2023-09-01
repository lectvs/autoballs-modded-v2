const COMPLETE_ALMANAC_CUTSCENE: Cutscene = {
    script: function*() {
        yield S.fadeOut(0);
        global.theater.playSound('shake', { humanized: false });
        global.game.stopMusic();
        global.theater.loadStage(() => new World());
        yield S.wait(5);
        yield S.fadeSlides(0);

        let line1 = global.world.addWorldObject(new SpriteText({
            x: global.world.width/2, y: 30,
            text: "You did it, you overcame Auto Balls' ultimate challenge!",
            maxWidth: 280,
            anchor: Vector2.CENTER,
            justify: 'center',
            style: { color: 0xFFFFFF },
            alpha: 0,
        }));

        let line2 = global.world.addWorldObject(new SpriteText({
            x: global.world.width/2, y: 90,
            text: "I can't overstate how much I appreciate you playing to this end. Players like you make game making feel worth it!",
            maxWidth: 280,
            anchor: Vector2.CENTER,
            justify: 'center',
            style: { color: 0xFFFFFF },
            alpha: 0,
        }));

        let line3 = global.world.addWorldObject(new SpriteText({
            x: global.world.width/2, y: 165,
            text: "From the bottom of my heart, thank you for playing Auto Balls. I hope you continue to enjoy racking up those wins. :)",
            maxWidth: 280,
            anchor: Vector2.CENTER,
            justify: 'center',
            style: { color: 0xFFFFFF },
            alpha: 0,
        }));

        let line4 = global.world.addWorldObject(new SpriteText({
            x: global.world.width/2, y: 220,
            text: "~ lectvs",
            maxWidth: 280,
            anchor: Vector2.CENTER,
            justify: 'center',
            style: { color: 0xFFFFFF },
            alpha: 0,
        }));

        yield S.tween(2, line1, 'alpha', 0, 1);
        yield S.wait(0.5);
        yield S.tween(2, line2, 'alpha', 0, 1);
        yield S.wait(0.5);
        yield S.tween(2, line3, 'alpha', 0, 1);
        yield S.wait(0.5);
        yield S.tween(2, line4, 'alpha', 0, 1);
        yield S.wait(0.5);

        yield S.wait(2);

        let done = false;
        let mm = global.world.addWorldObject(new MenuTextButton({
            x: 226, y: 222,
            text: "Main Menu >",
            style: { color: 0x888888 },
            hoverColor: 0x555555,
            alpha: 0,
            onClick: function() {
                global.game.playSound('click');
                done = true;
                this.enabled = false;
            }
        }));

        yield S.tween(1, mm, 'alpha', 0, 1);

        yield S.waitUntil(() => done);

        yield S.fadeOut(1.5);

        yield S.wait(2);

        saveSeenAlmanacComplete(true);

        global.game.loadMainMenu();
    }
}
