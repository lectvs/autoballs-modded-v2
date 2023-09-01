class ScrollBar extends Sprite {
    private handle: Sprite;
    private totalHeight: number;
    private pixelsPerScroll: number;

    private clicked: boolean = false;
    private grabbing: boolean = false;
    private grabDy: number = 0;
    private targetScrollY: number;

    private slideSpeed: number = 256;

    get isScrolling() { return this.grabbing; }

    scrollTo: (percent: number) => void;

    constructor(x: number, y: number, texture: string, totalHeight: number, pixelsPerScroll: number, scrollTo: (percent: number) => void) {
        super({
            x, y,
            texture: texture,
        });

        this.bounds = new RectBounds(-2, -2, 8, this.getTexture().height, this);

        this.handle = this.addChild(new Sprite({
            x: 1, y: 1,
            texture: 'scrollbarhandle',
            copyFromParent: ['layer'],
            bounds: new RectBounds(-3, 0, 8, 16),
        }));

        this.scrollTo = scrollTo;
        this.targetScrollY = this.handle.localy;
        this.totalHeight = totalHeight;
        this.pixelsPerScroll = pixelsPerScroll;
    }

    update() {
        super.update();

        let mouseBounds = this.world.getWorldMouseBounds();
        let hovered = this.bounds.isOverlapping(mouseBounds);

        if (hovered && Input.justDown('click')) {
            this.clicked = true;
        }

        if (Input.isUp('click')) {
            this.clicked = false;
            this.grabbing = false;
        }

        if (this.clicked) {
            if (this.grabbing) {
                this.handle.localy = (mouseBounds.y - this.y) + this.grabDy;
                this.targetScrollY = this.handle.localy;
            } else if (this.handle.bounds.isOverlapping(mouseBounds)) {
                this.grabDy = this.handle.localy - (mouseBounds.y - this.y);
                this.grabbing = true;
                this.targetScrollY = this.handle.localy;
            } else {
                this.targetScrollY = mouseBounds.y - this.y;
            }
        } else {
            this.targetScrollY = this.targetScrollY + M.map(this.pixelsPerScroll, 0, this.totalHeight, 0, this.getTexture().height-18) * Input.mouseScrollDelta;
        }

        this.targetScrollY = M.clamp(this.targetScrollY, 1, this.getTexture().height-17);

        if (this.handle.localy < this.targetScrollY) {
            this.handle.localy = Math.min(this.handle.localy + this.slideSpeed * this.delta, this.targetScrollY);
        } else if (this.handle.localy > this.targetScrollY) {
            this.handle.localy = Math.max(this.handle.localy - this.slideSpeed * this.delta, this.targetScrollY);
        }

        this.handle.localy = M.clamp(this.handle.localy, 1, this.getTexture().height-17);

        this.scrollTo(this.getScrollPercent());

        if (this.clicked) {
            this.handle.tint = 0xBBBB00;
        } else if (hovered) {
            this.handle.tint = 0xFFFF00;
        } else {
            this.handle.tint = 0xFFFFFF;
        }
    }

    postUpdate(): void {
        super.postUpdate();
        World.Actions.orderWorldObjectAfter(this.handle, this);
    }

    getScrollPercent() {
        return this.worldYToPercent(this.handle.localy);
    }

    setScrollPercent(p: number) {
        this.handle.localy = this.targetScrollY = this.percentToWorldY(p);
        this.scrollTo(p);
    }

    private percentToWorldY(y: number) {
        return M.map(y, 0, 1, 1, this.getTexture().height-17);
    }

    private worldYToPercent(y: number) {
        return M.map(y, 1, this.getTexture().height-17, 0, 1);
    }
}