const MODIFIERS = {
    'nospeedcap': {
        description: "The speed cap is disabled",
    },
    'extradmg': {
        description: "Shop balls gain [r]+2<sword>[/r]",
    },
    'extrahp': {
        description: "Shop balls gain [g]+2<heart>[/g]",
    },
    'extrastars': {
        description: "Shop balls gain +1[gold]<star>[/gold]",
    },
    'lessgold': {
        description: "Start each shop with [r]-[/r][gold]1<coin>[/gold]",
    },
    'moregold': {
        description: "Start each shop with [g]+[/g][gold]1<coin>[/gold]",
    },
    'preequipped': {
        description: "Shop balls come pre-equipped",
    },
    'sameballsstocked': {
        description: "The shop stocks identical balls",
    },
    'birthday': {
        description: "Happy Birthday Auto Balls!",
    },
    'packclash': {
        description: "Pack Clash!\nClassic vs Community!",
    },
    // 'sharedhp': {
    //     description: "Allies share a common HP pool",
    // },
    'spores': {
        description: "Shop balls come with\n[dg]spore equipments[/dg]",
    },
    'lesssell': {
        description: "Balls sell for [r]-[/r][gold]1<coin>[/gold]",
    },
    'moresell': {
        description: "Balls sell for [g]+[/g][gold]1<coin>[/gold]",
    },
    'challengemode': {
        description: "Face only\n[gold][offsetx -3]<crown>[/offsetx][/gold]Winning squads",
    },
    'noitems': {
        description: "The shop does not stock\nitems or equipment",
    },
    'moreballs': {
        description: "The shop stocks one more\nball and one fewer item",
    },
    'slowcollisions': {
        description: "Balls stop on collision\nwith an enemy",
    },
    'ballsexplode': {
        description: "Balls explode on death, dealing [r]1<sword>[/r]\nto [r]both enemies and allies[/r]",
    },
    'earlyshrink': {
        description: "The arena's anti-timeout\nis active immediately",
    },
    'pickles': {
        description: "The shop stocks random pickles",
    },
    'onlyintier': {
        description: "The shop stocks balls\nfrom the current tier only",
    },
    'lesssquadsize': {
        description: "You can have one fewer\nball in your squad",
    },
    'moresquadsize': {
        description: "You can have one more\nball in your squad",
    },
    'lessrestockcost': {
        description: "Restocks cost [g]-[/g][gold]1<coin>[/gold]",
    },
    'morerestockcost': {
        description: "Restocks cost [r]+[/r][gold]1<coin>[/gold]",
    },
    'wallshurt': {
        description: "The arena's walls deal [r]0.5<sword>[/r]\non collision",
    },
    'wallsbounce': {
        description: "The arena's walls are bouncy",
    },
}

type Modifier = keyof typeof MODIFIERS;

function getModifierDescription(modifier: string) {
    if (modifier in MODIFIERS) {
        return MODIFIERS[modifier].description;
    }
    return "Unknown modifier";
}

function getModifierIconTexture(modifier: string) {
    let key = `dailyicons/modifier/${modifier}`;
    if (key in AssetCache.textures) {
        return key;
    }
    return `dailyicons/modifier/unknown`;
}

function isModifierActive(modifier: Modifier) {
    if (!GAME_DATA || !GAME_DATA.modifiers) return false;
    if (GAME_MODE === 'mm' && !DAILY) return false;
    return _.contains(GAME_DATA.modifiers, modifier);
}

function getModifierExtraDmg() {
    return isModifierActive('extradmg') ? 2 : 0;
}

function getModifierExtraHp() {
    return isModifierActive('extrahp') ? 2 : 0;
}

function getModifierExtraStars() {
    return isModifierActive('extrastars') ? 1 : 0;
}

function getModifierGoldDiff() {
    return (isModifierActive('lessgold') ? -1 : 0) + (isModifierActive('moregold') ? 1 : 0);
}

function getModifierSellDiff() {
    return (isModifierActive('lesssell') ? -1 : 0) + (isModifierActive('moresell') ? 1 : 0);
}

function getModifierStockItemsDiff() {
    return isModifierActive('moreballs') ? -1 : 0;
}

function getModifierArenaShrinkStartTime() {
    return isModifierActive('earlyshrink') ? 29 : 0;  // 1 second earlier to help prevent balls sticking to the ceiling on Trampoline
}

function getModifierArenaShrinkTimeScale() {
    return isModifierActive('earlyshrink') ? 4 : 1;
}

function getModifierSquadSizeDiff() {
    return (isModifierActive('lesssquadsize') ? -1 : 0) + (isModifierActive('moresquadsize') ? 1 : 0);
}

function getModifierRestockCostDiff() {
    return (isModifierActive('lessrestockcost') ? -1 : 0) + (isModifierActive('morerestockcost') ? 1 : 0);
}

// Change both of these functions
function adjustSquadBallForModifiers(ball: SquadBall) {
    ball.properties.damage += getModifierExtraDmg();
    ball.properties.health += getModifierExtraHp();
    ball.properties.level += getModifierExtraStars();

    if (isModifierActive('noitems')) {
        ball.properties.equipment = -1;
    } else if (isModifierActive('preequipped') && ball.properties.equipment < 0) {
        ball.properties.equipment = Random.element(getPurchasableEquipmentTypesForRound(GAME_DATA.round));
    } else if (isModifierActive('spores') && ball.properties.equipment < 0) {
        ball.properties.equipment = 14;
    }
}

function adjustBallForModifiers(ball: Ball) {
    ball.properties.damage += getModifierExtraDmg();
    ball.dmg += getModifierExtraDmg();
    ball.properties.health += getModifierExtraHp();
    ball.hp += getModifierExtraHp();
    ball.maxhp += getModifierExtraHp();

    for (let i = 0; i < getModifierExtraStars(); i++) {
        ball.properties.level++;
        ball.levelUp(undefined, false, false);
    }

    if (isModifierActive('noitems')) {
        ball.unequip();
        ball.properties.equipment = -1;
    } else if (isModifierActive('preequipped') && (!ball.equipment || ball.equipment.equipmentType < 0)) {
        let equipmentType = Random.element(getPurchasableEquipmentTypesForRound(GAME_DATA.round));
        ball.equip(equipmentType);
        ball.properties.equipment = equipmentType;
    } else if (isModifierActive('spores') && (!ball.equipment || ball.equipment.equipmentType < 0)) {
        let equipmentType = 14;
        ball.equip(equipmentType);
        ball.properties.equipment = equipmentType;
    }
}