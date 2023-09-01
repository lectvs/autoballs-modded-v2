namespace BallItems {
    export class SmokeBomb extends EquipmentItem {
        getName() { return 'Smoke Bomb'; }
        getDesc() { return `Disappear on entering battle, avoiding collisions for 2 seconds. Reappear in a burst of [r]2x the ball's <sword>[/r]`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/smokebomb', 16);
        }
    }
}