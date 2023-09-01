/**
 *  To add a new ability, simply add an entry to this map and
 *  trigger the ability with Ball.queueAbilities.
 */
const ABILITIES = {
    'onBallEnterBattle': { params: (ball: Ball) => null, manual: false, battle: true },
    'onBallDie': { params: (ball: Ball) => null, manual: false, battle: true },
    'onBallJoin': { params: (ball: Ball) => null, manual: false, battle: true },
    'onBallShootProjectile': { params: (ball: Ball, hitCount: number) => null, manual: false, battle: true },
    'onBallTakeDamage': { params: (ball: Ball, damage: number) => null, manual: false, battle: true },
    'onBuy': { params: () => null, manual: false, battle: false },
    'onCollideWithBallPreDamage': { params: (ball: Ball) => null, manual: false, battle: true },
    'onCollideWithEnemyPostDamage': { params: (enemy: Ball, damage: number) => null, manual: false, battle: true },
    'onDeath': { params: (killedBy: Ball) => null, manual: false, battle: true },
    'onEnterBattle': { params: () => null, manual: false, battle: true },
    'onEquip': { params: () => null, manual: false, battle: false },
    'onKill': { params: (killed: Ball) => null, manual: false, battle: true },
    'onLevelUp': { params: () => null, manual: false, battle: false },
    'onLevelDown': { params: () => null, manual: false, battle: false },
    'onPlay': { params: () => null, manual: false, battle: false },
    'onPreBattle': { params: () => null, manual: true, battle: true },
    'onRestock': { params: () => null, manual: false, battle: false },
    'onSell': { params: () => null, manual: false, battle: false },
    'onStartShop': { params: () => null, manual: false, battle: false },
    'onSurviveBattle': { params: () => null, manual: false, battle: false },
    'onTakeDamage': { params: (damage: number) => null, manual: false, battle: true },
    'onTakeLeechDamage': { params: (damage: number) => null, manual: false, battle: true },
    'update': { params: () => null, manual: false, battle: true },
}

type AbilityType = keyof typeof ABILITIES;
type AbilityConfig<BS extends Ball, T extends AbilityType> = {
    abilityFunction: AbilityFunction<BS, T>;
    nullifyable: boolean;
}
type AbilityFunction<BS extends Ball, T extends AbilityType> = (source: BS, world: World, ...rest: AbilityParams<T>) => void;
type AbilityOrderCmp = { sourceClass1: 'ball' | 'equipment', sourceType1: number, condition: '<' | '>', teamRelation: 'ally' | 'enemy', sourceClass2: 'ball' | 'equipment', sourceType2: number };
type AbilityParams<T extends AbilityType> = Parameters<typeof ABILITIES[T]['params']>;

const ABILITY_ORDERING: AbilityOrderCmp[] = [
    { sourceClass1: 'equipment', sourceType1: 27, condition: '>', teamRelation: 'ally', sourceClass2: 'ball', sourceType2: undefined },       // mitosis > friendly balls
    { sourceClass1: 'ball', sourceType1: 116, condition: '>', teamRelation: 'ally', sourceClass2: 'ball', sourceType2: 32 },                  // mimic > friendly poke ball
    { sourceClass1: 'ball', sourceType1: 142, condition: '>', teamRelation: 'ally', sourceClass2: 'ball', sourceType2: 32 },                  // greater mimic > friendly poke ball
    { sourceClass1: 'ball', sourceType1: 32, condition: '<', teamRelation: 'ally', sourceClass2: 'equipment', sourceType2: 39 },              // poke ball < friendly hunter's mark
    { sourceClass1: 'ball', sourceType1: 32, condition: '>', teamRelation: 'ally', sourceClass2: undefined, sourceType2: undefined },         // poke ball > friendly balls/eq
    { sourceClass1: 'equipment', sourceType1: 10, condition: '>', teamRelation: 'enemy', sourceClass2: 'equipment', sourceType2: undefined }, // thief mask > enemy equipment
    { sourceClass1: 'ball', sourceType1: 22, condition: '>', teamRelation: 'enemy', sourceClass2: 'equipment', sourceType2: undefined },      // sapper > enemy equipment
    { sourceClass1: 'equipment', sourceType1: 30, condition: '>', teamRelation: undefined, sourceClass2: 'ball', sourceType2: undefined },    // star catcher > all balls
    { sourceClass1: 'ball', sourceType1: 116, condition: '>', teamRelation: 'ally', sourceClass2: 'ball', sourceType2: undefined },           // mimic > friendly balls
    { sourceClass1: 'ball', sourceType1: 142, condition: '>', teamRelation: 'ally', sourceClass2: 'ball', sourceType2: undefined },           // greater mimic > friendly balls
    { sourceClass1: 'ball', sourceType1: 124, condition: '>', teamRelation: 'enemy', sourceClass2: 'ball', sourceType2: undefined },          // nullifier > enemy balls
    { sourceClass1: 'ball', sourceType1: 49, condition: '>', teamRelation: 'ally', sourceClass2: 'ball', sourceType2: undefined },            // booster > friendly balls
    { sourceClass1: 'ball', sourceType1: 102, condition: '>', teamRelation: 'enemy', sourceClass2: 'ball', sourceType2: undefined },          // reducer > enemy balls
    { sourceClass1: 'ball', sourceType1: 140, condition: '<', teamRelation: 'ally', sourceClass2: undefined, sourceType2: undefined },        // alchemist < friendly balls/eq
    { sourceClass1: 'equipment', sourceType1: 32, condition: '<', teamRelation: 'ally', sourceClass2: undefined, sourceType2: undefined },    // contagion < friendly balls/eq
    { sourceClass1: 'equipment', sourceType1: 15, condition: '<', teamRelation: undefined, sourceClass2: undefined, sourceType2: undefined }, // toxic fungus < all balls/eq
    { sourceClass1: 'ball', sourceType1: 33, condition: '<', teamRelation: undefined, sourceClass2: undefined, sourceType2: undefined },      // psychic < all balls/eq
    { sourceClass1: 'ball', sourceType1: 40, condition: '<', teamRelation: undefined, sourceClass2: undefined, sourceType2: undefined },      // ninja < all balls/eq
    { sourceClass1: 'ball', sourceType1: 40, condition: '<', teamRelation: 'ally', sourceClass2: 'equipment', sourceType2: 39 },              // ninja < friendly hunter's mark
    { sourceClass1: 'ball', sourceType1: 123, condition: '<', teamRelation: 'ally', sourceClass2: 'equipment', sourceType2: 39 },             // hitman < friendly hunter's mark
    { sourceClass1: 'ball', sourceType1: 32, condition: '>', teamRelation: 'enemy', sourceClass2: 'equipment', sourceType2: 39 },             // poke ball > enemy hunter's mark
    { sourceClass1: 'ball', sourceType1: 140, condition: '<', teamRelation: 'ally', sourceClass2: 'equipment', sourceType2: 39 },             // alchemist < friendly hunter's mark
    { sourceClass1: 'ball', sourceType1: 140, condition: '>', teamRelation: 'enemy', sourceClass2: 'equipment', sourceType2: 39 },            // alchemist > enemy hunter's mark
    { sourceClass1: 'equipment', sourceType1: 37, condition: '<', teamRelation: undefined, sourceClass2: undefined, sourceType2: undefined }, // joker < all balls/eq

    { sourceClass1: 'equipment', sourceType1: 8, condition: '>', teamRelation: undefined, sourceClass2: undefined, sourceType2: undefined },  // hyper driver > all balls/eq (on PLAY)
    { sourceClass1: 'ball', sourceType1: 101, condition: '>', teamRelation: undefined, sourceClass2: undefined, sourceType2: undefined },     // bank > all balls/eq (on PLAY)
    { sourceClass1: 'ball', sourceType1: 25, condition: '>', teamRelation: 'ally', sourceClass2: 'equipment', sourceType2: 20 },              // classic crown > best friend (on death)
    { sourceClass1: 'ball', sourceType1: 136, condition: '>', teamRelation: 'ally', sourceClass2: 'equipment', sourceType2: 20 },             // community crown > best friend (on death)
];

const MANUAL_ABILITIES_SAME_TIME_BALLS = [
    14,   // Buffer
    22,   // Sapper
    40,   // Ninja
    43,   // Mercenary

    102,  // Reducer
    116,  // Mimic
    123,  // Hitman
    124,  // Nullifier
    142,  // Greater Mimic
];

const MANUAL_ABILITIES_SAME_TIME_EQUIPMENT = [
    10,  // Thief Mask
    15,  // Toxic Fungus
    27,  // Mitosis
    30,  // Star Catcher
    32,  // Contagion
    37,  // Joker
];

class AbilitySet<BS extends Ball> {
    private abilities: { [T in AbilityType]?: AbilityConfig<BS, T>[] };

    constructor() {
        this.abilities = {};
    }

    addAbility<T extends AbilityType>(type: T, abilityFunction: AbilityFunction<BS, T>, nullifyable: boolean = true) {
        if (!(type in this.abilities)) {
            this.abilities[type] = [];
        }
        this.abilities[type].push({
            abilityFunction,
            nullifyable,
        });
    }

    cancelAbilities(source: Ball | Equipment) {
        if (!source.mainWorld) {
            console.error('cancelAbilities source has no mainWorld:', source);
            return;
        }
        let abilitySystem = source.mainWorld.select.type(AbilitySystem);
        if (!abilitySystem) return;
        abilitySystem.cancelAbilities(source);
    }

    hasAbility(abilityType: AbilityType) {
        return abilityType in this.abilities;
    }

    queueAbilities<T extends AbilityType>(abilityType: T, source: Ball | Equipment, nullified: boolean, abilityParams: AbilityParams<T>) {
        if (!this.hasAbility(abilityType)) return;
        if (!source.mainWorld) {
            console.error('queueAbilities source has no mainWorld:', abilityType, source);
            return;
        }
        let abilitySystem = source.mainWorld.select.type(AbilitySystem);
        if (!abilitySystem) return;

        let ballSource = source instanceof Ball ? source : source.getParent();
        if (!ballSource) {
            console.error('No ballSource found for ability:', abilityType, source);
            return;
        }

        for (let abilityConfig of this.abilities[abilityType]) {
            abilitySystem.queueAbility(source, ballSource, abilityType, abilityConfig, nullified, abilityParams);
        }
    }
}

type QueuedAbility<BS extends Ball, T extends AbilityType> = {
    sourceClass: 'ball' | 'equipment';
    sourceType: number;
    source: Ball | Equipment;
    ballSource: BS;
    abilityType: T;
    abilityFunction: AbilityFunction<BS, T>;
    abilityParams: AbilityParams<T>;
}

class AbilitySystem extends WorldObject {
    private queuedAbilities: QueuedAbility<Ball, AbilityType>[];

    constructor() {
        super();
        this.queuedAbilities = [];
    }

    activateAbilities() {
        this.consistentizeQueuedAbilities();
        while (!_.isEmpty(this.queuedAbilities)) {
            let nextIndex = this.queuedAbilities.findIndex(ability => !ABILITIES[ability.abilityType].manual);
            if (nextIndex < 0) return;
            let nextAbility = this.queuedAbilities.splice(nextIndex, 1)[0];
            //if (nextAbility.abilityType !== 'update') console.log('activating:', nextAbility.abilityType, nextAbility);
            nextAbility.abilityFunction(nextAbility.ballSource, this.world, ...nextAbility.abilityParams);
            nextAbility.ballSource.noteAbilityActivated(nextAbility.abilityType);
        }
    }

    activateNextManualAbilities() {
        let nextIndex = this.queuedAbilities.findIndex(ability => ABILITIES[ability.abilityType].manual);
        if (nextIndex < 0) return [];
        let nextAbilities = [this.queuedAbilities.splice(nextIndex, 1)[0]];

        let sameTimeForBalls = nextAbilities[0].sourceClass === 'ball' && _.contains(MANUAL_ABILITIES_SAME_TIME_BALLS, nextAbilities[0].sourceType);
        let sameTimeForEquipment = nextAbilities[0].sourceClass === 'equipment' && _.contains(MANUAL_ABILITIES_SAME_TIME_EQUIPMENT, nextAbilities[0].sourceType);

        if (sameTimeForBalls || sameTimeForEquipment) {
            for (let i = nextIndex; i < this.queuedAbilities.length; i++) {
                if (this.queuedAbilities[i].abilityType === nextAbilities[0].abilityType && this.queuedAbilities[i].sourceClass === nextAbilities[0].sourceClass && this.queuedAbilities[i].sourceType === nextAbilities[0].sourceType) {
                    nextAbilities.push(this.queuedAbilities.splice(i, 1)[0]);
                    i--;
                }
            }
        }

        //console.log('activating next:', nextAbilities[0].abilityType, nextAbilities);
        for (let nextAbility of nextAbilities) {
            nextAbility.abilityFunction(nextAbility.ballSource, this.world, ...nextAbility.abilityParams);
            nextAbility.ballSource.noteAbilityActivated(nextAbility.abilityType);
        }
        return nextAbilities;
    }

    cancelAbilities(source: Ball | Equipment) {
        A.filterInPlace(this.queuedAbilities, queuedAbility => {
            return queuedAbility.source !== source;
        });
    }

    consistentizeQueuedAbilities() {
        this.queuedAbilities.sort((a, b) => {
            if (a.sourceClass === 'ball' && b.sourceClass === 'equipment') return -1;
            if (a.sourceClass === 'equipment' && b.sourceClass === 'ball') return 1;
            return a.sourceType - b.sourceType;
        });

        let oldQueuedAbilities = this.queuedAbilities;
        this.queuedAbilities = [];

        for (let ability of oldQueuedAbilities) {
            this.pushAbility(ability);
        }
    }

    hasManualAbilitiesQueued() {
        return this.queuedAbilities.find(ability => ABILITIES[ability.abilityType].manual);
    }

    purgeDeadPreBattleAbilities() {
        A.filterInPlace(this.queuedAbilities, ability => {
            if (ability.abilityType !== 'onPreBattle') return true;
            if (!ability.source.world) return false;
            return true;
        });
    }

    queueAbility<BS extends Ball, T extends AbilityType>(source: Ball | Equipment, ballSource: BS, abilityType: T,
            abilityConfig: AbilityConfig<BS, AbilityType>, nullified: boolean, abilityParams: AbilityParams<T>) {

        if (nullified && abilityConfig.nullifyable) {
            if (source instanceof Ball) source.noteAbilityActivated(abilityType);
            return;
        }

        this.pushAbility({
            sourceClass: source instanceof Ball ? 'ball' : 'equipment',
            sourceType: source instanceof Ball ? source.properties.type : source.equipmentType,
            source,
            ballSource,
            abilityType,
            abilityFunction: abilityConfig.abilityFunction,
            abilityParams,
        });
    }

    postUpdate() {
        super.postUpdate();
        this.activateAbilities();
    }

    reset() {
        this.queuedAbilities = [];
    }

    private pushAbility<BS extends Ball, T extends AbilityType>(newAbility: QueuedAbility<BS, T>) {
        for (let i = 0; i < this.queuedAbilities.length; i++) {
            let queuedAbility = this.queuedAbilities[i];
            for (let ordering of ABILITY_ORDERING) {
                if (this.abilityMatchesOrdering(newAbility, queuedAbility, ordering)) {
                    if (ordering.condition === '>') {
                        this.queuedAbilities.splice(i, 0, newAbility);
                        return;
                    } else if (ordering.condition === '<') {
                        break;
                    }
                } else if (this.abilityMatchesOrdering(queuedAbility, newAbility, ordering)) {
                    if (ordering.condition === '<') {
                        this.queuedAbilities.splice(i, 0, newAbility);
                        return;
                    } else if (ordering.condition === '>') {
                        break;
                    }
                }
            }
            // New ability does not go in this position
        }

        // New ability did not cmp with any queued ability, push it to the end
        this.queuedAbilities.push(newAbility);
    }

    private abilityMatchesOrdering(ability1: QueuedAbility<Ball, AbilityType>, ability2: QueuedAbility<Ball, AbilityType>, ordering: AbilityOrderCmp) {
        if (ordering.sourceClass1 !== undefined && ability1.sourceClass !== ordering.sourceClass1) return false;
        if (ordering.sourceType1 !== undefined && ability1.sourceType !== ordering.sourceType1) return false;
        if (ordering.sourceClass2 !== undefined && ability2.sourceClass !== ordering.sourceClass2) return false;
        if (ordering.sourceType2 !== undefined && ability2.sourceType !== ordering.sourceType2) return false;

        if (ordering.teamRelation === 'ally' && ability1.ballSource.team !== ability2.ballSource.team) return false;
        if (ordering.teamRelation === 'enemy' && ability1.ballSource.team === ability2.ballSource.team) return false;

        return true;
    }
}
