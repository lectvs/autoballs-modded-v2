namespace Equipments {
    export class Contagion extends Equipment {
        getName() { return 'Contagion'; }
        getDesc() { return `At the start of battle, give nearby allies [dg]Infection equipments[/dg]`; }

        get infectionRadius() {
            let parent = this.getParent();
            return (!parent || parent.isInShop || parent.isInYourSquadScene) ? parent.physicalRadius-8 + 16 : 50;
        }

        constructor() {
            super({
                texture: new AnchoredTexture(Texture.filledCircle(49, 0xFFFFFF), 0.5, 0.5),
                copyFromParent: ['layer'],
                breakIcon: 'items/contagion',
                effects: { pre: { filters: [new ContagionFilter()] }, outline: { color: 0x30A000 } },
            });

            this.preBattleAbilityInitialWaitTime = 0.5;

            this.addAbility('onPreBattle', Contagion.onPreBattle);
        }

        postUpdate(): void {
            super.postUpdate();
            this.scale = (this.infectionRadius - 1) / 49;
            if (this.parent) World.Actions.orderWorldObjectAfter(this, this.parent);
        }
        
        getEquipmentTexture() {
            return AssetCache.getTexture('items/contagion');
        }

        private static onPreBattle(equipment: Contagion, source: Ball, world: World) {
            Contagion.plantInfections(equipment, source, world);

            source.runScript(function*() {
                let filter = equipment.effects.pre.filters.find(f => f instanceof ContagionFilter) as ContagionFilter;
                if (!filter) return;

                yield S.tween(0.1, filter, 'flash', 0, 0.2, Tween.Easing.OutQuad);
                yield [
                    S.tween(0.2, equipment, 'alpha', 1, 0, Tween.Easing.InQuad),
                    S.tween(0.2, equipment.effects.outline, 'alpha', 1, 0, Tween.Easing.InQuad),
                ];

                source.unequip();
            });
        }

        private static plantInfections(equipment: Contagion, source: Ball, world: World) {
            let validBalls = getAlliesNotSelf(world, source).filter(ally => G.distance(source, ally) < equipment.infectionRadius + ally.physicalRadius);
            if (validBalls.length === 0) return;

            for (let ball of validBalls) {
                ball.equip(31);
                world.addWorldObject(newPuff(ball.x, ball.y, Battle.Layers.fx, 'small'));
            }

            world.playSound('steal', { limit: 2 });
        }

        static loadFilter() {
            Texture.EFFECT_ONLY.renderTo(new BasicTexture(1, 1, 'Contagion.loadFilter'), { filters: [new ContagionFilter()] });
        }
    }

    class ContagionFilter extends TextureFilter {
        private _flash: number;
        get flash() { return this._flash; }
        set flash(v) {
            if (this._flash === v) return;
            this._flash = v;
            this.setUniform('flash', v);
        }

        constructor() {
            super({
                uniforms: { 'float flash': 0 },
                code: `
                    float scale = 10.0;
                    float p = mapClamp(pnoise(x/scale, y/scale, t), -1.0, 1.0, 0.0, 1.0);
                    outp = vec4(0.33, 1.0, 0.0, (0.05 + p * 0.3 + flash) * outp.a);
                `
            });

            this._flash = 0;
        }
    }
}
