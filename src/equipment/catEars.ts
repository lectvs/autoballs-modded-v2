/// <reference path="./equipment.ts" />

namespace Equipments {
    export class CatEars extends Equipment {
        getName() { return 'Cat Ears'; }
        getDesc() { return ''; }

        constructor() {
            super({
                texture: 'equipments/catears',
                copyFromParent: ['layer'],
                breakIcon: 'items/catears',
            });

            this.addAbility('onCollideWithEnemyPostDamage', CatEars.onCollideWithEnemyPostDamage);
        }
    
        postUpdate(): void {
            super.postUpdate();
            if (this.parent && this.parent instanceof Ball) {
                this.localy = -Math.max(this.parent.visibleRadius-8, 0);
                World.Actions.orderWorldObjectBefore(this, this.parent);
            }
        }

        private static onCollideWithEnemyPostDamage(equipment: CatEars, source: Ball, world: World, ball: Ball, damage: number): void {
            if (Ball.Random.boolean(1/200) && (!ball.equipment || !(ball.equipment instanceof Equipments.CatEars))) {
                world.runScript(function*() {
                    let bg = world.addWorldObject(new Sprite({ texture: fullscreenTexture.get(), layer: Battle.Layers.fg }));
                    let catPos = getCatPos(source, ball);
                    let cat = world.addWorldObject(new Sprite({ x: catPos.x, y: catPos.y, texture: 'buffcat', layer: Battle.Layers.fg, flipX: catPos.x > ball.x }));
                    let catEars = world.addWorldObject(new Sprite({ x: equipment.x, y: equipment.y, texture: 'equipments/catears', effects: { outline: { color: 0xFFFFFF } }, layer: Battle.Layers.fg }))
                    let claw = world.addWorldObject(new ClawSlash(ball, source, 1, false));
                    claw.layer = Battle.Layers.fg;

                    yield S.wait(0.1);
                    bg.tint = 0x000000;
                    cat.effects.invertColors.enabled = true;
                    yield S.wait(0.2);
                    bg.kill();
                    cat.kill();
                    catEars.kill();
                    claw.kill();
                });
            }
        }

    }

    function getCatPos(parent: Ball, collideWith: Ball) {
        let result = vec2(parent.x, parent.y);
        if (Math.abs(result.x - collideWith.x) < 56) {
            if (result.x < collideWith.x) result.x = collideWith.x - 56;
            else result.x = collideWith.x + 56;
        }
        result.y = M.clamp(result.y, 53, global.gameHeight-53);
        return result;
    }

    const fullscreenTexture = new LazyValue(() => Texture.filledRect(global.gameWidth, global.gameHeight, 0xFFFFFF));
}
