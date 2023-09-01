namespace Tags {
    export const DELAY_PLAY = 'delayPlay';

    export const BALL_OF_ICE_BUFF = 'ballOfIceBuff';
    export const PURCHASED_THIS_SHOP_PHASE = 'purchasedThisShopPhase';
    export const SPAWNED_BY_FACTORY = 'spawnedByFactory';
    export const MODIFIER_ICON = 'modifierIcon';

    export function DELAY_RESOLVE(team: Ball.Team) {
        return `delayResolve_${team}`;
    }
    export const FORCE_DELAY_RESOLVE = 'forceDelayResolve';
}