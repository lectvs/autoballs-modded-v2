namespace BallItems {
    export class CollectibleCoin extends BallItem {
        getName() { return 'Collectible Coin'; }
        getDesc() { return `Start the shop with [gold]1<coin>[/gold] extra each round while this item is [lb]frozen[/lb]`; }
    
        constructor(x: number, y: number) {
            super(x, y, 'items/collectiblecoin');
        }

        isPurchasable(): boolean {
            return false;
        }

        onStartShopBeforeStartShopEffects(): void {
            if (!this.frozen) return;
            
            addStartShopEffect({
                type: 'gold',
                gold: 1,
                sourceSquadIndex: -1,
            });
            animateGiveOrTakeShopGold(this.world, this, 1);

            addItemTypeForAlmanacWin(this.type);
        }
    }
}
