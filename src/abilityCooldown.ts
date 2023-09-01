class AbilityCooldown {
    private timer: Timer;
    private currentUses: number;
    private maxUses: number;

    constructor(cooldown: number, uses: number) {
        this.currentUses = uses;
        this.maxUses = uses;
        this.timer = new Timer(cooldown, () => this.currentUses = M.clamp(this.currentUses+1, 0, this.maxUses), Infinity);
    }

    update(delta: number) {
        if (this.currentUses < this.maxUses) {
            this.timer.update(delta);
        }
    }

    consumeUse() {
        if (this.currentUses <= 0) return false;
        this.currentUses--;
        return true;
    }
}