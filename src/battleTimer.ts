class BattleTimer extends WorldObject {
    get battleTime() { return this.life.time; }
    get battleTimeForArenaShrink() { return getModifierArenaShrinkStartTime() + this.battleTime * getModifierArenaShrinkTimeScale(); }
}