namespace Balls {
    export class Matryoshka extends Ball {
        getName() { return `Matryoshka ${getSizeInfo(this._size).name}`; }
        getDesc() {
            if (this._size === 0) return `The final layer!`;
            return `On death, summon a ${buffText(this.nextDmg, this.nextHp)} smaller version of itself with the last equipment it had`;
        }
        getShopDmg() { return 2; }
        getShopHp() { return 6; }
        getCredits() { return [CreditsNames.C_RRY]; }

        get nextDmg() { return 2; }
        get nextHp() { return this.level > 3 ? this.level-3 : 1; }

        private _size: number = 1;
        private isOriginal: boolean = true;
        private lastEquipmentType: number = -1;

        constructor(config: Ball.Config) {
            super('balls/matryoshkas', 6, config);
            this.setSize(this.level);

            this.lastEquipmentType = config.properties.equipment;

            this.addAbility('onDeath', Matryoshka.onDeath);
        }

        update() {
            super.update();

            if (this.isOriginal) {
                this.setSize(this.level);
            }

            if (this.equipment) {
                this.lastEquipmentType = this.equipment.equipmentType;
            }
        }

        getSize() {
            return this._size;
        }

        setSize(size: number) {
            size = M.clamp(size, 0, 4);
            if (this._size === size) return;
            this._size = size;
            this.changeBaseTextureAndRadius(`balls/matryoshka${getSizeInfo(size).texture}`, getSizeInfo(size).radius);
        }

        private static onDeath(source: Matryoshka, world: World, killedBy: Ball) {
            if (source.getSize() === 0) return;

            let ball = squadBallToWorldBall({
                x: source.x,
                y: source.y,
                properties: {
                    type: source.properties.type,
                    level: source.properties.level,
                    damage: source.nextDmg,
                    health: source.nextHp,
                    // No Best Friend
                    equipment: source.lastEquipmentType !== 20 ? source.lastEquipmentType : -1,
                    metadata: {},
                }
            }, undefined, -1, source.team);

            // Redundant check to force TS type
            if (!(ball instanceof Balls.Matryoshka)) {
                return;
            }

            world.addWorldObject(ball);

            ball.setSize(source.getSize()-1);
            ball.isOriginal = false;
        }
    }

    function getSizeInfo(size: number) {
        if (size in sizeInfo) return sizeInfo[size];
        if (size < 0) return sizeInfo[0];
        return sizeInfo[4];
    }

    type SizeInfo = { texture: string, name: string, radius: number };
    const sizeInfo: DictNumber<SizeInfo> = {
        0: { texture: 'xs', name: 'XS', radius: 4 },
        1: { texture: 's', name: 'S', radius: 6 },
        2: { texture: 'm', name: 'M', radius: 8 },
        3: { texture: 'l', name: 'L', radius: 11 },
        4: { texture: 'xl', name: 'XL', radius: 16 },
    }
}