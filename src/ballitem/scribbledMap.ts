namespace BallItems {
    export class ScribbledMap extends BallItem {
        getName() { return 'Scribbled Map'; }
        getDesc() { return `[color 0xFFFF97]Win or lose,\nHaven awaits[/color]`; }
        getShopCost() { return 0; }

        defaultOutlineAlpha = 0;
        canFreeze: boolean = false;
    
        constructor(x: number, y: number) {
            super(x, y, 'items/scribbledmap');

            this.effects.post.filters.push(new FlipbookFilter(1, 2, 1, 1));

            this.addChild(new Sprite({
                texture: 'aura',
                tint: 0xFFDB00,
                blendMode: Texture.BlendModes.ADD,
                scale: 20 / 64,
                alpha: 0.5,
                copyFromParent: ['layer'],
                update: function() {
                    World.Actions.orderWorldObjectBefore(this, this.parent);
                    this.scale = M.lerp(20/64, 16/64, Tween.Easing.OscillateSine(0.5)(this.life.time));
                },
            }));
        }

        isGlitched(): boolean {
            return true;
        }
    
        onApplyToBall(ball: Ball): void {
            GAME_DATA.arg2Trigger.strategy = true;

            let world = this.world;
            world.runScript(function*() {
                let reveal = new RevealFilter(0);
                world.addWorldObject(new Sprite({
                    name: 'strategy',
                    x: 0, y: 0,
                    texture: 'strategy',
                    layer: Battle.Layers.ground,
                    effects: { post: { filters: [reveal] }},
                }));

                let sound = world.playSound('arg/atmosphere');
                sound.loop = true;
                sound.volume = 0;
                yield [
                    S.tween(30, reveal, 'amount', 0, 1),
                    S.tween(30, sound, 'volume', 0, 1),
                ];
                yield S.tween(1, sound, 'volume', 1, 0);
                sound.stop();
            })
        }
    }
}
