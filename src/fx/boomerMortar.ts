class BoomerMortar extends WorldObject {
    constructor(x: number, y: number, startX: number, startY: number, radius: number, dmg: number, source: Ball) {
        super({
            x, y,
            tags: [Tags.DELAY_RESOLVE(source.team)],
        });

        this.addChild(new StatViewer({ type: 'damage', getDamage: () => dmg }, 6, 5));

        let bm = this;
        this.runScript(function*() {
            let bullet = bm.addChildKeepWorldPosition(new Sprite({
                x: startX, y: startY,
                texture: 'boomerbullet',
                layer: Battle.Layers.fg,
            }));

            bm.addChild(bm.createRing(radius));

            yield S.tween(0.25, bullet, 'y', bullet.y, bullet.y - 250);
            bullet.localx = 0;
            yield S.tween(0.25, bullet, 'localy', -250, 0);

            bm.world.addWorldObject(new Explosion(bm.x, bm.y, radius, { ally: 0, enemy: dmg }, source));
            bm.world.playSound('shake');
            bm.kill();
        });
    }

    private createRing(radius: number) {
        return new Sprite({
            layer: Battle.Layers.onground,
            render: function(screen, x, y) {
                Draw.brush.color = Color.lerpColorByLch(0xFF0000, 0xFF3333, Tween.Easing.OscillateSine(2)(this.life.time));
                Draw.brush.alpha = 0.6;
                Draw.brush.thickness = 1;
                Draw.circleOutline(screen, x, y, radius, Draw.ALIGNMENT_INNER);
            }
        });
    }
}