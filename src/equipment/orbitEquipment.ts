/// <reference path="./equipment.ts" />

class OrbitEquipment extends Equipment {
    orbitingIcon: OrbitingIcon;

    constructor(icon: string, breakIcon: string) {
        super({
            copyFromParent: ['layer'],
            breakIcon: breakIcon,
        });

        this.orbitingIcon = this.addChild(new OrbitingIcon(icon, () => this.parent instanceof Ball ? this.parent : undefined));
        this.orbitingIcon.life.time = Random.float(0, 1);
    }

    getEquipmentTexture(): Texture {
        return this.orbitingIcon.getTexture();
    }

    setForShare(): void {
        super.setForShare();
        this.orbitingIcon.setForShare();
    }
}