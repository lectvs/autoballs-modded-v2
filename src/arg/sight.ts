namespace Sight {
    export type Config = WorldObject.Config & {
        sightPosition: Vector2;
        scientist: Scientist;
        visionDown?: Sprite;
        visionLeft?: Sprite;
        visionRight?: Sprite
        visionUp?: Sprite;
    }
}

class Sight extends WorldObject {
    private sightPosition: Vector2;
    private scientist: Scientist;

    private visionDown: Sprite;
    private visionLeft: Sprite;
    private visionRight: Sprite;
    private visionUp: Sprite;

    get stopped() { return this.timeScale === 0; }

    constructor(config: Sight.Config) {
        super(config);

        this.sightPosition = vec2(config.sightPosition);
        this.scientist = config.scientist;

        this.visionDown = config.visionDown ?? new Sprite();
        this.visionDown.blendMode = Texture.BlendModes.ADD;
        this.visionDown.alpha = 0;

        this.visionLeft = config.visionLeft ?? new Sprite();
        this.visionLeft.blendMode = Texture.BlendModes.ADD;
        this.visionLeft.alpha = 0;

        this.visionRight = config.visionRight ?? new Sprite();
        this.visionRight.blendMode = Texture.BlendModes.ADD;
        this.visionRight.alpha = 0;

        this.visionUp = config.visionUp ?? new Sprite();
        this.visionUp.blendMode = Texture.BlendModes.ADD;
        this.visionUp.alpha = 0;
    }

    start(timeBeforeSight: number) {
        let sight = this;
        this.runScript(function*() {
            while (true) {
                yield;
                yield S.waitUntil(() => sight.canSeeChester());
                let d = sight.getChesterQuadrant();
                if (!sight.getVision(d).world) {
                    continue;
                }

                sight.scientist.pause();
                yield S.wait(timeBeforeSight - 0.5);
                d = sight.getChesterQuadrant();
                if (!sight.getVision(d).world) {
                    sight.scientist.idle();
                    continue;
                }
                sight.scientist.look(d);
                yield S.wait(0.5);
                yield sight.sightScript(d);
            }
        });
    }

    stop() {
        this.timeScale = 0;
    }

    doSingleSight(d: 'down' | 'left' | 'right' | 'up') {
        this.runScript(this.sightScript(d));
    }

    private sightScript(d: 'down' | 'left' | 'right' | 'up') {
        let sight = this;
        return function*() {
            let vision = sight.getVision(d);
            let filter = sight.getWorldZoomFilter();

            sight.scientist.lookImmediate(d);
            sight.world.playSound('arg/sight');
            global.game.stopMusic();
            global.theater.runScript(S.chain(
                S.fadeOut(0, 0xFFFFFF),
                S.fadeSlides(0.1),
            ));
            yield [
                S.tween(0.2, vision, 'alpha', 0, 1),
                S.tween(0.2, filter, 'amount', 0, 1, Tween.Easing.OutBounce(2)),
            ];
            yield [
                S.tween(2, filter, 'amount', 1, 1.1, Tween.Easing.OscillateSine(4)),
                S.doOverTime(2, t => filter.amount *= M.lerp(0.95, 1.05, Tween.Easing.OscillateSine(20)(t))),
                S.doOverTime(2, t => sight.killChesterIfInSight(vision)),
            ];
            global.game.playMusic('arg/atmosphere', 0.6);
            yield [
                S.tween(0.6, filter, 'amount', 1, 0, Tween.Easing.OutBounce(1)),
                S.tween(0.4, vision, 'alpha', 1, 0),
            ];
            sight.scientist.unlook();
        };
    }

    private getWorldZoomFilter() {
        let filter = this.world.effects.post.filters.find(f => f instanceof ZoomFilter);
        if (filter) return <ZoomFilter>filter;

        let newFilter = new ZoomFilter(vec2(160, 28), 0);
        this.world.effects.post.filters.push(newFilter);
        return newFilter;
    }

    private killChesterIfInSight(vision: Sprite) {
        if (global.theater.isCutscenePlaying) return;
        if (this.stopped) return;
        let chester = this.world.select.type(Chester);
        let texture = vision.getTexture();

        let pixel = texture.getPixelRelativeARGB(chester.x - vision.x, chester.y - 2 - vision.y);
        let alpha = (pixel & 0xFF000000) >>> 24;
        if (alpha > 0) {
            global.theater.playCutscene(ARG.Cutscenes.CHESTER_DIE);
        }
    }

    private canSeeChester() {
        let chester = this.world.select.type(Chester);
        let d = chester.getPosition().subtract(this.sightPosition);
        let raycast = this.world.select.raycast(this.sightPosition.x, this.sightPosition.y, d.x, d.y, [ARG.PhysicsGroups.player, ARG.PhysicsGroups.walls]);
        return raycast.length > 0 && raycast[0].obj === chester;
    }

    private getChesterQuadrant(): 'down' | 'left' | 'right' | 'up' {
        let chester = this.world.select.type(Chester);
        let d = chester.getPosition().add(chester.v.withMagnitude(16)).subtract(this.sightPosition);
        if (d.angle >= 45 && d.angle < 135) return 'down';
        if (d.angle >= 135 && d.angle < 225) return 'left';
        if (d.angle >= 225 && d.angle < 315) return 'up';
        return 'right';
    }

    private getVision(d: 'down' | 'left' | 'right' | 'up') {
        return {
            'down': this.visionDown,
            'left': this.visionLeft,
            'right': this.visionRight,
            'up': this.visionUp,
        }[d];
    }
}