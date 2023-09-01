type StartShopEffect = {
    sourceSquadIndex: number;
} & ({
    type: 'buff';
    health: number;
    damage: number;
} | {
    type: 'gold';
    gold: number;
} | {
    type: 'restocks';
    restocks: number;
})

function addStartShopEffect(effect: StartShopEffect) {
    let currentEffect = GAME_DATA.startShopEffects.find(ce => ce.type === effect.type && ce.sourceSquadIndex === effect.sourceSquadIndex);
    if (!currentEffect) {
        GAME_DATA.startShopEffects.push(effect);
        return;
    }

    // Combine effects if they exist
    if (effect.type === 'buff' && currentEffect.type === 'buff') {
        currentEffect.health += effect.health;
        currentEffect.damage += effect.damage;
        return;
    }

    if (effect.type === 'gold' && currentEffect.type === 'gold') {
        currentEffect.gold += effect.gold;
        return;
    }

    if (effect.type === 'restocks' && currentEffect.type === 'restocks') {
        currentEffect.restocks += effect.restocks;
        return;
    }
}

function hasStartShopEffect(type: StartShopEffect['type'], sourceSquadIndex: number) {
    return GAME_DATA.startShopEffects.some(ce => ce.type === type && ce.sourceSquadIndex === sourceSquadIndex);
}

function applyStartShopEffects(effects: StartShopEffect[], world: World) {
    if (!effects || !world) return;

    let friendBalls = world.select.typeAll(Ball).filter(ball => ball.team === 'friend' && !ball.isInShop);

    for (let effect of effects) {
        let ball = friendBalls.find(b => b.squadIndexReference === effect.sourceSquadIndex);

        if (effect.type === 'buff') {
            if (!ball) continue;

            let health = effect.health;
            let damage = effect.damage;

            // Add new effect application here
            if (health !== 0 || damage !== 0) {
                ball.runScript(function*() {
                    yield;
                    ball.buff(damage, health);
                });
            }
        }

        if (effect.type === 'gold') {
            GAME_DATA.gold += effect.gold;
            if (ball) animateGiveOrTakeShopGold(world, ball, effect.gold);
        }

        if (effect.type === 'restocks') {
            GAME_DATA.freeRestocksUntilPlay += effect.restocks;
        }
    }
}