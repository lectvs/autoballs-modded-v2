namespace DailyScreen {
    type StoredData = { currentDay?: number, nextDailyDate?: Date };

    export function STAGE() {
        let world = new World({
            backgroundColor: 0x000000,
            volume: 0,
            allowPause: false,
        });

        

        world.addWorldObject(new WorldObject({
            update: function() {
                if (Input.justDown(Input.GAME_CLOSE_MENU) && this.life.frames > 1 && world.select.name('back').getModule(Button).enabled) {
                    Input.consume(Input.GAME_CLOSE_MENU);
                    global.theater.loadStage(PlayScreen.STAGE);
                }
            }
        }));

        world.onTransitioned = () => {
            global.game.playMusic('music/title');
            
        };

        return world;
    }

    

    function getPackData(packs: string[]) {
        if (packs.length === 1) return { packName: packIdToName(packs[0]), icon: `dailyicons/pack/${packs[0]}` };
        if (packs.length === OFFICIAL_PACKS.length && OFFICIAL_PACKS.every(pack => _.contains(packs, pack))) return { packName: 'All', icon: `dailyicons/pack/all` };
        return { packName: 'Multiple', icon: `dailyicons/pack/all` };
    }

    function getArenaData(arena: string) {
        if (_.contains(Arenas.ARENAS, arena)) return { arenaName: arenaIdToName(arena), icon: `dailyicons/arena/${arena}` };
        return { arenaName: 'Unknown', icon: `dailyicons/arena/first` };
    }
}

function getDailyIcon(x: number, y: number, iconTexture: string, description: string) {
    let icon = new Sprite({
        x, y,
        texture: iconTexture,
        bounds: new RectBounds(-8, -8, 16, 16),
        tags: [Tags.MODIFIER_ICON],
        data: { infoBoxDescription: description },
        effects: { outline: { color: 0x000000 }},
    });
    icon.addModule(new Button({
        onHover: () => {
            icon.effects.outline.color = 0xFFFF00;
        },
        onUnhover: () => {
            icon.effects.outline.color = 0x000000;
        },
    }));
    return icon;
}

function getModifierIcon(x: number, y: number, modifier: string) {
    return getDailyIcon(x, y, getModifierIconTexture(modifier), getModifierDescription(modifier));
}
