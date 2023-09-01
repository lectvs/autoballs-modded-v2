namespace Equipments {
    export class StarCatcher extends OrbitEquipment {
        getName() { return 'Star Catcher'; }
        getDesc() { return `On enter battle, steals [gold]1<star>[/gold] from a random enemy`; }

        target: Ball;

        constructor() {
            super('equipments/starcatcher', 'items/starcatcher');

            this.addAbility('onPreBattle', StarCatcher.onPreBattle);
            this.addAbility('onEnterBattle', StarCatcher.onEnterBattle);
        }

        private static onPreBattle(equipment: StarCatcher, source: Ball, world: World) {
            StarCatcher.stealStar(equipment, source, world);
            source.unequip();
        }

        private static onEnterBattle(equipment: StarCatcher, source: Ball, world: World) {
            StarCatcher.stealStar(equipment, source, world);
            source.unequip();
        }

        private static stealStar(equipment: StarCatcher, source: Ball, world: World) {
            let starCatchers = world.select.typeAll(StarCatcher);
            let validBalls = getEnemies(world, source).filter(enemy => starCatchers.filter(c => c.target === enemy).length < enemy.level-1);
            if (validBalls.length === 0) return;

            let randomEnemy = Ball.Random.element(validBalls);
            equipment.target = randomEnemy;

            let hand = world.addWorldObject(new StarCatcherHand(source.x, source.y, source, randomEnemy));

            equipment.setPreBattleAbilityActiveCheck(() => hand.world);
        }
    }

    class StarCatcherHand extends Sprite {
        constructor(x: number, y: number, source: Ball, target: Ball) {
            super({
                x, y,
                texture: 'equipments/star_catcher',
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

                source.levelUp(undefined, true, false);

                hand.kill();
            });
        }

        grab(target: Ball) {
            if (target.level <= 1) return;

            target.levelDown();

            let hand = this;
            this.addChild(new Sprite({
                y: -1,
                texture: 'star',
                layer: Battle.Layers.fx,
                update: function() {
                    World.Actions.orderWorldObjectAfter(this, hand);
                }
            }));
            this.addChild(new Sprite({
                texture: 'aura',
                tint: 0xFFFF00,
                blendMode: Texture.BlendModes.ADD,
                scale: 0.2,
                layer: Battle.Layers.fx,
                update: function() {
                    World.Actions.orderWorldObjectAfter(this, hand);
                }
            }));
        }
    }
}
