/// <reference path="./equipment.ts" />

namespace Equipments {
    export class ProtectionBubble extends Equipment {
        getName() { return 'Protection Bubble'; }
        getDesc() { return `Takes 50% less damage, but deals none on collision`; }

        constructor() {
            super({
                copyFromParent: ['layer'],
                breakIcon: 'items/protectionbubble',
            });
        }
    
        percentDamageChange = 1-0.5;
        noCollisionDamage = true;

        render(texture: Texture, x: number, y: number): void {
            if (this.parent && this.parent instanceof Ball) {
                let radius = this.parent.visibleRadius + 4;

                Draw.brush.color = 0xFFFFFF;
                Draw.brush.alpha = 0.5;
                Draw.circleSolid(texture, x, y, radius);

                Draw.brush.color = 0x87E3FF;
                Draw.brush.alpha = 1;
                Draw.brush.thickness = 1;
                Draw.circleOutline(texture, x, y, radius, Draw.ALIGNMENT_INNER);
            }

            super.render(texture, x, y);
        }

        postUpdate(): void {
            super.postUpdate();
            if (this.parent) World.Actions.orderWorldObjectAfter(this, this.parent);
        }
    }
}
