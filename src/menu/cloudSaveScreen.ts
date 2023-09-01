namespace CloudSaveScreen {
    export function STAGE() {
        let world = new World({
            backgroundColor: 0x000000,
            volume: 0,
            allowPause: false,
        });

        

        world.addWorldObject(new WorldObject({
            update: function() {
                if (Input.justDown(Input.GAME_CLOSE_MENU) && world.select.name('back').getModule(Button).enabled) {
                    Input.consume(Input.GAME_CLOSE_MENU);
                    global.game.loadMainMenu();
                }
            }
        }));

        world.onTransitioned = () => {
            global.game.playMusic('music/title');
        };

        return world;
    }

    
}