namespace BallItems {
    export class ParticipationTrophy extends BallItem {
        getName() { return 'Participation Trophy'; }
        getDesc() { return `Give a ball ${buffText(this.buffDmgAmount, this.buffHpAmount)}\n\nOnly available if you lost the previous round`; }
    
        get buffDmgAmount() { return 1; }
        get buffHpAmount() { return 1; }
    
        constructor(x: number, y: number) {
            super(x, y, 'items/participationtrophy');
        }
    
        onApplyToBall(ball: Ball): void {
            this.world.addWorldObject(new Buff(this.x, this.y, ball, { dmg: this.buffDmgAmount, hp: this.buffHpAmount }));
        }
    }
}
