class DragScroller extends WorldObject {
    private scrollBar: ScrollBar;
    private scrollTotalHeight: number;
    private bounds: Rect;

    private drag: { startPos: Vector2, startPercent: number };
    private dragPercent: number;
    private dragVelocity: number;

    constructor(scrollBar: ScrollBar, scrollTotalHeight: number, bounds: Rect) {
        super();
        this.scrollBar = scrollBar;
        this.scrollTotalHeight = scrollTotalHeight;
        this.bounds = bounds;

        this.dragPercent = scrollBar.getScrollPercent();
        this.dragVelocity = 0;
    }

    update() {
        super.update();

        this.updateDragState();
        this.updateDragEffect();
    }

    private updateDragState() {
        if (this.drag) {
            if (Input.isUp('click')) {
                this.drag = undefined;
                this.dragPercent = M.clamp(this.dragPercent, 0, 1);
            }
        } else {
            if (Input.justDown('click') && G.rectContainsPt(this.bounds, this.world.getWorldMouseBounds()) && !this.scrollBar.isScrolling) {
                this.drag = {
                    startPos: this.world.getWorldMousePosition(),
                    startPercent: this.scrollBar.getScrollPercent(),
                };
                this.dragPercent = this.drag.startPercent;
            }
        }
    }

    private updateDragEffect() {
        if (!this.drag) {
            if (this.dragVelocity !== 0) {
                this.dragPercent += this.dragVelocity * this.delta;
                this.dragPercent = M.clamp(this.dragPercent, 0, 1);
                this.dragVelocity = PhysicsUtils.applyFriction1d(this.dragVelocity, 800/this.scrollTotalHeight, this.delta);
                if (this.dragPercent === 0 || this.dragPercent === 1) {
                    this.dragVelocity = 0;
                }
                this.scrollBar.setScrollPercent(this.dragPercent);
            }
            return;
        }

        let d = this.world.getWorldMouseY() - this.drag.startPos.y;
        let dp = d / this.scrollTotalHeight;
        let p = this.drag.startPercent - dp;

        this.scrollBar.setScrollPercent(p);

        this.dragVelocity = this.delta === 0 ? 0 : (p - this.dragPercent) / this.delta;
        this.dragPercent = p;
    }
}