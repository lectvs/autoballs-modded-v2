namespace Balls {
    export class Vagrant extends Ball {
        getName() { return 'Vagrant'; }
        getDesc() {
            let PLAY = `${GAME_MODE === 'vs' ? 'LOCK IN' : 'PLAY'}`;
            if (Vagrant.getTakeNumberOfItems(this) > 1) return `On ${PLAY}, takes [lb]${Vagrant.getTakeNumberOfItems(this)}[/lb] random items from the shop for free\n\nWill not take Molecular Disassemblers`;
            return `On ${PLAY}, takes a random item from the shop for free\n\nWill not take Molecular Disassemblers`;
        }
        getShopDmg() { return 3; }
        getShopHp() { return 4; }

        static getTakeNumberOfItems(source: Ball) { return source.level; }

        constructor(config: Ball.Config) {
            super('balls/vagrant', 8, config);

            this.addAbility('onPlay', Vagrant.onPlay);
        }

        static onPlay(source: Ball, world: World) {
            let currentHomingItems = world.select.typeAll(HomingItem);

            let validItems = world.select.typeAll(BallItem).filter(item => item.isPurchasable() && !_.contains(Vagrant.INVALID_ITEMS, item.type) && !currentHomingItems.some(h => h.item === item));
            if (validItems.length === 0) return;

            if (validItems.length > Vagrant.getTakeNumberOfItems(source)) {
                Ball.Random.shuffle(validItems);
                validItems = validItems.slice(0, Vagrant.getTakeNumberOfItems(source));
            }

            for (let item of validItems) {
                if (item.frozen) {
                    world.playSound('unfreeze');
                    item.unfreeze();
                }
                item.removeFromWorld();
                world.addWorldObject(new HomingItem(item.x, item.y, source, item));
            }

            FIND_OPPONENT_WAIT_TIME = Math.max(FIND_OPPONENT_WAIT_TIME, 2);
        }

        private static INVALID_ITEMS = [
            46,  // Collectible Coin
            47,  // Molecular Disassembler
        ];
    }
}