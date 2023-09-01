namespace ShopActions {
    export function buyBall(ball: Ball) {
        if (ball.frozen) {
            ball.world.playSound('unfreeze');
            ball.unfreeze();
        }
        GAME_DATA.gold -= ball.getShopCost();
        GAME_DATA.squad.balls.push({
            x: ball.x,
            y: ball.y,
            properties: ball.properties,
        });
        ball.squad = GAME_DATA.squad;
        ball.squadIndexReference = GAME_DATA.squad.balls.length-1;
        ball.isInShop = false;
        ball.addTag(Tags.PURCHASED_THIS_SHOP_PHASE);
        ball.removeShine();
        ball.removeFromParentKeepWorldPosition();
        ball.world.playSound('buyball');
        ball.queueAbilities('onBuy');

        updateAchievementProgress('MakeFiveHundredPurchases', p => p+1);

        if (GAME_DATA.round === 1 && GAME_MODE === 'mm' && !DAILY && !IS_MOBILE && ball instanceof Balls.Zombie) {
            GAME_DATA.argTrigger.zombie = true;
        }

        if (ball.properties.type === 127) {
            GAME_DATA.hasPurchasedDove = true;
        }
    }

    export function levelUpBall(ball: Ball, withBall: Ball) {
        if (ball.squadIndexReference < 0 || ball.squadIndexReference >= GAME_DATA.squad.balls.length) {
            console.error('Invalid ball squad index for level up:', ball.squadIndexReference);
            return;
        }

        if (withBall.squadIndexReference < 0 || withBall.squadIndexReference >= GAME_DATA.squad.balls.length) {
            console.error('Invalid withBall squad index for level up:', withBall.squadIndexReference);
            return;
        }
    
        let rootSquadIndex = withBall.squadIndexReference;
        let balls = ball.world.select.typeAll(Ball);
    
        for (let b of balls) {
            if (b.squadIndexReference > rootSquadIndex) b.squadIndexReference--;
        }

        GAME_DATA.squad.balls.splice(rootSquadIndex, 1);
        withBall.kill();

        ball.levelUp(withBall.properties);

        GAME_DATA.hasLeveledUp = true;
    }

    export function sellBall(ball: Ball) {
        if (ball.squadIndexReference < 0 || ball.squadIndexReference >= GAME_DATA.squad.balls.length) {
            console.error('Invalid ball squad index for sell:', ball.squadIndexReference);
            return;
        }

        removeBallFromSquad(ball);
    
        ball.world.addWorldObject(newPuff(ball.x, ball.y, Battle.Layers.ui, 'medium'));
        ball.world.playSound('sellball');

        GAME_DATA.hasSold = true;

        if (ball instanceof Balls.Coin && ball.getSellValue() >= 10) {
            updateAchievementProgress('SellCoin', p => p+1);
        }

        if (ball.getSellValue() >= 50) {
            updateAchievementProgress('SellBall50', p => p+1);
        }

        GAME_DATA.gold += ball.getSellValue();
        ball.properties.metadata.extraSellValue = 0;
        ball.queueAbilities('onSell');
        ball.kill();
    }

    export function removeBallFromSquad(ball: Ball) {
        if (ball.squadIndexReference < 0 || ball.squadIndexReference >= GAME_DATA.squad.balls.length) {
            console.error('Invalid ball squad index for removal:', ball.squadIndexReference);
            return;
        }

        let rootSquadIndex = ball.squadIndexReference;
        let balls = ball.world.select.typeAll(Ball);
    
        for (let b of balls) {
            if (b.squadIndexReference > rootSquadIndex) b.squadIndexReference--;
        }

        GAME_DATA.squad.balls.splice(rootSquadIndex, 1);
    }

    export function buyBallItem(item: BallItem, targetBall: Ball) {
        if (item.frozen) {
            item.world.playSound('unfreeze');
            item.unfreeze();
        }
        let cost = item.getShopCost();
        GAME_DATA.gold -= cost;
        targetBall.useItem(item);
        item.addTag(Tags.PURCHASED_THIS_SHOP_PHASE);
        item.world.playSound('buyball');
        item.kill();

        if (item.getType() === 'Equipment' && cost > 0) {
            GAME_DATA.hasBoughtEquipment = true;
            GAME_DATA.hasBoughtItem = true;
        }

        if (item.getType() === 'Item') {
            addItemTypeForAlmanacWin(item.type);
            GAME_DATA.hasBoughtItem = true;
        }

        updateAchievementProgress('MakeFiveHundredPurchases', p => p+1);
    }
}
