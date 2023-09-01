namespace Balls {
    export class Dolly extends Ball {
        getName() { return 'Dolly'; }
        getDesc() { return `At the start of battle, summon a ${buffText(this.power, this.power)} Dolly for every unfilled ball spot`; }
        getShopDmg() { return 3; }
        getShopHp() { return 3; }
        getCredits() { return [CreditsNames.XIAOSLOTH]; }

        get power() { return 3 + this.level-1; }

        shouldActivateAbility = true;

        constructor(config: Ball.Config) {
            super('balls/dolly', 8, config);

            this.addAbility('onPreBattle', Dolly.onPreBattle, { canActivateTwice: false });
            this.addAbility('onEnterBattle', Dolly.onEnterBattle, { canActivateTwice: false });
        }

        private static onPreBattle(source: Dolly, world: World) {
            Dolly.fillSquad(source, world);
        }

        private static onEnterBattle(source: Dolly, world: World) {
            let battleTimer = world.select.type(BattleTimer, false);
            let timeInBattle = battleTimer ? battleTimer.battleTime : 0;
            if (timeInBattle > 0.3 || source.hasActivatedAbility('onPreBattle')) return;
            Dolly.fillSquad(source, world);
        }

        private static fillSquad(source: Dolly, world: World) {
            if (!source.shouldActivateAbility) return;

            let script = source.runScript(function*() {
                let unfilledAllySlots = GET_MAX_SQUAD_SIZE() - source.getSquadSize(world);

                for (let i = 0; i < unfilledAllySlots; i++) {
                    let allies = getAllies(world, source);
                    let allyAveragePos = G.average(...allies);
                    let side: 'left' | 'right' = (allyAveragePos && allyAveragePos.x < world.width/2) ? 'left' : 'right';
                    
                    let location = Locations.getRandomLocation(source, world, side, location => {
                        if (allies.some(ally => G.distance(ally, location) < ally.physicalRadius + source.physicalRadius + 4)) return -Infinity;
                        return -G.distance(location, source);
                    });

                    let locations = [location];
                    if (source.shouldActivateAbilityTwice()) {
                        let location2 = vec2(location);
                        let d = Ball.Random.onCircle(8);
                        location.add(d);
                        location2.add(d.scale(-1));
                        locations.push(location2);
                    }

                    for (let loc of locations) {
                        Dolly.summonClone(source, world, loc);
                    }

                    world.addWorldObject(newPuff(location.x, location.y, Battle.Layers.fx, 'small'));

                    source.flash(0xFFFFFF, 1);
                    world.playSound('sellball');

                    yield S.wait(0.15);
                }
    
            });

            source.setPreBattleAbilityActiveCheck(() => !script.done);
        }

        private static summonClone(source: Dolly, world: World, location: Pt) {
            world.addWorldObject(squadBallToWorldBall({
                x: location.x,
                y: location.y,
                properties: {
                    type: 137,
                    level: 1,
                    damage: source.power,
                    health: source.power,
                    equipment: -1,
                    metadata: {},
                }
            }, undefined, -1, source.team));

            if (source instanceof Dolly) {
                source.shouldActivateAbility = false;
            }
        }
    }
}