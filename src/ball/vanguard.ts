namespace Balls {
    export class Vanguard extends Ball {
        getName() { return 'Vanguard'; }
        getDesc() { return `Allies take [r]${this.dmgReduction}<sword>[/r] less per hit while in its radius (cannot decrease damage below 0.75)`; }
        getShopDmg() { return 2; }
        getShopHp() { return 6; }

        get dmgReduction() { return this.level; }
        get auraRadius() { return this.physicalRadius + 40 + 8*(this.level-1); }
        get yourSquadRadius() { return 15; }

        private visibleBlockRadius: number;

        constructor(config: Ball.Config) {
            super('balls/vanguard', 8, config);

            this.visibleBlockRadius = this.auraRadius;

            this.addAbility('update', Vanguard.update);
        }

        render(texture: Texture, x: number, y: number): void {
            let drawRadius = this.isInYourSquadScene ? this.yourSquadRadius : this.visibleBlockRadius;
            Draw.brush.color = Color.lerpColorByLch(0xFFFF00, 0xFFD800, Tween.Easing.OscillateSine(2)(this.life.time));
            Draw.brush.alpha = 0.6;
            Draw.brush.thickness = 1;
            Draw.circleOutline(texture, x, y, drawRadius, Draw.ALIGNMENT_INNER);

            super.render(texture, x, y);
        }

        postUpdate() {
            super.postUpdate();

            if (this.isInShop && !this.isBeingMoved()) {
                this.visibleBlockRadius = 0;
            } else {
                this.visibleBlockRadius = M.lerpTime(this.visibleBlockRadius, this.auraRadius, 100, this.delta);
            }
        }

        setForInShop(): void {
            this.visibleBlockRadius = 0;
        }

        private static update(source: Vanguard, world: World) {
            if (source.state !== Ball.States.BATTLE && source.state !== Ball.States.PRE_BATTLE) return;
            
            let balls = getAlliesNotSelf(world, source).filter(ball => G.distance(ball, source) < ball.radius + source.auraRadius);
            for (let ball of balls) {
                ball.addProtected(source, source.dmgReduction, 0.1);
            }
        }
    }
}