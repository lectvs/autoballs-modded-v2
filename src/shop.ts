namespace Shop {
    export type FrozenThing = {
        type: 'ball';
        squadBall: SquadBall;
    } | {
        type: 'item';
        itemType: number;
    }

    export type StockThing = {
        type: 'ball';
        squadBall: SquadBall;
        frozen: boolean;
        useExistingStats: boolean;
    } | {
        type: 'item';
        itemType: number;
        frozen: boolean;
    }

    var SHOP_SPOT_POSITIONS = [
        vec2(196, 72), vec2(241, 72), vec2(286, 72),
        vec2(196, 117), vec2(241, 117), vec2(286, 117),
        vec2(196, 162), vec2(241, 162),
    ];

    function GET_DEBUG_GUARANTEED_THING(stockThings: StockThing[]): StockThing {
        // return {
        //     type: 'ball',
        //     squadBall: getShopSquadBall(GAME_DATA.round, GAME_DATA.packs, undefined, stockThings, 144),
        //     frozen: false,
        //     useExistingStats: false,
        // };
        // return {
        //     type: 'item',
        //     itemType: 55,
        //     frozen: false,
        // };
        return undefined;
    }

    export function stockInitial(world: World) {
        let { shopBalls, shopItems } = getShopBallItemCounts(world);

        let stockThings: StockThing[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];

        // Add frozen things
        fillFrozenStockThings(stockThings);

        // Debug add guaranteed thing
        seedRandomFor('forceDebugGuaranteedThing');
        let forcedDebugSpot = M.min(availableBallSpots(stockThings, shopBalls), s => s);
        let debugThing = GET_DEBUG_GUARANTEED_THING(stockThings);
        if ((Debug.DEBUG || IS_MODDED) && forcedDebugSpot >= 0 && isFinite(forcedDebugSpot) && debugThing) {
            stockThings[forcedDebugSpot] = debugThing;
        }

        // Force guaranteed balls, from Retro Glasses for example
        addGuaranteedBalls(world, stockThings, shopBalls);

        // Force a new ball if tier just unlocked
        seedRandomFor('forceTierUnlocked');
        let tierJustUnlocked = getTierJustUnlocked();
        let forcedBallSpot = Random.element(availableBallSpots(stockThings, shopBalls));
        let forcedBallType = Random.element(getPurchasableBallTypesForRound(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly)
                                .filter(type => TYPE_TO_BALL_TYPE_DEF[type].tier === tierJustUnlocked));
        if (forcedBallSpot >= 0 && forcedBallType) {
            stockThings[forcedBallSpot] = {
                type: 'ball',
                squadBall: getShopSquadBall(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly, stockThings, forcedBallType),
                frozen: false,
                useExistingStats: false,
            };
        }

        if (GAME_DATA.round === 1 && LiveVersion.BDAY && GAME_MODE === 'mm' && !DAILY) {
            seedRandomFor('forceBirthdayCake');
            stockThings[7] = {
                type: 'item',
                itemType: 38,
                frozen: false,
            };
        }

        // Force Glitched Item if applicable
        if (GAME_DATA.round >= 5 && !DAILY && !IS_MOBILE && GAME_DATA.squad.balls.some(ball => ball.properties.type === 41)) {
            seedRandomFor('forceGlitchedItem');
            let forcedGlitchedItemSpot = Random.element(availableItemSpots(stockThings, shopItems));
            if (!forcedGlitchedItemSpot) {
                forcedGlitchedItemSpot = 7;
                GAME_DATA.frozenThings[forcedGlitchedItemSpot] = undefined;
            }
            stockThings[forcedGlitchedItemSpot] = {
                type: 'item',
                itemType: 25,
                frozen: false,
            };
        }

        // Force Scribbled Map if applicable
        if (hasCompletedAchievement('ArgPart1') && !hasCompletedAchievement('B') && GAME_MODE === 'mm' && GAME_DATA.lap === 1 && !DAILY && !IS_MOBILE && !GAME_DATA.arg2Trigger.strategy && Random.boolean(1/API.B)) {
            seedRandomFor('forceScribbledMap');
            let forcedScribbledMapSpot = Random.element(availableItemSpots(stockThings, shopItems));
            if (!forcedScribbledMapSpot) {
                forcedScribbledMapSpot = 7;
                GAME_DATA.frozenThings[forcedScribbledMapSpot] = undefined;
            }
            stockThings[forcedScribbledMapSpot] = {
                type: 'item',
                itemType: 32,
                frozen: false,
            };
        }

        // Force Participation Trophy if applicable
        if (getLastRoundResult() === 'loss' && getTierLevelAvailableForRound(2, GAME_DATA.round) <= 0 && (isItemTypeUnlocked(37) || GAME_MODE === 'vs')) {
            seedRandomFor('forceParticipationTrophy');
            let forcedParticipationTrophySpot = 7;
            if (forcedParticipationTrophySpot) {
                stockThings[forcedParticipationTrophySpot] = {
                    type: 'item',
                    itemType: 37,
                    frozen: false,
                };
            }
        }

        // Force Consolation Prize if applicable
        if (getLastRoundResult() === 'loss' && getTierLevelAvailableForRound(2, GAME_DATA.round) > 0 && (isItemTypeUnlocked(14) || GAME_MODE === 'vs')) {
            seedRandomFor('forceConsolationPrize');
            let forcedConsolationPrizeSpot = Random.element(availableItemSpots(stockThings, shopItems));
            if (forcedConsolationPrizeSpot) {
                stockThings[forcedConsolationPrizeSpot] = {
                    type: 'item',
                    itemType: 14,
                    frozen: false,
                };
            }
        }

        if (getShopTierForRound(GAME_DATA.round) === 4) {
            addTierThreePlusBall(stockThings, shopBalls);
        }

        if (isModifierActive('pickles')) {
            addModifierPickles(stockThings, shopBalls, shopItems);
        }

        if (world.data.arenaName === Arenas.ARENA_BDAY) {
            addPinata(stockThings, shopBalls);
            addGift(stockThings, shopItems);
        }

        fillRandomStockThings(stockThings, shopBalls, shopItems);

        if (isModifierActive('sameballsstocked')) {
            convertToUniformStock(stockThings);
        }

        addStockThings(world, stockThings, false);
    }

    export function restockNormal(world: World) {
        destroyCurrentShopThings(world);
        GAME_DATA.restocksThisRound++;
        stockRestock(world, false);
        saveAfterRestock(world);
    }

    export function restockPickles(world: World) {
        for (let i = 0; i < GAME_DATA.frozenThings.length; i++) {
            if (GAME_DATA.frozenThings[i]) {
                unfreezeThingAtSpot(world, i);
            }
        }
        GAME_DATA.frozenThings.fill(undefined);
        destroyCurrentShopThings(world);
        stockPickles(world);
    }

    export function stockRestock(world: World, initial: boolean) {
        let { shopBalls, shopItems } = getShopBallItemCounts(world);

        Random.seed(`shop_${getRandomSeed(GAME_DATA.gameId, DAILY)}_${GAME_DATA.round}_${GAME_DATA.restocksThisRound}`);

        let stockThings: StockThing[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];

        // Add frozen things
        fillFrozenStockThings(stockThings);

        // Debug add guaranteed thing
        seedRandomFor('forceDebugGuaranteedThing');
        let forcedDebugSpot = M.min(availableBallSpots(stockThings, shopBalls), s => s);
        let debugThing = GET_DEBUG_GUARANTEED_THING(stockThings);
        if ((Debug.DEBUG || IS_MODDED) && forcedDebugSpot >= 0 && isFinite(forcedDebugSpot) && debugThing) {
            stockThings[forcedDebugSpot] = debugThing;
        }

        // Force restock queue balls
        if (!initial) {
            for (let rq of GAME_DATA.restockQueue) {
                rq.restocksLeft--;
            }
            addRestockQueueBalls(stockThings, shopBalls);
        }

        // Force guaranteed balls, from Retro Glasses for example
        addGuaranteedBalls(world, stockThings, shopBalls);

        // Force Glitched Ball if applicable
        if (GAME_DATA.argTrigger.zombie && GAME_DATA.argTrigger.restocks === 5 && !IS_MOBILE) {
            let forcedGlitchedBallSpot = Random.element(availableBallSpots(stockThings, shopBalls));
            if (!forcedGlitchedBallSpot) {
                forcedGlitchedBallSpot = 0;
                unfreezeThingAtSpot(world, forcedGlitchedBallSpot);
                GAME_DATA.frozenThings[forcedGlitchedBallSpot] = undefined;
                killThingAtSpot(world, forcedGlitchedBallSpot);
            }
            stockThings[forcedGlitchedBallSpot] = {
                type: 'ball',
                squadBall: getShopSquadBall(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly, stockThings, 41),
                frozen: false,
                useExistingStats: false,
            };
        }

        if (getShopTierForRound(GAME_DATA.round) === 4) {
            addTierThreePlusBall(stockThings, shopBalls);
        }

        if (isModifierActive('pickles')) {
            addModifierPickles(stockThings, shopBalls, shopItems);
        }

        if (world.data.arenaName === Arenas.ARENA_BDAY) {
            addPinata(stockThings, shopBalls);
            addGift(stockThings, shopItems);
        }

        fillRandomStockThings(stockThings, shopBalls, shopItems);

        // Remove frozen things as we are not restocking them
        if (!initial) removeFrozenStockThings(stockThings);

        if (isModifierActive('sameballsstocked')) {
            convertToUniformStock(stockThings);
        }

        addStockThings(world, stockThings, !initial);
    }

    function stockPickles(world: World) {
        Random.seed(`shop_${getRandomSeed(GAME_DATA.gameId, DAILY)}_${GAME_DATA.round}_${GAME_DATA.restocksThisRound}`);

        let stockThings: StockThing[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];

        fillPickleStockThings(stockThings);

        addStockThings(world, stockThings, true);
    }

    function ballSpotsForCount(count: number) {
        return [0, 1, 2, 3, 4, 5, 7, 6].slice(0, count);
    }

    function itemSpotsForCount(count: number) {
        return [6, 7, 5, 4, 3, 2, 1, 0].slice(0, count);
    }

    function availableBallSpots(stockThings: StockThing[], shopBalls: number) {
        return ballSpotsForCount(shopBalls).filter(i => !stockThings[i]);
    }

    function availableItemSpots(stockThings: StockThing[], shopItems: number) {
        return itemSpotsForCount(shopItems).filter(i => !stockThings[i]);
    }

    function fillFrozenStockThings(stockThings: StockThing[]) {
        for (let i = 0; i < GAME_DATA.frozenThings.length; i++) {
            let frozenThing = GAME_DATA.frozenThings[i];
            if (!frozenThing) continue;
            if (frozenThing.type === 'ball') {
                stockThings[i] = {
                    type: 'ball',
                    squadBall: frozenThing.squadBall,
                    frozen: true,
                    useExistingStats: false,
                };
            } else if (frozenThing.type === 'item') {
                stockThings[i] = {
                    type: 'item',
                    itemType: frozenThing.itemType,
                    frozen: true,
                };
            }
        }
    }

    function addTierThreePlusBall(stockThings: StockThing[], shopBalls: number) {
        seedRandomFor('forceTierThreePlusBall');
        if (!Random.boolean(0.5)) return;
        let spot = Random.element(availableBallSpots(stockThings, shopBalls));
        let ballType = Random.element(getPurchasableBallTypesForRoundTier(GAME_DATA.round, 4, GAME_DATA.packs, GAME_DATA.weekly));
        if (spot >= 0 && ballType) {
            stockThings[spot] = {
                type: 'ball',
                squadBall: getShopSquadBall(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly, stockThings, ballType),
                frozen: false,
                useExistingStats: false,
            };
        }
    }

    function addRestockQueueBalls(stockThings: StockThing[], shopBalls: number) {
        seedRandomFor('forceRestockQueueBalls');
        let restocked = [];
        for (let rq of GAME_DATA.restockQueue) {
            if (rq.restocksLeft > 0) continue;
            let spot = Random.element(availableBallSpots(stockThings, shopBalls));
            if (spot >= 0) {
                stockThings[spot] = {
                    type: 'ball',
                    squadBall: {
                        x: 0, y: 0,
                        properties: rq.ball,
                    },
                    frozen: false,
                    useExistingStats: true,
                };
                restocked.push(rq);
            }
        }
        GAME_DATA.restockQueue = GAME_DATA.restockQueue.filter(rq => !_.includes(restocked, rq));
    }

    function addGuaranteedBalls(world: World, stockThings: StockThing[], shopBalls: number) {
        let validBalls = getPurchasableBallTypesForRound(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly);
        let guaranteedBalls = world.select.typeAll(Ball)
            .filter(ball => ball.team === 'friend' && _.includes(validBalls, ball.properties.type) && !ball.isInShop && ball.equipment?.stockEquippedBall && !ball.isNullified())
            .map(ball => ball.properties.type);

        A.removeDuplicates(guaranteedBalls);

        guaranteedBalls = guaranteedBalls.filter(ballType => Random.boolean(getBallShopGuaranteedChanceForType(ballType)));

        let currentBallTypes = stockThings.map(st => (st && st.type === 'ball') ? st.squadBall.properties.type : undefined).filter(t => t !== undefined);
        for (let currentBallType of currentBallTypes) {
            let i = guaranteedBalls.indexOf(currentBallType);
            if (i >= 0) {
                guaranteedBalls.splice(i, 1);
            }
        }

        seedRandomFor('forceGuaranteedBalls');
        for (let ballType of guaranteedBalls) {
            let forcedSpot = Random.element(availableBallSpots(stockThings, shopBalls));
            if (forcedSpot >= 0) {
                stockThings[forcedSpot] = {
                    type: 'ball',
                    squadBall: getShopSquadBall(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly, stockThings, ballType),
                    frozen: false,
                    useExistingStats: false,
                };
            }
        }
    }

    function addPinata(stockThings: StockThing[], shopBalls: number) {
        seedRandomFor('forcePinata');
        let spot = Random.element(availableBallSpots(stockThings, shopBalls));
        if (spot >= 0 && Random.boolean(0.33)) {
            stockThings[spot] = {
                type: 'ball',
                squadBall: getShopSquadBall(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly, stockThings, 77),
                frozen: false,
                useExistingStats: false,
            };
        }
    }

    function addGift(stockThings: StockThing[], shopItems: number) {
        seedRandomFor('forceGift');
        let spot = Random.element(availableItemSpots(stockThings, shopItems));
        if (spot >= 0 && Random.boolean(0.1)) {
            stockThings[spot] = {
                type: 'item',
                itemType: 39,
                frozen: false,
            };
        }
    }

    function addModifierPickles(stockThings: StockThing[], shopBalls: number, shopItems: number) {
        let availableSpots = [...availableBallSpots(stockThings, shopBalls), ...availableItemSpots(stockThings, shopItems)];
        for (let spot of availableSpots) {
            seedRandomFor(`modifierPickles_spot_${spot}`);
            if (!stockThings[spot]?.frozen && Random.boolean(0.1)) {
                stockThings[spot] = {
                    type: 'item',
                    itemType: Random.element([12, 13]),
                    frozen: false,
                };
            }
        }

    }

    function convertToUniformStock(stockThings: StockThing[]) {
        let validBalls = stockThings.filter(st => st && st.type === 'ball' && !st.frozen && !st.useExistingStats) as (StockThing & { type: 'ball' })[];
        if (validBalls.length === 0) return;
        for (let ball of validBalls) {
            ball.squadBall.properties.type = validBalls[0].squadBall.properties.type;
        }
    }

    function fillRandomStockThings(stockThings: StockThing[], shopBalls: number, shopItems: number) {
        // Stock rest as random balls
        for (let spot of availableBallSpots(stockThings, shopBalls)) {
            seedRandomForBallSpot(spot);
            stockThings[spot] = {
                type: 'ball',
                squadBall: getShopSquadBall(GAME_DATA.round, GAME_DATA.packs, GAME_DATA.weekly, stockThings),
                frozen: false,
                useExistingStats: false,
            };
        }

        // Stock rest as random items
        for (let spot of availableItemSpots(stockThings, shopItems)) {
            seedRandomForItemSpot(spot);
            stockThings[spot] = {
                type: 'item',
                itemType: getShopBallItemType(GAME_DATA.round),
                frozen: false,
            };
        }
    }

    function fillPickleStockThings(stockThings: StockThing[]) {
        let pickles = Math.min(GAME_DATA.round, 6);
        for (let i = 0; i < pickles; i++) {
            seedRandomForItemSpot(i);
            stockThings[i] = {
                type: 'item',
                itemType: Random.boolean() ? 12 : 13,
                frozen: false,
            };
        }
    }

    function removeFrozenStockThings(stockThings: StockThing[]) {
        for (let i = 0; i < stockThings.length; i++) {
            if (stockThings[i] && stockThings[i].frozen) {
                stockThings[i] = undefined;
            }
        }
    }

    function addStockThings(world: World, stockThings: StockThing[], addPuffs: boolean) {
        let sidePanel = world.select.name('sidepanel');

        for (let i = 0; i < stockThings.length; i++) {
            let stockThing = stockThings[i];
            if (!stockThing) continue;

            if (isModifierActive('noitems') && stockThing.type === 'item') {
                continue;
            }

            let spotPosition = SHOP_SPOT_POSITIONS[i];

            let thing = stockThing.type === 'ball'
                            ? getNewBallForShop(spotPosition.x, spotPosition.y, stockThing.squadBall, stockThing.frozen || stockThing.useExistingStats)
                            : getNewItemForShop(spotPosition.x, spotPosition.y, stockThing.itemType);
            
            thing.shopSpot = i;

            if (stockThing.frozen || stockThing['useExistingStats']) {
                thing.freeze(true);
            }

            sidePanel.addChild(thing);

            let costText = `${thing.getShopCost()}`;
            if (thing.isGlitched()) costText = '?';
            if (!thing.isPurchasable()) costText = '-';

            let costColor = thing.getShopCost() <= 0 ? 'g' : 'gold';
            sidePanel.addChild(new SpriteText({
                x: spotPosition.x - 19, y: spotPosition.y - 19,
                text: `[${costColor}]<coin>${costText}[/]`,
                font: 'smallnumbers',
                layer: Battle.Layers.ui,
                update: function() {
                    if (!thing.world) this.kill();
                    if (thing instanceof Ball && !thing.isInShop) this.kill();
                }
            }));

            if (addPuffs) {
                world.addWorldObject(newPuff(thing.x, thing.y, Battle.Layers.ui, 'medium'));
            }

            if (thing instanceof Ball && thing.properties.metadata.mutated) {
                let ball = thing;
                world.runScript(function*() {
                    let ps = [
                        Vector2.fromPolar(ball.physicalRadius*0.7, 0).add(ball),
                        Vector2.fromPolar(ball.physicalRadius*0.7, -120).add(ball),
                        Vector2.fromPolar(ball.physicalRadius*0.7, 120).add(ball),
                        Vector2.fromPolar(ball.physicalRadius*0.7, 60).add(ball),
                        Vector2.fromPolar(ball.physicalRadius*0.7, -60).add(ball),
                    ];

                    for (let p of ps) {
                        let puff = world.addWorldObject(new Sprite({
                            p: p,
                            texture: new AnchoredTexture(Texture.filledCircle(ball.physicalRadius*0.75, 0x00FF00, 0.5), 0.5, 0.5),
                            layer: Battle.Layers.ui,
                            blendMode: Texture.BlendModes.ADD,
                            scale: 0,
                        }));

                        puff.runScript(function*() {
                            yield S.tween(0.1, puff, 'scale', 0, 1);
                            yield S.wait(0.2);
                            yield S.tween(0.3, puff, 'alpha', 1, 0);
                        })

                        yield S.wait(0.1);
                    }
                });
            }
        }
    }

    function getNewBallForShop(x: number, y: number, squadBall: SquadBall, useExistingStats: boolean) {
        let ball = squadBallToWorldBall(squadBall, undefined, -1, 'friend');

        if (!useExistingStats) {
            ball.properties.damage = ball.getShopDmg();
            ball.dmg = ball.properties.damage;
            ball.properties.health = ball.getShopHp();
            ball.hp = ball.maxhp = ball.properties.health;

            let level = getBallTypeLevelForRound(ball.properties.type, GAME_DATA.round);
            for (let i = 1; i < level; i++) {
                ball.levelUp(undefined, false);
            }

            if (isTierCrown()) {
                let gaveMutation = applyTierCrownMutations(ball);
                if (gaveMutation) ball.properties.metadata.mutated = true;
            }

            adjustBallForModifiers(ball);
        }

        if (isTierJustUnlocked(ball.tier)) {
            ball.giveShine();
        }

        ball.x = x + ball.getShopRelativePosition().x;
        ball.y = y + ball.getShopRelativePosition().y;
        ball.isInShop = true;
        ball.layer = Battle.Layers.ui;
        ball.colliding = false;
        ball.isSummon = false;
        ball.setForInShop();
        ball.showAllStats();
        return ball;
    }

    function getNewItemForShop(x: number, y: number, itemType: number) {
        let item = itemTypeToBallItem(itemType, x, y);
        item.layer = Battle.Layers.ui;
        if (isTierJustUnlocked(item.tier)) {
            item.giveShine();
        }
        return item;
    }

    function destroyCurrentShopThings(world: World) {
        let shopBalls = world.select.typeAll(Ball).filter(ball => ball.isInShop);
        let shopItems = world.select.typeAll(BallItem);

        let shopThings = [...shopBalls, ...shopItems];

        for (let shopThing of shopThings) {
            if (shopThing.frozen) continue;
            world.addWorldObject(new Explosion(shopThing.x, shopThing.y, 10, { ally: 0, enemy: 0 })).layer = World.DEFAULT_LAYER;
            world.removeWorldObject(shopThing);
        }

        world.playSound('sellball');
        world.playSound('balldie');
    }

    function getShopSquadBall(round: number, packs: Pack[], weekly: { week: number }, stockThings: StockThing[], ballType?: number): SquadBall {
        if (ballType === undefined) {
            let purchasableBallTypes = getPurchasableBallTypesForRound(round, packs, weekly);
            if (GAME_DATA.hasPurchasedDove || hasDoveInShop(stockThings)) {
                A.removeAll(purchasableBallTypes, 127);
            }
            if (isModifierActive('onlyintier')) {
                let currentTier = getShopTierForRound(round);
                A.filterInPlace(purchasableBallTypes, type => TYPE_TO_BALL_TYPE_DEF[type].tier === currentTier);
            }
            let weights = purchasableBallTypes.map(type => getBallShopChanceForType(type));
            ballType = Random.elementWeighted(purchasableBallTypes, weights);
        }
        let squadBall: SquadBall = {
            x: 0, y: 0,
            properties: {
                type: ballType,
                level: 1,
                damage: 1,
                health: 1,
                equipment: -1,
                metadata: {},
            }
        };

        return squadBall;
    }

    function getShopBallItemType(round: number) {
        let purchasableBallItemTypes = getPurchasableBallItemTypesForRound(round);
        let weights = purchasableBallItemTypes.map(type => getItemShopChanceForType(type));
        let itemType = Random.elementWeighted(purchasableBallItemTypes, weights);
        return itemType;
    }

    function getShopBallItemCounts(world: World) {
        let stockExtraItems = getStockExtraItems(world);

        let shopBalls = 3;
        if (GAME_DATA.round >= 2) shopBalls = 4;
        if (GAME_DATA.round >= 4) shopBalls = 5;
        if (GAME_DATA.round >= 6) shopBalls = 6;

        let shopItems = 1;
        if (GAME_DATA.round >= 4) shopItems = 2;

        shopBalls = Math.max(shopBalls - stockExtraItems, 0);
        shopItems = Math.min(shopItems + stockExtraItems, 8);

        return { shopBalls, shopItems };
    }

    function getStockExtraItems(world: World) {
        let stockExtraItems = A.sum(world.select.typeAll(Ball), ball => (ball.team === 'friend' && !ball.isInShop && ball.equipment && !ball.isNullified()) ? ball.equipment.stockExtraItems : 0);
        stockExtraItems += getModifierStockItemsDiff();
        return stockExtraItems;
    }

    function getThingsAtSpot(world: World, spot: number) {
        let shopBalls = world.select.typeAll(Ball).filter(ball => ball.isInShop);
        let shopItems = world.select.typeAll(BallItem);

        let shopThings = [...shopBalls, ...shopItems];

        return shopThings.filter(thing => thing.shopSpot === spot);
    }

    function unfreezeThingAtSpot(world: World, spot: number) {
        getThingsAtSpot(world, spot).forEach(thing => {
            if (thing.frozen) {
                thing.unfreeze();
            }
        });
    }

    function killThingAtSpot(world: World, spot: number) {
        getThingsAtSpot(world, spot).forEach(thing => {
            thing.kill();
        });
    }

    function seedRandomFor(discriminator: string) {
        Random.seed(`shop_${getRandomSeed(GAME_DATA.gameId, DAILY)}_${GAME_DATA.round}_${GAME_DATA.restocksThisRound}_${discriminator}`);
    }

    function seedRandomForBallSpot(spot: number) {
        seedRandomFor(`ballSpot${spot}`)
    }

    function seedRandomForItemSpot(spot: number) {
        seedRandomFor(`itemSpot${spot}`)
    }

    function saveAfterRestock(world: World) {
        world.runScript(function*() {
            yield;

            setBallPositions(world);

            if (GAME_MODE === 'mm') {
                saveMatchmakingOrChallengeModeOrDailyGameData({
                    gameData: GAME_DATA,
                    state: 'midshop',
                    lock: gameDataLock(),
                }, CHALLENGE_MODE_ENABLED, DAILY);
            } else if (GAME_MODE === 'vs') {
                saveVersusModeGameData({
                    gameData: GAME_DATA,
                    state: 'midshop',
                });
            }
        });
    }

    function hasDoveInShop(stockThings: StockThing[]) {
        for (let thing of stockThings) {
            if (thing && thing.type === 'ball' && thing.squadBall.properties.type === 127) {
                return true;
            }
        }
        return false;
    }

    export const NO_TIER_CROWN_LEVEL_MUTATION_BALLS = [
        10,   // Crystal Ball
        37,   // Red Crystal Ball
        38,   // Green Crystal Ball
        39,   // Ball of Ice
        47,   // Recycler
        116,  // Mimic
        134,  // Old Crystal Ball
        135,  // New Crystal Ball
        139,  // Gold Crystal Ball
        142,  // Greater Mimic
    ];

    export const REDUCED_TIER_CROWN_LEVEL_MUTATION_BALLS = [
        9,    // Coin
        25,   // Crown
        136,  // Crown
    ];

    function applyTierCrownMutations(ball: Ball) {
        let receiveNoLevelMutations = _.contains(NO_TIER_CROWN_LEVEL_MUTATION_BALLS, ball.properties.type);
        let receiveReducedLevelMutations = _.contains(REDUCED_TIER_CROWN_LEVEL_MUTATION_BALLS, ball.properties.type);

        let totalMutationChance = 1/3;
        let roundsSinceR10 = GAME_DATA.round - 10;

        let victoryLapOneFactor = GAME_DATA.lap > 2 ? 1 : GAME_DATA.wins / GET_MAX_WINS();

        let gaveMutation = false;

        if (Random.boolean(totalMutationChance/3)) {
            ball.hp += Math.floor(roundsSinceR10/4)*2 + Math.ceil(randomIntRangeSkewed(2, 7) * victoryLapOneFactor);
            ball.maxhp = ball.hp;
            ball.properties.health = ball.maxhp;
            gaveMutation = true;
        }

        if (Random.boolean(totalMutationChance/3)) {
            ball.dmg += Math.floor(roundsSinceR10/4)*2 + Math.ceil(randomIntRangeSkewed(0, 4) * victoryLapOneFactor);
            ball.properties.damage = ball.dmg;
            gaveMutation = true;
        }

        if (Random.boolean(totalMutationChance/3) && !receiveNoLevelMutations) {
            let extraLevels = Math.floor(roundsSinceR10/4) + Math.ceil(randomIntRangeSkewed(1, 6) * victoryLapOneFactor);
            if (receiveReducedLevelMutations) {
                extraLevels = Math.floor(extraLevels/5);
            }
            ball.level += extraLevels;
            ball.properties.level = ball.level;
            gaveMutation = true;
        }

        if (gaveMutation) {
            ball.giveShine(Color.lerpColorByLch(0xFFD800, 0xFFFFFF, 0.5));
        }

        return gaveMutation;
    }

    function randomIntRangeSkewed(min: number, max: number) {
        let range = A.range(min, max+1);
        let weights = range.map((_, i) => Math.pow(2, -2*i));
        return Random.elementWeighted(range, weights);
    }
}
