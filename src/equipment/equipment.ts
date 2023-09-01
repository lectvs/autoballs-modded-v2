namespace Equipment {
    export type Config = ReplaceConfigCallbacks<Sprite.Config, Equipment> & {
        breakIcon: string;
    }
}

class Equipment extends Sprite {
    getName() { return 'unknown'; }
    getDesc() { return 'unknown'; }

    equipmentType: number = -1;
    private breakIcon: string;

    mainWorld: World;

    abilitySet: AbilitySet<Ball>;
    preBattleAbilityInitialWaitTime: number = 0.2;
    private _preBattleAbilityActiveCheck: () => any;
    get isPreBattleAbilityActive() {
        if (!this._preBattleAbilityActiveCheck) return false;
        if (!this._preBattleAbilityActiveCheck()) {
            this._preBattleAbilityActiveCheck = undefined;
            return false;
        }
        return true;
    }

    constructor(config: Equipment.Config) {
        super(config);
        this.breakIcon = config.breakIcon;
        this.abilitySet = new AbilitySet();
    }

    blockOneDiscreteDamage = false;
    magnetizeAmount = 0;
    flatDamageChange = 0;
    percentDamageChange = 1;
    reverseDirection = false;
    stockExtraItems = 0;
    stockEquippedBall = false;
    noCollisionDamage = false;
    spreadDamageOverTime = 0;
    chanceToActivateAbilitiesTwice = 0;
    startEarlyTime = 0;
    // Do not forget to add isNullified check and hasBattleEffect for future equipment effects!

    addAbility<T extends AbilityType>(type: T, abilityFunction: (equipment: this, ...rest: Parameters<AbilityFunction<Ball, T>>) => void, config?: { nullifyable?: boolean }) {
        let nullifyable = config?.nullifyable ?? true;
        this.abilitySet.addAbility(type, (source: Ball, world: World, ...rest) => abilityFunction(this, source, world, ...rest), nullifyable);
    }

    break() {
        if (this.parent) {
            let breakSprite = this.parent.addChild(new Sprite({
                texture: this.breakIcon,
                layer: Battle.Layers.fx,
                scale: 0.8,
                alpha: 0.5,
            }));
            breakSprite.runScript(S.chain(
                S.simul(
                    S.tween(0.1, breakSprite, 'scale', 0.8, 1, Tween.Easing.OutQuad),
                    S.tween(0.1, breakSprite, 'alpha', 0.5, 1, Tween.Easing.OutQuad),
                ),
                S.tween(0.25, breakSprite, 'alpha', 0.5, 0, Tween.Easing.OutQuad),
                S.call(() => breakSprite.kill()),
            ));
        }
        this.world?.playSound('eqbreak');
        this.kill();
    }

    cancelAbilities() {
        this.abilitySet.cancelAbilities(this);
    }

    getEquipmentTexture() {
        return this.getTexture();
    }
    
    getParent() {
        if (this.parent && this.parent instanceof Ball) return this.parent;
        return undefined;
    }

    hasAbility(abilityType: AbilityType) {
        return this.abilitySet.hasAbility(abilityType);
    }

    hasBattleEffect() {
        for (let ability in ABILITIES) {
            let abilityType = ability as AbilityType;
            if (ABILITIES[abilityType].battle && this.hasAbility(abilityType)) return true;
        }

        if (this.blockOneDiscreteDamage) return true;
        if (this.magnetizeAmount !== 0) return true;
        if (this.flatDamageChange !== 0) return true;
        if (this.percentDamageChange !== 1) return true;
        if (this.reverseDirection) return true;
        if (this.noCollisionDamage) return true;
        if (this.spreadDamageOverTime !== 0) return true;
        if (this.startEarlyTime > 0) return true;

        return false;
    }

    onAdd() {
        this.mainWorld = this.world;
        super.onAdd();
    }

    queueAbilities<T extends AbilityType>(type: T, ...params: AbilityParams<Extract<AbilityType, T>>) {
        let nullified = this.getParent()?.isNullified();
        this.abilitySet.queueAbilities(type, this, nullified, params);
    }

    setForShare() {

    }

    setPreBattleAbilityActiveCheck(check: () => any) {
        this._preBattleAbilityActiveCheck = check;
    }
}