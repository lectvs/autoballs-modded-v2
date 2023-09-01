class BallItem extends Sprite {
    getType(): 'Item' | 'Equipment' { return 'Item'; }
    getName() { return 'unknown'; }
    getDesc() { return 'unknown'; }
    getShopCost() { return 3; }
    getCredits(): string[] { return []; }

    type: number;
    tier: number;
    shopSpot: number;

    get mapToEquipmentTypes() { return []; }

    defaultOutline: number = 0xFFFFFF;
    defaultOutlineAlpha: number = 1;
    canFreeze: boolean = true;
    freezeSprite: Sprite;
    get frozen() { return !!this.freezeSprite; }
    get isInShop() { return true; }

    moveScale: number = 1;

    constructor(x: number, y: number, texture: string) {
        super({
            x, y,
            texture,
            layer: Battle.Layers.ui,
            bounds: new CircleBounds(0, 0, 12),
        });
    }

    postUpdate() {
        super.postUpdate();
        if (this.freezeSprite) {
            World.Actions.orderWorldObjectAfter(this.freezeSprite, this);
        }
    }

    canApplyToBall(ball: Ball) {
        return true;
    }

    changeHighlight(enabled: boolean, color?: number, alpha?: number) {
        if (color === undefined) color = this.effects.outline.color;
        if (alpha === undefined) alpha = this.effects.outline.alpha;
        this.effects.outline.enabled = enabled;
        this.effects.outline.color = color;
        this.effects.outline.alpha = alpha;
    }

    freeze(immediate: boolean) {
        this.freezeSprite = this.addChild(new FreezeIce(8, immediate));
        if (this.shopSpot >= 0) {
            GAME_DATA.frozenThings[this.shopSpot] = {
                type: 'item',
                itemType: this.type
            };
        }
    }

    getDescPrefix() {
        return undefined;
    }

    giveShine() {
        this.removeShine();
        this.effects.pre.filters.push(new ShineFilter(Color.lerpColorByLch(getColorForTier(this.tier), 0xFFFFFF, 0.5)));
    }

    isAboutToReplace(ball: Ball) {
        return false;
    }

    isGlitched() {
        return false;
    }

    isPurchasable() {
        return true;
    }

    onApplyToBall(ball: Ball) {

    }

    onPickUp() {

    }

    onPutDown() {
        
    }

    onStartShopBeforeStartShopEffects() {

    }

    removeShine() {
        let i = this.effects.pre.filters.findIndex(filter => filter instanceof ShineFilter);
        if (i >= 0) {
            this.effects.pre.filters.splice(i, 1);
        }
    }

    setMoveScale(moveScale: number) {
        this.moveScale = moveScale;
        this.scale = this.moveScale;
        (<CircleBounds>this.bounds).radius = 12 * this.moveScale;
    }

    unfreeze() {
        this.freezeSprite.kill();
        this.freezeSprite = undefined;
        if (this.shopSpot >= 0) {
            GAME_DATA.frozenThings[this.shopSpot] = undefined;
        }
    }
}