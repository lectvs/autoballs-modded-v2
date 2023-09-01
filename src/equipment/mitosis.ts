namespace Equipments {
    export class Mitosis extends OrbitEquipment {
        getName() { return 'Mitosis'; }
        getDesc() { return `At the start of battle, split into two copies with\n[r]half <sword>[/r], [g]half <heart>[/g], and [gold]half <star>[/gold]`; }

        orbitingIcon2: OrbitingIcon;
        hasSetColor = false;
    
        constructor() {
            super('equipments/mitosis', 'items/mitosis');
    
            this.orbitingIcon2 = this.addChild(new OrbitingIcon('equipments/mitosis', this.orbitingIcon.getParentBall));
            this.orbitingIcon2.life.time = Random.float(0, 1);
            this.orbitingIcon2.direction = -1;
            this.orbitingIcon2.oscSpeed = 0.7;

            this.preBattleAbilityInitialWaitTime = 0.5;

            this.addAbility('onPreBattle', onPreBattle);
        }

        update() {
            super.update();

            if (!this.parent || !(this.parent instanceof Ball)) return;

            if (!this.hasSetColor) {
                let teamColor = Ball.getTeamColor(this.parent.team);
                this.orbitingIcon.effects.post.filters.push(new BallTeamColorFilter(teamColor));
                this.orbitingIcon2.effects.post.filters.push(new BallTeamColorFilter(teamColor));
                this.hasSetColor = true;
            }
        }

        setForShare(): void {
            super.setForShare();
            this.orbitingIcon2.setForShare();
        }
    }

    function onPreBattle(equipment: Mitosis, source: Ball, world: World) {
        split(source, world);
    }

    function split(source: Ball, world: World) {
        let d = Ball.Random.onCircle(8);
        addCopy(source, world, d);
        addCopy(source, world, d.scale(-1));

        world.playSound('sellball').volume = 0.5;
        world.addWorldObject(new BurstPuffSystem({
            x: source.x,
            y: source.y,
            layer: Battle.Layers.fx,
            puffCount: Math.floor(10 * getParticleLevel()),
            puffConfigFactory: () => ({
                maxLife: 0.7,
                v: Random.inCircle(80),
                color: 0xFFFFFF,
                radius: 4,
                finalRadius: 0,
            }),
        }));

        source.cancelAbilities();
        source.removeFromWorld();
    }

    function addCopy(source: Ball, world: World, d: Vector2) {
        let ball = squadBallToWorldBall({
            x: source.x + d.x,
            y: source.y + d.y,
            properties: {
                type: source.properties.type,
                level: Math.ceil(source.level/2),
                damage: source.dmg/2,
                health: source.hp/2,
                equipment: -1,
                metadata: O.deepClone(source.properties.metadata),
            }
        }, source.squad, source.squadIndexReference, source.team);
        ball.isSummon = false;
        world.addWorldObject(ball);
    }
}
