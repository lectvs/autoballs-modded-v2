namespace BallItems {
    export class TimeBomb extends EquipmentItem {
        getName() { return 'Time Bomb'; }
        getDesc() { return `Explode after 3 seconds in battle, dealing its [r]<sword>[/r] in a radius`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/timebomb', 38);

            this.addAnimation(Animations.fromTextureList({ name: 'idle', textures: ['items/timebomb', 'items/timebomboff'], frameRate: 2, count: Infinity }));
            this.playAnimation('idle');
        }
    }
}