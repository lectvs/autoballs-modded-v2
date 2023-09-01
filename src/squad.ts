type Squad = {
    name: string;
    balls: SquadBall[];
}

type SquadBall = {
    x: number;
    y: number;
    properties: SquadBallProperties;
}

type SquadBallProperties = {
    type: number;
    level: number;
    damage: number;
    health: number;
    equipment: number;
    metadata: SquadBallMetadata;
}

type SquadBallMetadata = {
    extraSellValue?: number;
    obtainedWithCrown?: boolean;
    currentRoundPower?: number;
    mutated?: boolean;
}

type BallTypeDef = {
    factory: (config: Ball.Config) => Ball;
    purchasable: boolean;
    tier: number;
    pack: 'classic' | 'community';
    soldInTiers?: number[];
    shopChance?: number;
    guaranteedShopChance?: number;
    isUnlocked?: () => boolean;
}

type BallItemTypeDef = {
    factory: (x: number, y: number) => BallItem;
    purchasable: boolean;
    tier: number;
    inOnlyOwnTier?: boolean;
    shopChance?: number;
    isUnlocked?: () => boolean;
}

type EquipmentTypeDef = {
    factory: () => Equipment;
    purchasable: boolean;
    tier: number;
}

const TYPE_TO_BALL_TYPE_DEF: { [type: number]: BallTypeDef } = {
    // Classic Pack
    0:  { factory: config => new Balls.Normal(config), purchasable: false, tier: 1, pack: 'classic' },
    1:  { factory: config => new Balls.Healer(config), purchasable: true, tier: 1, pack: 'classic' },
    2:  { factory: config => new Balls.Splitter(config), purchasable: true, tier: 2, pack: 'classic' },
    3:  { factory: config => new Balls.SplitterSpawn(config), purchasable: false, tier: 2, pack: 'classic' },
    4:  { factory: config => new Balls.Crusher(config), purchasable: true, tier: 2, pack: 'classic' },
    5:  { factory: config => new Balls.Martyr(config), purchasable: true, tier: 1, pack: 'classic' },
    6:  { factory: config => new Balls.Powerball(config), purchasable: true, tier: 1, pack: 'classic' },
    7:  { factory: config => new Balls.Grenade(config), purchasable: true, tier: 2, pack: 'classic' },
    8:  { factory: config => new Balls.EightBall(config), purchasable: true, tier: 1, pack: 'classic' },
    9:  { factory: config => new Balls.Coin(config), purchasable: true, tier: 1, pack: 'classic' },
    10: { factory: config => new Balls.CrystalBall(config), purchasable: true, tier: 2, pack: 'classic', guaranteedShopChance: 0.2 },
    11: { factory: config => new Balls.Turret(config), purchasable: true, tier: 3, pack: 'classic' },
    12: { factory: config => new Balls.Leech(config), purchasable: true, tier: 2, pack: 'classic' },
    13: { factory: config => new Balls.Trainer(config), purchasable: true, tier: 4, pack: 'classic' },
    14: { factory: config => new Balls.Buffer(config), purchasable: true, tier: 2, pack: 'classic' },
    15: { factory: config => new Balls.Zombie(config), purchasable: true, tier: 1, pack: 'classic' },
    16: { factory: config => new Balls.Skeleton(config), purchasable: false, tier: 1, pack: 'classic' },
    17: { factory: config => new Balls.Splinter(config), purchasable: true, tier: 1, pack: 'classic' },
    18: { factory: config => new Balls.Spiker(config), purchasable: true, tier: 2, pack: 'classic' },
    19: { factory: config => new Balls.Necromancer(config), purchasable: true, tier: 3, pack: 'classic' },
    20: { factory: config => new Balls.Normal(config), purchasable: false, tier: 2, pack: 'classic' },  // Thief
    21: { factory: config => new Balls.Gacha(config), purchasable: true, tier: 2, pack: 'classic' },
    22: { factory: config => new Balls.Sapper(config), purchasable: true, tier: 3, pack: 'classic' },
    23: { factory: config => new Balls.Vampire(config), purchasable: true, tier: 3, pack: 'classic' },
    24: { factory: config => new Balls.Pickleball(config), purchasable: true, tier: 1, pack: 'classic', isUnlocked: () => hasCompletedAchievement('StrongBall'), guaranteedShopChance: 0.4 },
    25: { factory: config => new Balls.Crown(config), purchasable: true, tier: 4, pack: 'classic', isUnlocked: () => hasCompletedAchievement('WinGame') },
    26: { factory: config => new Balls.Snowball(config), purchasable: true, tier: 1, pack: 'classic' },
    27: { factory: config => new Balls.Commando(config), purchasable: true, tier: 4, pack: 'classic' },
    28: { factory: config => new Balls.BallOfYarn(config), purchasable: true, tier: 2, pack: 'classic', isUnlocked: () => hasCompletedAchievement('CatEarsOnSquad') },
    29: { factory: config => new Balls.Sniper(config), purchasable: true, tier: 3, pack: 'classic' },
    30: { factory: config => new Balls.Mechanic(config), purchasable: true, tier: 2, pack: 'classic', isUnlocked: () => hasCompletedAchievement('WinWithoutEquipment') },
    31: { factory: config => new Balls.Normal(config), purchasable: false, tier: 4, pack: 'classic' },  // Bio-Grenade
    32: { factory: config => new Balls.PokeBall(config), purchasable: true, tier: 2, pack: 'classic', isUnlocked: () => hasCompletedAchievement('VictoryWithTwoBalls') },
    33: { factory: config => new Balls.Psychic(config), purchasable: true, tier: 3, pack: 'classic' },
    34: { factory: config => new Balls.DeathStar(config), purchasable: true, tier: 4, pack: 'classic', isUnlocked: () => hasCompletedAchievement('ReachRoundTwelve') },
    35: { factory: config => new Balls.Vagrant(config), purchasable: true, tier: 2, pack: 'classic', isUnlocked: () => hasCompletedAchievement('MakeFiveHundredPurchases') },
    36: { factory: config => new Balls.Medic(config), purchasable: true, tier: 2, pack: 'classic' },
    37: { factory: config => new Balls.RedCrystalBall(config), purchasable: true, tier: 1, pack: 'classic', soldInTiers: [1] },
    38: { factory: config => new Balls.GreenCrystalBall(config), purchasable: true, tier: 1, pack: 'classic', soldInTiers: [1] },
    39: { factory: config => new Balls.BallOfIce(config), purchasable: true, tier: 2, pack: 'classic', guaranteedShopChance: 0.2, isUnlocked: () => hasCompletedAchievement('WinWithoutFreezing') },
    40: { factory: config => new Balls.Ninja(config), purchasable: true, tier: 2, pack: 'classic' },
    41: { factory: config => new Balls.GlitchedBallArg(config), purchasable: false, tier: 1, pack: 'classic' },
    42: { factory: config => new Balls.GlitchedBall(config), purchasable: true, tier: 3, pack: 'classic', isUnlocked: () => hasCompletedAchievement('ArgPart1') },
    43: { factory: config => new Balls.Mercenary(config), purchasable: true, tier: 2, pack: 'classic', isUnlocked: () => hasCompletedAchievement('DealDamage') },
    44: { factory: config => new Balls.Assassin(config), purchasable: true, tier: 2, pack: 'classic' },
    45: { factory: config => new Balls.Gladiator(config), purchasable: true, tier: 3, pack: 'classic' },
    46: { factory: config => new Balls.Vanguard(config), purchasable: true, tier: 3, pack: 'classic' },
    47: { factory: config => new Balls.Recycler(config), purchasable: true, tier: 1, pack: 'classic', guaranteedShopChance: 0.3 },
    48: { factory: config => new Balls.Wobby(config), purchasable: true, tier: 3, pack: 'classic', guaranteedShopChance: 0.3 },
    49: { factory: config => new Balls.Booster(config), purchasable: true, tier: 2, pack: 'classic', isUnlocked: () => hasCompletedAchievement('CompleteVictoryLap') || hasCompletedAchievement('MidLevelBall') },
    50: { factory: config => new Balls.VoodooBall(config), purchasable: true, tier: 3, pack: 'classic' },
    51: { factory: config => new Balls.CueBall(config), purchasable: true, tier: 2, pack: 'classic' },
    52: { factory: config => new Balls.Toxin(config), purchasable: true, tier: 2, pack: 'classic', isUnlocked: () => hasCompletedAchievement('WinWeekly') },
    53: { factory: config => new Balls.Cannon(config), purchasable: true, tier: 4, pack: 'classic' },
    54: { factory: config => new Balls.Cannonball(config), purchasable: false, tier: 4, pack: 'classic' },
    77: { factory: config => new Balls.Pinata(config), purchasable: false, tier: 1, pack: 'classic' },

    // Community Pack
    100: { factory: config => new Balls.BioGrenade(config), purchasable: true, tier: 2, pack: 'community' },
    101: { factory: config => new Balls.Bank(config), purchasable: true, tier: 1, pack: 'community' },
    102: { factory: config => new Balls.Reducer(config), purchasable: true, tier: 2, pack: 'community' },
    103: { factory: config => new Balls.Matryoshka(config), purchasable: true, tier: 3, pack: 'community' },
    104: { factory: config => new Balls.Butterball(config), purchasable: true, tier: 2, pack: 'community' },
    105: { factory: config => new Balls.Sleeper(config), purchasable: true, tier: 2, pack: 'community' },
    106: { factory: config => new Balls.Angel(config), purchasable: true, tier: 1, pack: 'community' },
    107: { factory: config => new Balls.Devil(config), purchasable: true, tier: 3, pack: 'community' },
    108: { factory: config => new Balls.BlackHole(config), purchasable: true, tier: 2, pack: 'community' },
    109: { factory: config => new Balls.Boomer(config), purchasable: true, tier: 3, pack: 'community' },
    110: { factory: config => new Balls.Zoomer(config), purchasable: true, tier: 1, pack: 'community', isUnlocked: () => hasCompletedAchievement('BallGoBrrr') },
    111: { factory: config => new Balls.Guardian(config), purchasable: true, tier: 3, pack: 'community' },
    112: { factory: config => new Balls.Fragmenter(config), purchasable: true, tier: 1, pack: 'community' },
    113: { factory: config => new Balls.Watcher(config), purchasable: true, tier: 3, pack: 'community' },
    114: { factory: config => new Balls.Wizard(config), purchasable: true, tier: 2, pack: 'community' },
    115: { factory: config => new Balls.Stinger(config), purchasable: true, tier: 2, pack: 'community' },
    116: { factory: config => new Balls.Mimic(config), purchasable: true, tier: 3, pack: 'community', isUnlocked: () => hasCompletedAchievement('SameBall') },
    117: { factory: config => new Balls.Scavenger(config), purchasable: true, tier: 1, pack: 'community' },
    118: { factory: config => new Balls.Cheel(config), purchasable: true, tier: 2, pack: 'community' },
    119: { factory: config => new Balls.Fireball(config), purchasable: true, tier: 1, pack: 'community' },
    120: { factory: config => new Balls.Phoenix(config), purchasable: true, tier: 3, pack: 'community' },
    121: { factory: config => new Balls.Impostor(config), purchasable: true, tier: 2, pack: 'community' },
    122: { factory: config => new Balls.Miner(config), purchasable: true, tier: 2, pack: 'community' },
    123: { factory: config => new Balls.Hitman(config), purchasable: true, tier: 3, pack: 'community' },
    124: { factory: config => new Balls.Nullifier(config), purchasable: true, tier: 3, pack: 'community' },
    125: { factory: config => new Balls.QuestionBall(config), purchasable: true, tier: 1, pack: 'community' },
    126: { factory: config => new Balls.Seed(config), purchasable: true, tier: 1, pack: 'community', soldInTiers: [1, 2, 3] },
    127: { factory: config => new Balls.Dove(config), purchasable: true, tier: 2, pack: 'community', shopChance: 0.333, guaranteedShopChance: 0, isUnlocked: () => hasCompletedAchievement('HealHp') },
    128: { factory: config => new Balls.Watermelon(config), purchasable: true, tier: 1, pack: 'community' },
    129: { factory: config => new Balls.Grave(config), purchasable: true, tier: 4, pack: 'community' },
    130: { factory: config => new Balls.ScrapCannon(config), purchasable: true, tier: 4, pack: 'community' },
    131: { factory: config => new Balls.Haunt(config), purchasable: true, tier: 3, pack: 'community' },
    132: { factory: config => new Balls.FireFighter(config), purchasable: true, tier: 4, pack: 'community' },
    133: { factory: config => new Balls.Battery(config), purchasable: true, tier: 4, pack: 'community' },
    134: { factory: config => new Balls.OldCrystalBall(config), purchasable: true, tier: 2, pack: 'community', guaranteedShopChance: 0.2 },
    135: { factory: config => new Balls.NeoCrystalBall(config), purchasable: true, tier: 2, pack: 'community', guaranteedShopChance: 0.2 },
    136: { factory: config => new Balls.Crown(config), purchasable: true, tier: 4, pack: 'community', isUnlocked: () => hasCompletedAchievement('WinGame') },
    137: { factory: config => new Balls.Dolly(config), purchasable: true, tier: 2, pack: 'community', isUnlocked: () => hasCompletedAchievement('FiveRemainingBalls') },
    138: { factory: config => new Balls.Burner(config), purchasable: true, tier: 2, pack: 'community', isUnlocked: () => hasCompletedAchievement('DealBurnDamage') },
    139: { factory: config => new Balls.GoldCrystalBall(config), purchasable: true, tier: 3, pack: 'community', shopChance: 0.25, guaranteedShopChance: 0.2, isUnlocked: () => hasCompletedAchievement('WinDaily') },
    140: { factory: config => new Balls.Alchemist(config), purchasable: true, tier: 2, pack: 'community', isUnlocked: () => hasCompletedAchievement('CompleteBallmanacEntries') },
    141: { factory: config => new Balls.Seeker(config), purchasable: true, tier: 1, pack: 'community' },
    142: { factory: config => new Balls.Mimic(config), purchasable: false, tier: 4, pack: 'community' },
    143: { factory: config => new Balls.BowlingBall(config), purchasable: true, tier: 1, pack: 'community', isUnlocked: () => hasCompletedAchievement('KillEnemiesInRound') },
    144: { factory: config => new Balls.Stopper(config), purchasable: true, tier: 3, pack: 'community' },
}

const TYPE_TO_ITEM_TYPE_DEF: { [type: number]: BallItemTypeDef } = {
    0:  { factory: (x, y) => new BallItems.Spinach(x, y), purchasable: true, tier: 2 },
    1:  { factory: (x, y) => new BallItems.Shield(x, y), purchasable: true, tier: 3 },
    2:  { factory: (x, y) => new BallItems.Magnet(x, y), purchasable: true, tier: 1 },
    3:  { factory: (x, y) => new BallItems.SkullCharm(x, y), purchasable: true, tier: 1 },
    4:  { factory: (x, y) => new BallItems.ArmorPlating(x, y), purchasable: true, tier: 3 },
    5:  { factory: (x, y) => new BallItems.BallSharpener(x, y), purchasable: true, tier: 2 },
    6:  { factory: (x, y) => new BallItems.Polisher(x, y), purchasable: true, tier: 1 },
    7:  { factory: (x, y) => new BallItems.CatEars(x, y), purchasable: true, tier: 1 },
    8:  { factory: (x, y) => new BallItems.Claws(x, y), purchasable: true, tier: 2 },
    9:  { factory: (x, y) => new BallItems.TheseGuns(x, y), purchasable: true, tier: 3 },
    10: { factory: (x, y) => new BallItems.Rejuvenator(x, y), purchasable: true, tier: 3 },
    11: { factory: (x, y) => new BallItems.CloutInAJar(x, y), purchasable: true, tier: 2 },
    12: { factory: (x, y) => new BallItems.Pickle(x, y), purchasable: false, tier: 1 },
    13: { factory: (x, y) => new BallItems.HotPickle(x, y), purchasable: false, tier: 1 },
    14: { factory: (x, y) => new BallItems.ConsolationPrize(x, y), purchasable: false, tier: 2, isUnlocked: () => hasCompletedAchievement('PlayFiveGames') },
    15: { factory: (x, y) => new BallItems.BallSharpener1(x, y), purchasable: true, tier: 1, inOnlyOwnTier: true, isUnlocked: () => hasCompletedAchievement('StrongSquad') },
    16: { factory: (x, y) => new BallItems.Polisher1(x, y), purchasable: false, tier: 1, inOnlyOwnTier: true },
    17: { factory: (x, y) => new BallItems.HyperDriver(x, y), purchasable: true, tier: 3, isUnlocked: () => hasCompletedAchievement('RoundsInARow') },
    18: { factory: (x, y) => new BallItems.PolarityInverter(x, y), purchasable: true, tier: 2 },
    19: { factory: (x, y) => new BallItems.ThiefMask(x, y), purchasable: true, tier: 2 },
    20: { factory: (x, y) => new BallItems.Bounty(x, y), purchasable: true, tier: 1, isUnlocked: () => hasCompletedAchievement('HaveTwentyGold') },
    21: { factory: (x, y) => new BallItems.UnstableCatalyst(x, y), purchasable: true, tier: 2, isUnlocked: () => hasCompletedAchievement('WinInTenMinutes') },
    22: { factory: (x, y) => new BallItems.Overcharger(x, y), purchasable: true, tier: 3 },
    23: { factory: (x, y) => new BallItems.ToxicFungus(x, y), purchasable: true, tier: 2, isUnlocked: () => hasCompletedAchievement('WinFiftyRounds') },
    24: { factory: (x, y) => new BallItems.SmokeBomb(x, y), purchasable: true, tier: 2, isUnlocked: () => hasCompletedAchievement('PlayHundredRounds') },
    25: { factory: (x, y) => new BallItems.GlitchedItemArg(x, y), purchasable: false, tier: 2 },
    26: { factory: (x, y) => new BallItems.Bandaid(x, y), purchasable: true, tier: 1 },
    27: { factory: (x, y) => new BallItems.VIPTicket(x, y), purchasable: true, tier: 3, isUnlocked: () => hasCompletedAchievement('DefeatCrownedSquads') },
    28: { factory: (x, y) => new BallItems.Supernova(x, y), purchasable: true, tier: 2 },
    29: { factory: (x, y) => new BallItems.RetroGlasses(x, y), purchasable: true, tier: 3 },
    30: { factory: (x, y) => new BallItems.BestFriend(x, y), purchasable: true, tier: 3 },
    31: { factory: (x, y) => new BallItems.OrbitingPotato(x, y), purchasable: true, tier: 2 },
    32: { factory: (x, y) => new BallItems.ScribbledMap(x, y), purchasable: false, tier: 1 },
    33: { factory: (x, y) => new BallItems.VoodooPin(x, y), purchasable: true, tier: 3 },
    34: { factory: (x, y) => new BallItems.Silencer(x, y), purchasable: true, tier: 3 },
    35: { factory: (x, y) => new BallItems.Medkit(x, y), purchasable: true, tier: 2 },
    36: { factory: (x, y) => new BallItems.Mitosis(x, y), purchasable: true, tier: 3 },
    37: { factory: (x, y) => new BallItems.ParticipationTrophy(x, y), purchasable: false, tier: 1, inOnlyOwnTier: true, isUnlocked: () => hasCompletedAchievement('PlayFiveGames') },
    38: { factory: (x, y) => new BallItems.BirthdayCake(x, y), purchasable: false, tier: 1 },
    39: { factory: (x, y) => new BallItems.Gift(x, y), purchasable: false, tier: 1 },
    40: { factory: (x, y) => new BallItems.Jetpack(x, y), purchasable: true, tier: 2 },
    41: { factory: (x, y) => new BallItems.ProtectionBubble(x, y), purchasable: true, tier: 2 },
    42: { factory: (x, y) => new BallItems.StarCatcher(x, y), purchasable: true, tier: 2 },
    43: { factory: (x, y) => new BallItems.Contagion(x, y), purchasable: true, tier: 3 },
    44: { factory: (x, y) => new BallItems.RedCube(x, y), purchasable: true, tier: 1 },
    45: { factory: (x, y) => new BallItems.GreenCube(x, y), purchasable: true, tier: 1 },
    46: { factory: (x, y) => new BallItems.CollectibleCoin(x, y), purchasable: true, tier: 2, isUnlocked: () => hasCompletedAchievement('SellCoin') },
    47: { factory: (x, y) => new BallItems.MolecularDisassembler(x, y), purchasable: true, tier: 2 },
    48: { factory: (x, y) => new BallItems.CursedDoll(x, y), purchasable: true, tier: 3 },
    49: { factory: (x, y) => new BallItems.CursedEye(x, y), purchasable: true, tier: 3 },
    50: { factory: (x, y) => new BallItems.Joker(x, y), purchasable: true, tier: 2, shopChance: 0.5 },
    51: { factory: (x, y) => new BallItems.TimeBomb(x, y), purchasable: true, tier: 2 },
    52: { factory: (x, y) => new BallItems.HuntersMark(x, y), purchasable: true, tier: 2, isUnlocked: () => hasCompletedAchievement('ShootProjectiles') },
    53: { factory: (x, y) => new BallItems.Curry(x, y), purchasable: true, tier: 3 },
    54: { factory: (x, y) => new BallItems.TheBug(x, y), purchasable: true, tier: 2, shopChance: 0.5 },
    55: { factory: (x, y) => new BallItems.Mocha(x, y), purchasable: true, tier: 3, isUnlocked: () => hasCompletedAchievement('KillBeforeBattle') },
}

const TYPE_TO_EQUIPMENT_TYPE_DEF: { [type: number]: EquipmentTypeDef } = {
    0:  { factory: () => new Equipments.Shield(), purchasable: true, tier: 3 },
    1:  { factory: () => new Equipments.Magnet(), purchasable: true, tier: 1 },
    2:  { factory: () => new Equipments.SkullCharm(), purchasable: true, tier: 1 },
    3:  { factory: () => new Equipments.ArmorPlating(), purchasable: true, tier: 3 },
    4:  { factory: () => new Equipments.CatEars(), purchasable: true, tier: 1 },
    5:  { factory: () => new Equipments.Claws(), purchasable: true, tier: 2 },
    6:  { factory: () => new Equipments.TheseGuns(), purchasable: true, tier: 3 },
    7:  { factory: () => new Equipments.Rejuvenator(), purchasable: true, tier: 3 },
    8:  { factory: () => new Equipments.HyperDriver(), purchasable: true, tier: 3 },
    9:  { factory: () => new Equipments.PolarityInverter(), purchasable: true, tier: 2 },
    10: { factory: () => new Equipments.ThiefMask(), purchasable: true, tier: 2 },
    11: { factory: () => new Equipments.Bounty(), purchasable: true, tier: 1 },
    12: { factory: () => new Equipments.UnstableCatalyst(), purchasable: true, tier: 2 },
    13: { factory: () => new Equipments.Overcharger(), purchasable: true, tier: 3 },
    14: { factory: () => new Equipments.Spore(), purchasable: false, tier: 3 },
    15: { factory: () => new Equipments.ToxicFungus(), purchasable: true, tier: 2 },
    16: { factory: () => new Equipments.SmokeBomb(), purchasable: true, tier: 2 },
    17: { factory: () => new Equipments.Bandaid(), purchasable: true, tier: 1 },
    18: { factory: () => new Equipments.VIPTicket(), purchasable: true, tier: 3 },
    19: { factory: () => new Equipments.RetroGlasses(), purchasable: true, tier: 3 },
    20: { factory: () => new Equipments.BestFriend(), purchasable: true, tier: 3 },
    21: { factory: () => new Equipments.OrbitingPotato(1), purchasable: true, tier: 2 },
    22: { factory: () => new Equipments.OrbitingPotato(2), purchasable: false, tier: 2 },
    23: { factory: () => new Equipments.OrbitingPotato(3), purchasable: false, tier: 2 },
    24: { factory: () => new Equipments.VoodooPin(), purchasable: true, tier: 3 },
    25: { factory: () => new Equipments.Silencer(), purchasable: true, tier: 3 },
    26: { factory: () => new Equipments.Medkit(), purchasable: true, tier: 2 },
    27: { factory: () => new Equipments.Mitosis(), purchasable: true, tier: 3 },
    28: { factory: () => new Equipments.Jetpack(), purchasable: true, tier: 2 },
    29: { factory: () => new Equipments.ProtectionBubble(), purchasable: true, tier: 2 },
    30: { factory: () => new Equipments.StarCatcher(), purchasable: true, tier: 2 },
    31: { factory: () => new Equipments.Infection(), purchasable: false, tier: 3 },
    32: { factory: () => new Equipments.Contagion(), purchasable: true, tier: 3 },
    33: { factory: () => new Equipments.RedCube(), purchasable: true, tier: 1 },
    34: { factory: () => new Equipments.GreenCube(), purchasable: true, tier: 1 },
    35: { factory: () => new Equipments.CursedDoll(), purchasable: true, tier: 3 },
    36: { factory: () => new Equipments.CursedEye(), purchasable: true, tier: 3 },
    37: { factory: () => new Equipments.Joker(), purchasable: true, tier: 2 },
    38: { factory: () => new Equipments.TimeBomb(), purchasable: true, tier: 2 },
    39: { factory: () => new Equipments.HuntersMark(), purchasable: true, tier: 2 },
    40: { factory: () => new Equipments.Curry(), purchasable: true, tier: 3 },
    41: { factory: () => new Equipments.TheBug(), purchasable: true, tier: 2 },
    42: { factory: () => new Equipments.Mocha(), purchasable: true, tier: 3 },
}

const TIER_LEVELS_AVAILABLE: { [round: number]: [number, number, number, number] } = {
    // round: [ tier1level, tier2level, tier3level, tier3+level ]
    1:  [1, 0, 0, 0],
    2:  [1, 0, 0, 0],
    3:  [1, 0, 0, 0],
    4:  [2, 1, 0, 0],
    5:  [2, 1, 0, 0],
    6:  [2, 1, 0, 0],
    7:  [3, 2, 1, 0],
    8:  [3, 2, 1, 0],
    9:  [3, 2, 1, 0],
    10: [3, 2, 1, 1],
}

const TIER_COLORS = [0xFFFFFF, 0xFFFF00, 0xFF00FF, 0x00FFFF];

const BALL_SHOP_TIER_WEIGHTS = {
    1: 1,
    2: 1.5,
    3: 2,
    4: 2.5,
}

function getShopTierForRound(round: number) {
    let tierLevelsAvailable = getTierLevelsAvailableForRound(round);
    for (let i = tierLevelsAvailable.length-1; i >= 0; i--) {
        if (tierLevelsAvailable[i] > 0) return i+1;
    }
    return 1;
}

function isTierJustUnlocked(tier: number) {
    return getTierLevelAvailableForRound(tier, GAME_DATA.round-1) === 0 && getTierLevelAvailableForRound(tier, GAME_DATA.round) > 0;
}

function getTierJustUnlocked() {
    for (let tier = 1; tier <= TIER_LEVELS_AVAILABLE[1].length; tier++) {
        if (isTierJustUnlocked(tier)) return tier;
    }
    return -1;
}

function getColorForTier(tier: number) {
    if (tier < 1 || tier > TIER_COLORS.length) {
        console.error(`Invalid tier: ${tier}?`);
        tier = M.clamp(tier, 1, TIER_COLORS.length);
    }
    return TIER_COLORS[tier-1];
}

function getTierLevelsAvailableForRound(round: number) {
    return TIER_LEVELS_AVAILABLE[M.clamp(round, 1, M.max(Object.keys(TIER_LEVELS_AVAILABLE), parseInt))];
}

function getTierLevelAvailableForRound(tier: number, round: number) {
    let tierLevelsAvailable = getTierLevelsAvailableForRound(round);
    if (tier < 1 || tier > tierLevelsAvailable.length) {
        console.error(`Invalid tier: ${tier}?`);
        tier = M.clamp(tier, 1, tierLevelsAvailable.length);
    }
    return tierLevelsAvailable[tier-1];
}

function getPurchasableBallTypesForRound(round: number, packs: Pack[], weekly: { week: number }) {
    let allBallTypes = A.removeDuplicates(_.flatten(packs.map(pack => getAllBallTypesForPack(pack, weekly))) as number[]);
    let types = allBallTypes.filter(type => TYPE_TO_BALL_TYPE_DEF[type].purchasable
            && getTierLevelAvailableForRound(TYPE_TO_BALL_TYPE_DEF[type].tier, round) > 0
            && (!TYPE_TO_BALL_TYPE_DEF[type].soldInTiers || _.contains(TYPE_TO_BALL_TYPE_DEF[type].soldInTiers, getShopTierForRound(round)))
            && isBallTypeUnlocked(type));

    // De-dupe Crown.
    if (_.includes(packs, 'classic') && _.includes(types, 136)) {
        A.removeAll(types, 136);
    }

    return types;
}

function isBallTypeUnlocked(type: number) {
    if (_.isEmpty(GAME_DATA?.availableBallTypes)) {
        return !TYPE_TO_BALL_TYPE_DEF[type].isUnlocked || TYPE_TO_BALL_TYPE_DEF[type].isUnlocked();
    }
    return _.contains(GAME_DATA.availableBallTypes, type);
}

function getPurchasableBallTypesForRoundTier(round: number, tier: number, packs: Pack[], weekly: { week: number }) {
    return getPurchasableBallTypesForRound(round, packs, weekly).filter(type => TYPE_TO_BALL_TYPE_DEF[type].tier === tier);
}

function getBallTypeLevelForRound(type: number, round: number) {
    if (!TYPE_TO_BALL_TYPE_DEF[type]) return 1;
    return getTierLevelAvailableForRound(TYPE_TO_BALL_TYPE_DEF[type].tier, round);
}

function getBallShopChanceForType(ballType: number) {
    if (!(ballType in TYPE_TO_BALL_TYPE_DEF)) return 0;
    let ballTypeDef = TYPE_TO_BALL_TYPE_DEF[ballType];

    let tierWeight = BALL_SHOP_TIER_WEIGHTS[ballTypeDef.tier] ?? 1;
    let shopChanceWeight = ballTypeDef.shopChance ?? 1

    return shopChanceWeight * tierWeight;
}

function getBallShopGuaranteedChanceForType(ballType: number) {
    if (!(ballType in TYPE_TO_BALL_TYPE_DEF)) return 0;
    let ballTypeDef = TYPE_TO_BALL_TYPE_DEF[ballType];
    return ballTypeDef.guaranteedShopChance ?? 0.8;
}

function getItemShopChanceForType(itemType: number) {
    if (!(itemType in TYPE_TO_ITEM_TYPE_DEF)) return 0;
    let itemTypeDef = TYPE_TO_ITEM_TYPE_DEF[itemType];

    let shopChanceWeight = itemTypeDef.shopChance ?? 1
    return shopChanceWeight;
}

function getPurchasableBallItemTypesForRound(round: number) {
    return Object.keys(TYPE_TO_ITEM_TYPE_DEF)
                    .map(type => parseInt(type))
                    .filter(type => TYPE_TO_ITEM_TYPE_DEF[type].purchasable
                                && getTierLevelAvailableForRound(TYPE_TO_ITEM_TYPE_DEF[type].tier, round) > 0
                                && (!TYPE_TO_ITEM_TYPE_DEF[type].inOnlyOwnTier || getTierLevelAvailableForRound(TYPE_TO_ITEM_TYPE_DEF[type].tier, round) < 2)
                                && isItemTypeUnlocked(type));
}

function getAllEquipmentTypes() {
    return Object.keys(TYPE_TO_EQUIPMENT_TYPE_DEF)
                    .map(type => parseInt(type))
                    .filter(type => type !== 4);  // Do not randomly generate cat ears
}

function isItemTypeUnlocked(itemType: number) {
    if (!(itemType in TYPE_TO_ITEM_TYPE_DEF)) {
        console.error('Invalid item type:', itemType, 'Defaulting to locked');
        return false;
    }
    if (!_.isEmpty(GAME_DATA?.availableItemTypes)) {
        return _.contains(GAME_DATA.availableItemTypes, itemType);
    }
    let typeDef = TYPE_TO_ITEM_TYPE_DEF[itemType];
    return !typeDef.isUnlocked || typeDef.isUnlocked();
}

function squadBallToWorldBall(squadBall: SquadBall, squad: Squad, squadIndexReference: number, team: Ball.Team, flippedSide: boolean = false, isSummon: boolean = true) {
    let ballType = TYPE_TO_BALL_TYPE_DEF[squadBall.properties.type];
    if (!ballType) {
        console.error('Invalid ball type:', squadBall.properties.type, 'Defaulting to normal ball');
        ballType = TYPE_TO_BALL_TYPE_DEF[0];
    }
    let ball = ballType.factory({
        x: flippedSide ? global.gameWidth - squadBall.x : squadBall.x,
        y: squadBall.y,
        properties: squadBall.properties,
        squad: squad,
        squadIndexReference: squadIndexReference,
        team: team,
    });
    ball.tier = ballType.tier;
    ball.isSummon = isSummon;
    return ball;
}

function randomSquadBall(x: number, y: number, round: number, packs: Pack[], weekly: { week: number }): SquadBall {
    let purchasableBallTypes = getPurchasableBallTypesForRound(round, packs, weekly);
    let equipmentTypes = getAllEquipmentTypes();
    return {
        x, y,
        properties: {
            type: Ball.Random.element(purchasableBallTypes),
            level: 1,
            damage: 1,
            health: 1,
            equipment: round >= 6 && Ball.Random.boolean(0.4) ? Ball.Random.element(equipmentTypes) : -1,
            metadata: {},
        }
    };
}

function itemTypeToBallItem(type: number, x: number, y: number) {
    let itemType = TYPE_TO_ITEM_TYPE_DEF[type];
    if (!itemType) {
        console.error('Invalid item type:', type, 'Defaulting to food');
        itemType = TYPE_TO_ITEM_TYPE_DEF[0];
    }
    let item = itemType.factory(x, y);
    item.type = type;
    item.tier = itemType.tier;
    return item;
}

function equipmentTypeToEquipment(type: number) {
    if (type < 0) return undefined;
    let equipmentType = TYPE_TO_EQUIPMENT_TYPE_DEF[type];
    if (!equipmentType) {
        console.error('Invalid equipment type:', type, 'Defaulting to none');
        return undefined;
    }
    let equipment = equipmentType.factory();
    equipment.equipmentType = type;
    return equipment;
}

function getPurchasableEquipmentTypesForExactTier(tier: number) {
    return Object.keys(TYPE_TO_EQUIPMENT_TYPE_DEF)
                    .map(type => parseInt(type))
                    .filter(type => TYPE_TO_EQUIPMENT_TYPE_DEF[type].purchasable && TYPE_TO_EQUIPMENT_TYPE_DEF[type].tier === tier);
}

function getPurchasableEquipmentTypesForRound(round: number) {
    let tier = getShopTierForRound(round);
    return _.flatten(A.range(1, 4).filter(i => i <= tier).map(t => getPurchasableEquipmentTypesForExactTier(t))) as number[];
}

function generateBotSquadForRound(round: number, packs: Pack[], weekly: { week: number }): Squad {
    let balls: SquadBall[] = [];

    for (let i = 0; i < 3*round; i++) {
        if (balls.length < 5) {
            let p = Random.inCircle(50);
            let ball = randomSquadBall(70 + p.x, 120 + p.y, round, packs, weekly);
            balls.push(ball);
        } else {
            if (Random.boolean(1/3)) {
                if (Random.boolean()) Random.element(balls).properties.damage += 2;
                else Random.element(balls).properties.health += 2;
            } else if (Random.boolean(1/2)) {
                Random.element(balls).properties.equipment = Random.element(getPurchasableEquipmentTypesForExactTier(getShopTierForRound(round)));
            } else {
                Random.element(balls).properties.level++;
            }
        }
    }

    return {
        name: 'BOT',
        balls: balls,
    };
}

const EQUIPMENT_TYPE_TO_ITEM_TYPE: DictNumber<number> = {};
function loadEquipmentTypesToItemTypes() {
    for (let type in TYPE_TO_ITEM_TYPE_DEF) {
        let item = TYPE_TO_ITEM_TYPE_DEF[type].factory(0, 0);
        for (let equipmentType of item.mapToEquipmentTypes) {
            EQUIPMENT_TYPE_TO_ITEM_TYPE[equipmentType] = parseInt(type);
        }
    }
}

function getItemTypeForEquipmentType(equipmentType: number) {
    if (equipmentType in EQUIPMENT_TYPE_TO_ITEM_TYPE) {
        return EQUIPMENT_TYPE_TO_ITEM_TYPE[equipmentType];
    }
    return -1;
}

function getAvailableBallTypesOnlyUnlocked() {
    return Object.keys(TYPE_TO_BALL_TYPE_DEF).map(type => parseInt(type))
                .filter(type => {
                    let ballType = TYPE_TO_BALL_TYPE_DEF[type];
                    if (!ballType.isUnlocked || ballType.isUnlocked()) return true;
                    return false;
                });
}

function getAvailableItemTypesOnlyUnlocked() {
    return Object.keys(TYPE_TO_ITEM_TYPE_DEF).map(type => parseInt(type))
                .filter(type => {
                    let itemType = TYPE_TO_ITEM_TYPE_DEF[type];
                    if (!itemType.isUnlocked || itemType.isUnlocked()) return true;
                    return false;
                });
}

function getAvailableBallTypesAll() {
    return Object.keys(TYPE_TO_BALL_TYPE_DEF).map(type => parseInt(type));
}

function getAvailableItemTypesAll() {
    return Object.keys(TYPE_TO_ITEM_TYPE_DEF).map(type => parseInt(type));
}

function getAllBallTypesForPack(pack: Pack, weekly: { week: number }) {
    if (pack === 'weekly') {
        return getAllBallTypesForWeekly(weekly);
    }

    return Object.keys(TYPE_TO_BALL_TYPE_DEF).map(type => parseInt(type))
        .filter(type => TYPE_TO_BALL_TYPE_DEF[type].pack === pack);
}

const ECONOMY_BALLS = [
    6,   // Powerball
    8,   // 8 Ball
    9,   // Coin
    101, // Bank
    125, // ? Ball
];

function getAllBallTypesForWeekly(weekly: { week: number }) {
    let rng = new RandomNumberGenerator();
    let weeklySeed = weekly.week;
    let tierPurchasableCounts = [10, 15, 10, 4];

    let ballTypes: number[] = [];

    for (let tier = 1; tier <= 4; tier++) {
        let purchasableBallTypes = Object.keys(TYPE_TO_BALL_TYPE_DEF).map(type => parseInt(type))
            .filter(type => TYPE_TO_BALL_TYPE_DEF[type].tier === tier && TYPE_TO_BALL_TYPE_DEF[type].purchasable && type !== 25 && type !== 136);
        
        rng.seed(`weekly_${weeklySeed}_tier_${tier}`);
        ballTypes.push(...rng.sample(purchasableBallTypes, tierPurchasableCounts[tier-1]));

        if (tier === 4) {
            ballTypes.push(25);  // Crown
        }
    }

    // Hack for week 1 since we changed the algorithm.
    if (weekly.week === 1) {
        ballTypes.splice(ballTypes.length-5, 5);
        ballTypes.push(27, 34, 130, 133, 136);
    }

    // Hack for week 3 for a better tournament.
    if (weekly.week === 3) {
        A.removeAll(ballTypes, 8);
        ballTypes.push(6);
    }

    // Ensure at least 2 economy balls in each weekly.
    if (weekly.week >= 4) {
        let existingEconomyBallTypes = ballTypes.filter(type => _.contains(ECONOMY_BALLS, type));
        if (existingEconomyBallTypes.length < 2) {
            rng.seed(`weekly_${weeklySeed}_adjusteconomy`);
            for (let i = 0; i < ballTypes.length; i++) {
                if (TYPE_TO_BALL_TYPE_DEF[ballTypes[i]].tier === 1 && !_.includes(ECONOMY_BALLS, ballTypes[i])) {
                    let validBallTypes = ECONOMY_BALLS.filter(type => !_.includes(existingEconomyBallTypes, type));
                    ballTypes[i] = rng.element(validBallTypes);
                    break;
                }
            }
        }
    }

    return A.sort(ballTypes, type => type);
}