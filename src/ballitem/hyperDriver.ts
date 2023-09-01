namespace BallItems {
    export class HyperDriver extends EquipmentItem {
        getName() { return 'Hyper Driver'; }
        getDesc() {
            let PLAY = `${GAME_MODE === 'vs' || GAME_MODE === 'spectate' ? 'LOCK IN' : 'PLAY'}`;
            return `On ${PLAY}, take [gold]<coin>5 unspent[/gold] to permanently gain ${buffText(2, 2)}`;
        }

        constructor(x: number, y: number) {
            super(x, y, 'items/hyperdriver', 8);
        }

        canApplyToBall(ball: Ball): boolean {
            return !ball.isInShop;
        }
    }
}