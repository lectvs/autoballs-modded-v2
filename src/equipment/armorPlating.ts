/// <reference path="./equipment.ts" />

namespace Equipments {
    export class ArmorPlating extends Equipment {
        getName() { return 'Armor Plating'; }
        getDesc() { return `Decrease all instances of damage taken by 2 (cannot decrease damage below 0.75)`; }

        constructor() {
            super({
                copyFromParent: ['layer'],
                breakIcon: 'items/armorplating',
            });
        }
    
        flatDamageChange = -2;

        render(texture: Texture, x: number, y: number): void {
            if (this.parent && this.parent instanceof Ball) {
                let radius = this.parent.visibleRadius;

                if (this.parent.isInShop) radius++;

                Draw.brush.color = 0x404040;
                Draw.brush.alpha = 1;
                Draw.brush.thickness = 2;
                Draw.circleOutline(texture, x, y, radius+1, Draw.ALIGNMENT_MIDDLE);

                Draw.brush.color = 0x00FFFF;
                Draw.brush.thickness = 1;
                let startR = radius;
                let endR = radius + 2;
                for (let i = 0; i < 12; i++) {
                    let angle = 4 + 30*i;
                    let cos = M.cos(angle);
                    let sin = M.sin(angle);
                    Draw.line(texture, x + cos*startR, y + sin*startR, x + cos*endR, y + sin*endR);
                }

                Draw.brush.color = 0x000000;
                Draw.circleOutline(texture, x, y, radius, Draw.ALIGNMENT_OUTER);
                Draw.circleOutline(texture, x, y, radius+2, Draw.ALIGNMENT_OUTER);
            }

            super.render(texture, x, y);
        }

        postUpdate(): void {
            super.postUpdate();
            if (this.parent) World.Actions.orderWorldObjectBefore(this, this.parent);
        }
    }
}
