/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class RetroGlasses extends OrbitEquipment {
        getName() { return 'Retro Glasses'; }
        getDesc() { return `The equipped ball is significantly more likely to be in the shop on every roll`; }

        constructor() {
            super('equipments/retroglasses/0', 'items/retroglasses');
            this.orbitingIcon.oscSpeed = 0.6;
            this.orbitingIcon.radiusScale = 14/12;

            this.orbitingIcon.addAnimation(Animations.fromTextureList({ name: 'default', textureRoot: 'equipments/retroglasses',
                textures: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
                frameRate: 8, count: Infinity }));
            this.orbitingIcon.playAnimation('default');
        }
    
        stockEquippedBall = true;
    }
}
