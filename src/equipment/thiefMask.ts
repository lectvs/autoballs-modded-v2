/// <reference path="./orbitEquipment.ts" />

namespace Equipments {
    export class ThiefMask extends OrbitEquipment {
        getName() { return 'Thief Mask'; }
        getDesc() { return `Steal the equipment of a random enemy at the start of battle`; }

        target: Ball;

        constructor() {
            super('equipments/thiefmask', 'items/thiefmask');

            this.addAbility('onPreBattle', onPreBattle);
        }
    }

    function onPreBattle(equipment: ThiefMask, source: Ball, world: World) {
        let thiefMasks = world.select.typeAll(ThiefMask);
        let validEnemies = getEnemies(world, source).filter(ball => ball.equipment && !(ball.equipment instanceof ThiefMask) && !thiefMasks.some(tm => tm.target === ball));
        if (validEnemies.length === 0) return;

        let randomEnemy = Ball.Random.element(validEnemies);
        equipment.target = randomEnemy;

        let hand = world.addWorldObject(new ThiefHand(source.x, source.y, source, randomEnemy));

        equipment.setPreBattleAbilityActiveCheck(() => hand.world);
    }

    class ThiefHand extends Sprite {
        stolenEquipmentType: number;

        constructor(x: number, y: number, source: Ball, target: Ball) {
            super({
                x, y,
                texture: 'equipments/thief_hand/0',
                layer: Battle.Layers.fx,
                angle: target.getPosition().subtract(x, y).angle,
                flipY: target.x < x,
                effects: { outline: {} },
            });

            let hand = this;
            this.runScript(function*() {
                hand.world.playSound('steal');
                yield S.tweenPt(0.5, hand, hand, target);
                hand.grab(target);
                hand.world.playSound('steal');
                yield S.tweenPt(0.5, hand, hand, source);

                if (hand.stolenEquipmentType !== undefined) {
                    source.equip(hand.stolenEquipmentType);
                }

                hand.kill();
            });
        }

        grab(target: Ball) {
            if (!target.equipment) return;

            this.stolenEquipmentType = target.equipment.equipmentType;

            target.unequip();

            this.setTexture('equipments/thief_hand/1');

            this.addEquipmentSprites(this.stolenEquipmentType);
        }

        private addEquipmentSprites(equipmentType: number) {
            let hand = this;
            this.addChild(new Sprite({
                texture: 'aura',
                tint: 0xFFFF00,
                blendMode: Texture.BlendModes.ADD,
                scale: 0.1,
                layer: Battle.Layers.fx,
                update: function() {
                    World.Actions.orderWorldObjectAfter(this, hand);
                }
            }));

            this.addChild(new Sprite({
                texture: TYPE_TO_EQUIPMENT_TYPE_DEF[equipmentType].factory().getEquipmentTexture(),
                layer: Battle.Layers.fx,
                update: function() {
                    World.Actions.orderWorldObjectAfter(this, hand);
                }
            }));
        }
    }
}
