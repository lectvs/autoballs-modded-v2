namespace BallItems {
    export class PolarityInverter extends EquipmentItem {
        getName() { return 'Polarity Inverter'; }
        getDesc() { return `Travel in the opposite direction around the arena AND magnetize toward enemies`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/polarityinverter', 9);

            this.addChild(new Sprite({
                texture: 'items/polarityinverterfan',
                copyFromParent: ['layer'],
                vangle: -720,
                update: function() {
                    if (this.parent && this.parent instanceof BallItem) {
                        World.Actions.orderWorldObjectAfter(this, this.parent);
                        this.scale = this.parent.moveScale;
                    }
                }
            }));
        }
    }
}