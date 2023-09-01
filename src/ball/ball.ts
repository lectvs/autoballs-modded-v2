namespace Ball {
    export type Config = {
        x: number;
        y: number;
        properties: SquadBallProperties;
        squad: Squad;
        squadIndexReference: number;
        team: Team;
    }

    export type Team = 'friend' | 'enemy' | 'neutral';

    export type StatusEffect = SlowStatusEffect | StunStatusEffect | ProtectedStatusEffect
                            | HealFeedbackStatusEffect | LeechedStatusEffect | BoostMaxSpeedEffect
                            | BurningStatusEffect | NullifiedStatusEffect | SpreadDamageStatusEffect
                            | MarkedStatusEffect | ScaleAccelerationEffect;

    export type SlowStatusEffect = {
        type: 'slow';
        timeLeft: number;
        slowFactor: number;
        source: 'yarn' | 'other';
    }

    export type StunStatusEffect = {
        type: 'stun';
        timeLeft: number;
        source: 'psychic' | 'other';
    }

    export type ProtectedStatusEffect = {
        type: 'protected';
        timeLeft: number;
        flatDamageReduction: number;
        source: any;
    }

    export type HealFeedbackStatusEffect = {
        type: 'healfeedback';
        timeLeft: number;
    }

    export type LeechedStatusEffect = {
        type: 'leeched';
        timeLeft: number;
    }

    export type BoostMaxSpeedEffect = {
        type: 'boostmaxspeed';
        timeLeft: number;
        maxTime: number;
        multiplier: number;
        clampDamageMultiplier: number;
        source: any;
        sourceType: 'magnet' | 'other';
    }

    export type ScaleAccelerationEffect = {
        type: 'scaleacceleration';
        timeLeft: number;
        multiplier: number;
        source: any;
    }

    export type BurningStatusEffect = {
        type: 'burning';
        timeLeft: number;
        source: Ball;
        sound: Sound;
    }

    export type NullifiedStatusEffect = {
        type: 'nullified';
        timeLeft: number;
    }

    export type SpreadDamageStatusEffect = {
        type: 'spreaddamage';
        timeLeft: number;
        damageLeft: number;
        source: Ball;
    }

    export type MarkedStatusEffect = {
        type: 'marked';
        timeLeft: number;
    }
}

class Ball extends Sprite {
    getType(): 'Ball' { return 'Ball'; }
    getName() { return 'unknown'; }
    getDesc() { return 'unknown'; }
    getShopDmg() { return 1; }
    getShopHp() { return 1; }
    getShopCost(): number {
        if (this.shouldSellAtOneGold()) return 1;
        return 3;
    }
    getShopRelativePosition() { return vec2(0, 0); }
    getSellValue() {
        return M.clamp(1 + getModifierSellDiff() + this.properties.metadata.extraSellValue, 0, Ball.maxSellValue);
    }
    getCredits(): string[] { return []; }

    team: Ball.Team;
    properties: SquadBallProperties;
    tier: number = 1;

    squad?: Squad;
    squadIndexReference: number;
    shopSpot: number;
    isInShop: boolean = false;
    isInYourSquadScene: boolean = false;
    isSummon: boolean = true;
    neutralFlowDirection: number = 1;

    timeInBattle: number;
    mainWorld: World;

    afterAddImmuneTime: number = 0.25;
    radius: number;
    ballScale: number;
    moveScale: number;

    static accelerationBase: number = 150;
    get acceleration() {
        let baseAcceleration = Ball.accelerationBase;
        return baseAcceleration * this.getScaleAccelerationMultiplier();
    }

    static maxSellValue = 50;
    protected constructedMetadata: SquadBallMetadata;

    static maxSpeedBase = 150;
    get maxSpeed() {
        let baseMaxSpeed = Ball.maxSpeedBase * this.getBoostMaxSpeedMultiplier();
        let slowMultiplier = this.getSlowEffectSpeedMultiplier();
        if (slowMultiplier === 0) {
            return 0;
        }
        if (this.getStun()) return 50;

        let arenaGravityMultiplier = this.world.data.arenaName === Arenas.ARENA_GRAVITY ? 1.3 : 1;
        let arenaIceMultiplier = this.getArenaIceSpeedMultiplier();
        let arenaMultiplier = arenaGravityMultiplier * arenaIceMultiplier;

        return baseMaxSpeed * slowMultiplier * arenaMultiplier * GET_SPEED_CAP_MULT();
    }

    static oneDamageSpeed: number = 125;

    static minTrampolineBounceSpeed: number = 50;
    static minModifierWallBounceSpeed: number = 100;

    statusEffects: Ball.StatusEffect[];
    activateTwiceAbilities: AbilityType[];
    private effectAura: Sprite;
    get effectAuraRadius() { return this.physicalRadius + 6; }

    get clampDamageRatio() {
        let amount = 1;
        for (let effect of this.statusEffects) {
            if (effect.type === 'boostmaxspeed') {
                let mult = M.mapTween(effect.timeLeft, effect.maxTime, 0, effect.clampDamageMultiplier, 1, Tween.Easing.InQuad);
                amount = Math.max(amount, mult);
            }
        }
        return amount;
    }

    dmg: number;
    hp: number;
    maxhp: number;
    level: number;

    abilitySet: AbilitySet<this>;
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
    protected activatedAbilities: AbilityType[];

    equipment: Equipment;

    canBeTargetedForDeath: boolean = true;
    targetedForDeath: boolean = false;
    isBeingDisintegrated: boolean = false;
    dead: boolean = false;
    storesMoney: boolean = false;

    timesCollidedWithEnemy: number;
    timesTakenDamage: number;
    timesKilledEnemy: number;
    stunImmune: Timer;
    disguised: boolean = false;

    nullifiedSprite: Sprite;
    markedSprite: Sprite;

    get drag() {
        if (!this.getStun()) return 20;
        return M.lerp(100, 200, this.stunImmune.progress);
    }

    dmgbox: StatBox;
    hpbox: StatBox;
    stars: Stars;
    private showingAllStats: boolean;
    private massScale: number = 1;

    private showHpStatScript: Script;
    private showDmgStatScript: Script;
    private showLvlStatScript: Script;

    defaultOutline: number = 0xFFFFFF;
    defaultOutlineAlpha: number = 1;
    canFreeze: boolean = true;
    freezeSprite: Sprite;
    get frozen() { return !!this.freezeSprite; }

    get visibleRadius() { return this.radius * this.ballScale * this.moveScale; }
    get physicalRadius() { return this.radius * this.ballScale; }

    get ballsexplodeModifierRadius() { return this.physicalRadius + 20; }

    get canRoll() { return !this.world || !_.contains([Arenas.ARENA_ICE, Arenas.ARENA_GRAVITY], this.world.data.arenaName); }

    private _applyBounds: CircleBounds;
    get applyBounds() {
        this._applyBounds.radius = Math.max(this.physicalRadius, 8) + 4;
        return this._applyBounds;
    }

    constructor(baseTexture: string, radius: number, config: Ball.Config) {
        super({
            x: config.x, y: config.y,
            effects: { pre: { filters: [
                new BallTeamColorFilter(Ball.getTeamColor(config.team)),
                new FlashingStatusEffectFilter(),
                new Effects.Filters.Outline(0x000000, 1),
            ] }},
            layer: Battle.Layers.balls,
            physicsGroup: Battle.PhysicsGroups.balls,
            bounds: new CircleBounds(0, 0, radius),
            bounce: 1,
        });

        this.constructedMetadata = _.clone(config.properties.metadata);

        this.effects.outline.color = this.defaultOutline;
        this.effects.outline.alpha = this.defaultOutlineAlpha;

        this.radius = radius;
        this.ballScale = 1;
        this.moveScale = 1;

        let textures = getBallTextures(baseTexture);
        this.addAnimation(Animations.fromTextureList({ name: 'prep', textures: [textures[0]], frameRate: 1, count: Infinity }));
        this.addAnimation(Animations.fromTextureList({ name: 'roll', textures: textures, frameRate: 1, count: Infinity }));
        this.playAnimation('prep');

        this.mask = {
            type: 'local',
            texture: Ball.textureMaskForRadius(this.radius),
            offsetx: 0, offsety: 0,
        };

        this.properties = config.properties;
        this.dmg = config.properties.damage;
        this.hp = config.properties.health;
        this.maxhp = config.properties.health;
        this.level = config.properties.level;

        this.abilitySet = new AbilitySet();

        this.timeInBattle = 0;
        this.statusEffects = [];
        this.activateTwiceAbilities = [];
        this.activatedAbilities = [];
        this.timesCollidedWithEnemy = 0;
        this.timesTakenDamage = 0;
        this.timesKilledEnemy = 0;
        this.stunImmune = this.addTimer(0.5);
        this.stunImmune.finish();

        this.nullifiedSprite = this.addChild(new Sprite({
            texture: 'nullified',
            alpha: 0,
            visible: false,
            copyFromParent: ['layer'],
        }));
        this.markedSprite = this.addChild(new Sprite({
            texture: 'crosshair',
            alpha: 0,
            visible: false,
            copyFromParent: ['layer'],
        }));

        this.effectAura = this.addChild(new Sprite({
            texture: 'aura',
            tint: 0xFFFF00,
            blendMode: Texture.BlendModes.ADD,
            scale: this.effectAuraRadius / 64,
            alpha: 0,
            copyFromParent: ['layer'],
        }));

        this.equip(config.properties.equipment ?? -1);

        this.squad = config.squad;
        this.squadIndexReference = config.squadIndexReference;

        this.team = config.team;

        if (this.properties.metadata.extraSellValue === undefined) {
            this.properties.metadata.extraSellValue = 0;
        }

        this._applyBounds = new CircleBounds(0, 0, this.radius, this);

        this.stateMachine.addState(Ball.States.PREP, {
            update: () => {
                this.updatePrep();
            },
        });
        this.stateMachine.addState(Ball.States.PRE_BATTLE, {
            callback: () => {
                this.onStateChangePreBattle();
            },
            update: () => {
                this.updatePreBattle();
            },
        });
        this.stateMachine.addState(Ball.States.BATTLE, {
            callback: () => {
                this.onStateChangeBattle();
                this.hideAllStats();
            },
            update: () => {
                this.updateBattle();
            },
        });
        this.setState(Ball.States.PREP);

        this.dmgbox = this.addChild(new StatBox('dmg'));
        this.dmgbox.setVisible(false);
        this.hpbox = this.addChild(new StatBox('hp'));
        this.hpbox.setVisible(false);
        this.stars = this.addChild(new Stars(this.properties.metadata.obtainedWithCrown ? 'crowns' : 'stars'));
        this.stars.setVisible(false);

        this.showingAllStats = false;
    }

    onAdd() {
        this.mainWorld = this.world;
        super.onAdd();

        this.name = 'ball';
        for (let i = 0; i < 10000; i++) {
            let n = `ball_${Ball.Random.int(1000000,9999999)}`;
            if (!this.world.select.name(n, false)) {
                this.name = n;
                break;
            }
        }

        let battleState = getBattleState(this.world);

        if (battleState === Ball.States.PRE_BATTLE || battleState === Ball.States.BATTLE) {
            this.life.time = 0;
            if (this.isSummon) {
                this.joinTeam();
            }
        }

        if (battleState === Ball.States.PRE_BATTLE) {
            this.setState(Ball.States.PRE_BATTLE);
            this.showAllStats();
            this.queueAbilities('onPreBattle');
        } else if (battleState === Ball.States.BATTLE) {
            this.setState(Ball.States.PRE_BATTLE);
            this.setState(Ball.States.BATTLE);
            this.enterBattle();
        }
    }

    update() {
        super.update();

        this.queueAbilities('update');

        this.updateStatusEffects();

        let flashingStatusEffectFilter = <FlashingStatusEffectFilter>this.effects.pre.filters.find(f => f instanceof FlashingStatusEffectFilter);
        if (flashingStatusEffectFilter) {
            if (this.isBurning()) {
                flashingStatusEffectFilter.color = 0xFF8F00;
                flashingStatusEffectFilter.amount = 0.6;
            } else if (this.getSlowEffectSpeedMultiplier() < 1 && this.statusEffects.find(e => e.type === 'slow' && e.source === 'yarn')) {
                flashingStatusEffectFilter.color = 0xFFFFFF;
                flashingStatusEffectFilter.amount = 1;
            } else {
                flashingStatusEffectFilter.amount = 0;
            }
        }

        this.v.clampMagnitude(this.maxSpeed + 0.001);
    }

    updatePrep() {
        this.animationManager.playAnimation('prep');
        this.animationManager.speed = 1;
    }

    updatePreBattle() {
        this.animationManager.playAnimation('prep');
        this.animationManager.speed = 1;
    }

    updateBattle() {
        this.timeInBattle += this.delta;

        this.updateVelocityForFlow();
        this.updateVelocityForMagnetism();
        this.updateVelocityForCenterBlackHoles();
        this.updateVelocityForLevelBounds();
        this.v.setMagnitude(Math.max(0.001, this.v.magnitude - this.drag * this.delta));

        if (this.world.data.arenaName === Arenas.ARENA_ICE && !this.v.isZero()) {
            let iceAcceleration = (isFinite(this.maxSpeed) ? this.maxSpeed : 150)/3;
            let newSpeed = M.clamp(this.getSpeed() + iceAcceleration * this.delta, 0, 2000);
            this.setSpeed(newSpeed);
        }

        this.v.clampMagnitude(this.maxSpeed + 0.001);

        if (this.getStun() && this.stunImmune.done) {
            this.v.setMagnitude(0.001);
        }

        this.angle = M.atan2(this.v.y, this.v.x) + 90;
        this.animationManager.playAnimation('roll');
        this.animationManager.speed = this.canRoll ? this.v.magnitude / 3 / (this.physicalRadius / 8) : 0;
    }

    updateVelocityForFlow() {
        let f = this.getFlow();

        // Go against the flow if enemy.
        let dir = this.neutralFlowDirection;
        if (this.team === 'friend') dir = 1;
        if (this.team === 'enemy') dir = -1;

        if (SWAP_DIRECTIONS && this.team !== 'neutral') {
            dir *= -1;
        }

        if (this.disguised) {
            dir *= -1;
        }

        if (this.equipment && this.equipment.reverseDirection && !this.isNullified()) {
            dir *= -1;
        }

        if (this.world.data.arenaName === Arenas.ARENA_GRAVITY) {
            dir = 1;  // Ignore directions for gravity arena.
        }
        
        this.v.x += f.x * dir * this.acceleration * this.delta;
        this.v.y += f.y * dir * this.acceleration * this.delta;
    }

    updateVelocityForMagnetism() {
        let magAmount = 0;
        let equipmentMagnetizeAmount = this.equipment && !this.isNullified() ? this.equipment.magnetizeAmount : 0;
        if (equipmentMagnetizeAmount > 0) {
            let balls = this.world?.select?.typeAll(Ball) ?? [];
            let closestEnemy = M.argmin(balls.filter(ball => ball.team !== this.team), ball => G.distance(this, ball));
            if (closestEnemy) {
                let force = 45000 / G.distance(this, closestEnemy) * M.mapClamp(equipmentMagnetizeAmount, 0, 0.33, 0, 1);
                let forceD = closestEnemy.getPosition().subtract(this);
                this.v.add(forceD.withMagnitude(force * this.delta));
                magAmount = M.mapClamp(force, 225, 750, 0, 1);
            }
        }
        if (magAmount > 0) {
            this.addBoostMaxSpeed(this, 'magnet', (1 + equipmentMagnetizeAmount) * magAmount, 1.33 * magAmount, 0.5);
        }
    }

    updateVelocityForCenterBlackHoles() {
        for (let blackHole of this.world.select.typeAll(CenterBlackHole)) {
            let d = blackHole.getPosition().subtract(this.x, this.y);
            this.v.add(d.scale(1/d.magnitude * blackHole.gravityFactor * 200 * this.delta));
        }
    }

    updateVelocityForLevelBounds() {
        let accelerationAtBorder = 200;

        if (this.world.data.arenaName === Arenas.ARENA_GRAVITY) {
            let arenaShrink = this.world.select.type(ArenaShrinkGravity);
            let levelBorder = arenaShrink?.ceiling?.y ?? 0;
            if (this.y - this.radius < levelBorder + 1) {
                this.v.y += accelerationAtBorder * this.delta;
            }
            return;
        }

        let levelBorder = 16;
        let distanceFromBorder = 1;
        if (this.x - this.radius < levelBorder + distanceFromBorder) {
            this.v.x += accelerationAtBorder * this.delta;
        }
        if (this.x + this.radius > this.world.width - levelBorder - distanceFromBorder) {
            this.v.x -= accelerationAtBorder * this.delta;
        }
        if (this.y - this.radius < levelBorder + distanceFromBorder) {
            this.v.y += accelerationAtBorder * this.delta;
        }
        if (this.y + this.radius > this.world.height - levelBorder - distanceFromBorder) {
            this.v.y -= accelerationAtBorder * this.delta;
        }
        if (this.world.data.arenaName === Arenas.ARENA_FIRST && M.distance(this.x, this.y, this.world.width/2, this.world.height/2) < 30 + this.radius + distanceFromBorder) {
            this.v.add(this.getPosition().subtract(this.world.width/2, this.world.height/2).normalize().scale(accelerationAtBorder * this.delta));
        }
    }

    updateStatusEffects() {
        for (let i = this.statusEffects.length-1; i >= 0; i--) {
            let statusEffect = this.statusEffects[i];

            if (statusEffect.type === 'burning') {
                let damageToTake = 1 * this.delta;
                this.leechFor(damageToTake, statusEffect.source);
                if (this.world.timeScale > 0.01) statusEffect.sound.update(this.delta);

                if (statusEffect.source.team === 'friend' && youArePlaying(this.world)) {
                    updateAchievementProgress('DealBurnDamage', p => p + damageToTake);
                }
            }

            if (statusEffect.type === 'spreaddamage') {
                let damageToTake = M.mapClamp(this.delta, 0, statusEffect.timeLeft, 0, statusEffect.damageLeft);
                this.leechFor(damageToTake, statusEffect.source);
                statusEffect.damageLeft -= damageToTake;
            }

            // Timing
            this.statusEffects[i].timeLeft -= this.delta;
            if (this.statusEffects[i].timeLeft <= 0) this.statusEffects.splice(i, 1);
        }
    }

    postUpdate(): void {
        super.postUpdate();

        if (this.state === Ball.States.PREP) {
            this.properties.damage = this.dmg;
            this.properties.health = this.hp;
            this.properties.level = this.level;
            this.properties.equipment = this.equipment ? this.equipment.equipmentType : -1;
        }

        let targetAlpha = 1;
        if (this.statusEffects.find(effect => effect.type === 'protected')) {
            this.effectAura.tint = 0xFFFF00;
        } else if (this.statusEffects.find(effect => effect.type === 'leeched')) {
            this.effectAura.tint = 0xFF0000;
        } else if (this.statusEffects.find(effect => effect.type === 'healfeedback')) {
            this.effectAura.tint = 0x00FF00;
        } else {
            targetAlpha = 0;
        }

        this.effectAura.alpha = M.lerpTime(this.effectAura.alpha, targetAlpha, 10, this.delta);
        
        if (this.effectAura.alpha < 0.01) {
            this.effectAura.setVisible(false);
        } else {
            this.effectAura.setVisible(true);
            this.effectAura.scale = this.effectAuraRadius/64;
        }

        if (this.isNullified()) {
            this.nullifiedSprite.setVisible(true);
            this.nullifiedSprite.alpha = M.moveToClamp(this.nullifiedSprite.alpha, 1, 3, this.delta);
        } else {
            this.nullifiedSprite.alpha = M.moveToClamp(this.nullifiedSprite.alpha, 0, 3, this.delta);
            if (this.nullifiedSprite.alpha <= 0) {
                this.nullifiedSprite.setVisible(false);
            }
        }

        if (this.isMarked()) {
            this.markedSprite.setVisible(true);
            this.markedSprite.alpha = Tween.Easing.OscillateSine(1.5)(this.life.time);
        } else {
            this.markedSprite.setVisible(false);
        }

        let uiPositionScale = M.map(Math.max(this.visibleRadius/8, 1), 1, 4, 1, 3.5);

        this.stars.setStars(this.level-1);
        this.stars.localx = 0;
        this.stars.localy = -10 * uiPositionScale;

        this.dmgbox.setText(`${this.isGlitched() ? '?' : Math.round(this.dmg)}`);
        this.dmgbox.localx = -6 * uiPositionScale;
        this.dmgbox.localy = 8 * uiPositionScale;

        this.hpbox.setText(`${this.isGlitched() ? '?' : Math.ceil(this.hp)}`);
        this.hpbox.localx = 6 * uiPositionScale - 1;
        this.hpbox.localy = 8 * uiPositionScale;

        this.orderBallComponents();
    }

    orderBallComponents() {
        if (this.effectAura.alpha > 0) {
            World.Actions.orderWorldObjectBefore(this.effectAura, this);
        }

        World.Actions.orderWorldObjectAfter(this.stars, this);
        World.Actions.orderWorldObjectAfter(this.dmgbox, this);
        World.Actions.orderWorldObjectAfter(this.hpbox, this);

        if (this.freezeSprite) {
            World.Actions.orderWorldObjectAfter(this.freezeSprite, this);
        }

        if (this.isNullified()) {
            World.Actions.orderWorldObjectAfter(this.nullifiedSprite, this.stars);
        }
    }

    render(texture: Texture, x: number, y: number): void {
        super.render(texture, x, y);

        if (this.getStun()?.source === 'psychic') {
            let extraRadius = M.lerp(3, 4, M.mod(Math.floor(this.life.time * 16), 2));
            Draw.brush.color = 0xFF44FF;
            Draw.brush.alpha = 1;
            Draw.brush.thickness = 1;
            Draw.circleOutline(texture, x, y, this.physicalRadius + extraRadius, Draw.ALIGNMENT_OUTER);
        }

        if (isModifierActive('ballsexplode') && !this.isInShop && !this.isInYourSquadScene) {
            Draw.brush.color = 0xFF0000;
            Draw.brush.alpha = 0.6;
            Draw.brush.thickness = 1;
            Draw.circleOutline(texture, x, y, this.ballsexplodeModifierRadius);
        }
    }

    onCollide(collision: Physics.Collision) {
        if (this.state === Ball.States.BATTLE && collision.other.obj.physicsGroup === Battle.PhysicsGroups.walls) {
            this.world?.playSound('hitwall', { limit: 2 });
            if (this.world.data.arenaName === Arenas.ARENA_GRAVITY) {
                let arenaShrink = this.world.select.type(ArenaShrinkGravity);
                let levelBorder = arenaShrink?.ceiling?.y ?? 0;
                if (this.y - this.radius < levelBorder + 4) {
                    this.y += 1;
                    this.v.y = Math.max(this.v.y, 20);
                }
            } else {
                if (M.distance(this.x, this.y, global.gameWidth/2, global.gameHeight/2) > 60) {
                    let d = vec2(global.gameWidth/2, global.gameHeight/2).subtract(this).withMagnitude(0.1);
                    this.x += d.x;
                    this.y += d.y;
                }
            }

            if (isModifierActive('wallshurt')) {
                if (!this.data.modifierWallHurtTimes) this.data.modifierWallHurtTimes = {};
                if (!this.data.modifierWallHurtTimes[collision.other.obj.uid] || this.data.modifierWallHurtTimes[collision.other.obj.uid] + 0.5 < this.life.time) {
                    this.takeDamage(0.5, this, 'other');
                    this.data.modifierWallHurtTimes[collision.other.obj.uid] = this.life.time;
                }
            }

            if (isModifierActive('wallsbounce') && !(collision.other.obj instanceof Trampoline)) {
                this.changeVelocityForBounce(Ball.minModifierWallBounceSpeed);
                this.addBoostMaxSpeed(this, 'other', 1.5, 1.5, 0.7);
                this.world.playSound('trampoline', { limit: 4 });
            }
        }
        super.onCollide(collision);
    }

    addAbility<T extends AbilityType>(type: T, abilityFunction: AbilityFunction<this, Extract<AbilityType, T>>, config?: { canActivateTwice?: boolean, nullifyable?: boolean }) {
        let canActivateTwice = config?.canActivateTwice ?? true;
        let nullifyable = config?.nullifyable ?? true;
        this.abilitySet.addAbility(type, abilityFunction, nullifyable);
        if (canActivateTwice) {
            this.activateTwiceAbilities.push(type);
        }
    }

    addDamageBuffPlus(amount: number) {
        this.addChild(new BuffPlus(this.dmgbox.localx, this.dmgbox.localy-8, amount < 0 ? '-' : '+'));
    }

    addHealthBuffPlus(amount: number) {
        this.addChild(new BuffPlus(this.hpbox.localx, this.hpbox.localy-8, amount < 0 ? '-' : '+'));
    }

    addScaleAcceleration(source: any, multiplier: number, time: number) {
        let currentBoost = <Ball.ScaleAccelerationEffect>this.statusEffects.find(effect => effect.type === 'scaleacceleration' && effect.source === source);

        if (currentBoost) {
            currentBoost.multiplier = multiplier;
            currentBoost.timeLeft = time;
        } else {
            this.statusEffects.push({
                type: 'scaleacceleration',
                multiplier,
                timeLeft: time,
                source,
            });
        }
    }

    addBoostMaxSpeed(source: any, sourceType: 'magnet' | 'other', multiplier: number, boostDamageMultiplier: number, time: number) {
        let currentBoost = <Ball.BoostMaxSpeedEffect>this.statusEffects.find(effect => effect.type === 'boostmaxspeed' && effect.source === source && effect.sourceType === sourceType);

        if (currentBoost) {
            currentBoost.multiplier = multiplier;
            currentBoost.clampDamageMultiplier = boostDamageMultiplier;
            currentBoost.timeLeft = time;
            currentBoost.maxTime = time;
        } else {
            this.statusEffects.push({
                type: 'boostmaxspeed',
                multiplier,
                clampDamageMultiplier: boostDamageMultiplier,
                timeLeft: time,
                maxTime: time,
                source,
                sourceType,
            });
        }
    }

    addBurning(source: Ball, time: number) {
        let currentBurning = <Ball.BurningStatusEffect>this.statusEffects.find(effect => effect.type === 'burning' && effect.source === source);

        if (currentBurning) {
            currentBurning.timeLeft = Math.max(currentBurning.timeLeft, time);
        } else {
            let fireSound = new Sound('fire', this.world?.soundManager);
            fireSound.loop = true;
            this.statusEffects.push({
                type: 'burning',
                timeLeft: time,
                source,
                sound: fireSound,
            });
            this.world.playSound('fireignite');
        }
    }

    addMarked(time: number) {
        let currentMarked = <Ball.MarkedStatusEffect>this.statusEffects.find(effect => effect.type === 'marked');

        if (currentMarked) {
            currentMarked.timeLeft = Math.max(currentMarked.timeLeft, time);
        } else {
            this.statusEffects.push({
                type: 'marked',
                timeLeft: time,
            });
            this.world?.playSound('swoosh');
        }
    }

    addNullified(time: number) {
        let currentNullified = <Ball.NullifiedStatusEffect>this.statusEffects.find(effect => effect.type === 'nullified');

        if (currentNullified) {
            currentNullified.timeLeft = Math.max(currentNullified.timeLeft, time);
        } else {
            this.statusEffects.push({
                type: 'nullified',
                timeLeft: time,
            });
            this.world?.playSound('shake2', { volume: 0.4, limit: 1 });
            this.world?.playSound('chain', { limit: 1 });
        }
    }

    addSlow(source: Ball.SlowStatusEffect['source'], slowFactor: number, time: number) {
        let currentSlow = <Ball.SlowStatusEffect>this.statusEffects.find(effect => effect.type === 'slow');

        if (currentSlow) {
            if (slowFactor >= currentSlow.slowFactor) {
                currentSlow.slowFactor = slowFactor;
                currentSlow.timeLeft = time;
            } else {
                // Noop
            }
        } else {
            this.statusEffects.push({
                type: 'slow',
                slowFactor,
                timeLeft: time,
                source,
            });
        }
    }

    addSpreadDamage(source: Ball, amount: number, duration: number) {
        this.statusEffects.push({
            type: 'spreaddamage',
            timeLeft: duration,
            damageLeft: amount,
            source: source,
        });
    }

    addStun(source: Ball.StunStatusEffect['source'], time: number) {
        let currentStun = <Ball.StunStatusEffect>this.statusEffects.find(effect => effect.type === 'stun');

        if (currentStun) {
            if (currentStun.timeLeft < time) {
                currentStun.timeLeft = time;
                currentStun.source = source;
            }
        } else {
            this.statusEffects.push({
                type: 'stun',
                source,
                timeLeft: time,
            });
        }
    }

    addProtected(source: any, flatDamageReduction: number, time: number) {
        let currentProtected = <Ball.ProtectedStatusEffect>this.statusEffects.find(effect => effect.type === 'protected' && effect.source === source);

        if (currentProtected) {
            currentProtected.flatDamageReduction = flatDamageReduction;
            currentProtected.timeLeft = time;
        } else {
            this.statusEffects.push({
                type: 'protected',
                flatDamageReduction,
                timeLeft: time,
                source,
            });
        }
    }

    addHealFeedback(time: number) {
        let currentHealFeedback = <Ball.HealFeedbackStatusEffect>this.statusEffects.find(effect => effect.type === 'healfeedback');

        if (currentHealFeedback) {
            currentHealFeedback.timeLeft = time;
        } else {
            this.statusEffects.push({
                type: 'healfeedback',
                timeLeft: time,
            });
        }
    }

    addLeeched(time: number) {
        let currentLeeched = <Ball.LeechedStatusEffect>this.statusEffects.find(effect => effect.type === 'leeched');

        if (currentLeeched) {
            currentLeeched.timeLeft = time;
        } else {
            this.statusEffects.push({
                type: 'leeched',
                timeLeft: time,
            });
        }
    }

    becomeEtherealForTime(time: number) {
        this.runScript(S.chain(
            S.call(() => this.becomeEthereal()),
            S.wait(time),
            S.call(() => this.becomeCorporeal()),
        ));
    }

    becomeEthereal() {
        if (!this.world) return;
        this.world.playSound('cloak', { humanized: false, limit: 2 });
        this.physicsGroup = Battle.PhysicsGroups.balls_ethereal;
        this.alpha = 0.5;

        for (let i = 0; i < 4; i++) {
            let pos = Random.inCircle(this.physicalRadius).add(this.x, this.y);
            let smoke = this.world.addWorldObject(new Sprite({
                x: pos.x, y: pos.y,
                texture: lazy('ballSmoke', () => new AnchoredTexture(Texture.filledCircle(12, 0xFFFFFF, 0.7), 0.5, 0.5)),
                layer: Battle.Layers.fx,
                scale: 0,
            }));
            this.world.runScript(function*() {
                yield S.wait(Random.float(0, 0.1));
                yield S.tween(0.2, smoke, 'scale', 0, Random.float(0.66, 1), Tween.Easing.OutCubic);
                yield S.tween(0.8, smoke, 'alpha', 1, 0, Tween.Easing.InQuad);
                smoke.kill();
            });
        }
    }

    becomeCorporeal() {
        this.world?.addWorldObject(new CircleImpact(this.x, this.y, Math.max(this.physicalRadius+12, 20), { ally: 0, enemy: 2*this.dmg }, this));
        this.world?.playSound('cloak', { humanized: false, limit: 2 });

        this.physicsGroup = Battle.PhysicsGroups.balls;
        this.alpha = 1;
    }

    breakEquipment() {
        if (!this.equipment) return;
        this.equipment.break();
        this.unequip();
    }

    buff(dmg: number, hp: number) {
        this.dmg += dmg;
        this.hp += hp;
        this.maxhp += hp;

        if (dmg !== 0) {
            this.addDamageBuffPlus(dmg);
            this.showDmgStat(dmg, 0.5);
        }
        if (hp !== 0) {
            this.addHealthBuffPlus(hp);
            this.showHpStat(hp, 0.5);
        }

        this.addChild(new Sprite({
            texture: 'buffbeams',
            blendMode: Texture.BlendModes.ADD,
            copyFromParent: ['layer'],
            scale: (this.radius + 6) / 64,
            life: 0.5,
            vangle: 360,
            update: function() {
                this.alpha = M.jumpParabola(0, 1, 0, this.life.progress);
                World.Actions.orderWorldObjectBefore(this, this.parent);
            },
        }));

        this.world?.playSound('buff', { limit: 2 });
    }

    calculateDamageAgainstThis(amount: number, unblockable: boolean): number {
        if (!unblockable) {
            let flatDamageChange = this.getFlatDamageChange();
            if (flatDamageChange < 0) {
                amount = Math.min(amount, Math.max(amount + flatDamageChange, 0.75));
            } else {
                amount += flatDamageChange;
            }

            let percentDamageChange = this.getPercentDamageChange();
            amount *= percentDamageChange;
        }

        if (this.hp <= 0) amount = 1;

        return amount;
    }

    cancelAbilities() {
        this.abilitySet.cancelAbilities(this);
        this.equipment?.cancelAbilities();
    }

    changeBaseTextureAndRadius(baseTexture: string, radius: number) {
        let textures = getBallTextures(baseTexture);
        this.animationManager.animations['prep'][0].texture = textures[0];
        for (let i = 0; i < this.animationManager.animations['roll'].length; i++) {
            this.animationManager.animations['roll'][i].texture = textures[i];
        }
        this.setTexture(this.animationManager.getCurrentFrame()?.texture);

        this.radius = radius;
        this.mask = {
            type: 'local',
            texture: Ball.textureMaskForRadius(this.radius),
            offsetx: 0, offsety: 0,
        };

        this.updateBallScaleInternal();
    }

    changeHighlight(enabled: boolean, color?: number, alpha?: number) {
        if (color === undefined) color = this.effects.outline.color;
        if (alpha === undefined) alpha = this.effects.outline.alpha;
        this.effects.outline.enabled = enabled;
        this.effects.outline.color = color;
        this.effects.outline.alpha = alpha;
    }

    changeVelocityForBounce(minBounceVelocity: number) {
        if (this.v.magnitude < 500) this.v.scale(2);
        if (this.v.magnitude < minBounceVelocity) {
            this.v.setMagnitude(minBounceVelocity);
        }
    }

    cheelFor(amount: number) {
        if (this.dmg <= 0) return;
        this.dmg = M.clamp(this.dmg - amount, 0, Infinity);

        if (!this.dead && this.state === Ball.States.BATTLE) this.showDmgStat(-amount, 0.5);
    }

    dealsCollisionDamage() {
        if (this.equipment?.noCollisionDamage && !this.isNullified()) return false;
        return true;
    }

    didShootProjectile(hitCount: number) {
        if (!this.world) return;
        let otherBalls = this.world.select.typeAll(Ball).filter(ball => ball !== this);
        for (let ball of otherBalls) {
            ball.queueAbilities('onBallShootProjectile', this, hitCount);
        }

        if (youArePlaying(this.world)) {
            updateAchievementProgress('ShootProjectiles', p => p + hitCount);
        }
    }

    disguise() {
        let ballTeamColorFilter = this.effects.pre.filters.find(f => f instanceof BallTeamColorFilter) as BallTeamColorFilter;
        if (!ballTeamColorFilter) return;

        ballTeamColorFilter.setColor(Ball.getTeamColor(Ball.getInverseTeam(this.team)));
        this.disguised = true;
    }

    enterBattle() {
        this.queueAbilities('onEnterBattle');

        let otherBalls = this.world.select.typeAll(Ball).filter(ball => ball !== this);
        for (let ball of otherBalls) {
            ball.queueAbilities('onBallEnterBattle', this);
        }
    }

    equip(equipmentType: number) {
        this.unequip();
        let equipment = equipmentTypeToEquipment(equipmentType);
        if (equipment) {
            this.equipment = this.addChild(equipment);
            if (this.world) {
                this.queueAbilities('onEquip');
            }
            if (this.state === Ball.States.PRE_BATTLE) {
                this.equipment.queueAbilities('onPreBattle');
            } else if (this.state === Ball.States.BATTLE) {
                this.equipment.queueAbilities('onEnterBattle');
            }
        }
    }

    flash(color: number, amount: number, duration: number = 0.5) {
        let ball = this;
        this.runScript(function*() {
            ball.effects.addSilhouette.color = color;
            ball.effects.silhouette.amount = amount;
            yield S.tween(duration, ball.effects.silhouette, 'amount', amount, 0);
            ball.effects.silhouette.amount = 1;
            ball.effects.silhouette.enabled = false;
        });
    }

    freeze(immediate: boolean) {
        this.freezeSprite = this.addChild(new FreezeIce(this.physicalRadius, immediate));
        if (this.isInShop && this.shopSpot >= 0) {
            GAME_DATA.frozenThings[this.shopSpot] = {
                type: 'ball',
                squadBall: {
                    x: this.x, y: this.y,
                    properties: this.properties,
                }
            };
        }
    }

    getScaleAccelerationMultiplier() {
        let amount = 1;
        for (let effect of this.statusEffects) {
            if (effect.type === 'scaleacceleration') {
                amount *= effect.multiplier;
            }
        }
        return amount;
    }

    getBoostMaxSpeedMultiplier() {
        let amount = 1;
        for (let effect of this.statusEffects) {
            if (effect.type === 'boostmaxspeed') {
                let mult = M.mapTween(effect.timeLeft, effect.maxTime, 0, effect.multiplier, 1, Tween.Easing.InQuad);
                amount = Math.max(amount, mult);
            }
        }
        return amount;
    }

    getDescPrefix() {
        if (this.properties.metadata.extraSellValue > 0 || this.storesMoney) {
            let max = this.getSellValue() >= Ball.maxSellValue ? ' (max)' : '';
            return `Sells for [gold]<coin>${this.getSellValue()}[/gold]${max}`;
        }
        return undefined;
    }

    getFlatDamageChange() {
        let result = 0;
        if (this.equipment && !this.isNullified()) {
            result += this.equipment.flatDamageChange;
        }
        for (let effect of this.statusEffects) {
            if (effect.type === 'protected') {
                result -= effect.flatDamageReduction;
            }
        }
        return result;
    }

    getPercentDamageChange() {
        let result = 1;
        if (this.equipment && !this.isNullified()) {
            result *= this.equipment.percentDamageChange;
        }
        for (let effect of this.statusEffects) {
            if (effect.type === 'stun' && effect.source === 'psychic') {
                result *= 0.5;
            }
        }
        return result;
    }

    getAbilityOverrideCollisionDamage() {
        return this.dmg;
    }

    getSlowEffectSpeedMultiplier() {
        let amount = 1;
        for (let effect of this.statusEffects) {
            if (effect.type === 'slow') {
                amount *= 1-effect.slowFactor;
            }
        }
        return amount;
    }

    getSquadSize(world: World = this.world) {
        if (this.squad) return this.squad.balls.length;
        return getAllies(world, this).length;
    }

    getStartEarlyTime() {
        if (!this.equipment) return 0;
        if (this.isNullified()) return 0;
        return this.equipment.startEarlyTime;
    }

    getStun() {
        return <Ball.StunStatusEffect>this.statusEffects.find(e => e.type === 'stun');
    }

    giveShine(color?: number) {
        color = color ?? Color.lerpColorByLch(getColorForTier(this.tier), 0xFFFFFF, 0.5);
        this.removeShine();
        this.effects.pre.filters.push(new ShineFilter(color));
    }

    handleDeath(killedBy: Ball, type: 'collision' | 'other') {
        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
            this.world.playSound('balldie');

            let otherBalls = this.world.select.typeAll(Ball).filter(ball => ball !== this);

            this.queueAbilities('onDeath', killedBy);
            killedBy?.queueAbilities('onKill', this);
            for (let ball of otherBalls) {
                ball.queueAbilities('onBallDie', this);
            }

            if (type === 'other') {
                this.world.addWorldObject(new Explosion(this.x, this.y, this.physicalRadius, { ally: 0, enemy: 0 }));
            }

            if (isModifierActive('ballsexplode')) {
                this.world.addWorldObject(new Explosion(this.x, this.y, this.physicalRadius + 30, { ally: 1, enemy: 1 }, this));
            }

            if (killedBy.team === 'friend' && this.team !== 'friend' && getBattleState(this.world) !== Ball.States.BATTLE && youArePlaying(this.world)) {
                updateAchievementProgress('KillBeforeBattle', p => p+1);
            }

            if (killedBy.team !== this.team) {
                killedBy.timesKilledEnemy++;
            }

            this.kill();
        }
    }

    hasAbility(abilityType: AbilityType) {
        return this.abilitySet.hasAbility(abilityType);
    }

    hasActivatedAbility(abilityType: AbilityType) {
        return _.includes(this.activatedAbilities, abilityType);
    }

    hasBattleEffect() {
        for (let ability in ABILITIES) {
            let abilityType = ability as AbilityType;
            if (ABILITIES[abilityType].battle && this.hasAbility(abilityType)) return true;
        }

        if (this.equipment?.hasBattleEffect()) return true;

        return false;
    }

    healFor(amount: number, source: Ball): number {
        let priorHp = this.hp;
        if (this.hp < this.maxhp) {
            this.hp = M.clamp(this.hp + amount, 0, this.maxhp);
        }
        let hpDiff = this.hp - priorHp;

        if (source.team === 'friend' && youArePlaying(this.world)) {
            updateAchievementProgress('HealHp', p => p + Math.max(hpDiff, 0));
        }

        if (this.state === Ball.States.BATTLE && hpDiff !== 0) {
            this.showHpStat(hpDiff, 0.5);
            this.addHealFeedback(0.5);
        }
        return hpDiff;
    }

    hideAllStats() {
        this.dmgbox.setVisible(false);
        this.hpbox.setVisible(false);
        this.stars.setVisible(false);
        this.showingAllStats = false;
    }

    isBeingMoved() {
        if (!this.world) return false;
        let ballMover = this.world.select.type(BallMover, false);
        if (!ballMover) return false;
        return ballMover.movingThing === this;
    }

    isBurning() {
        return !!this.statusEffects.find(effect => effect.type === 'burning');
    }

    isGlitched() {
        return false;
    }

    isMarked() {
        return !!this.statusEffects.find(effect => effect.type === 'marked');
    }

    isNullified() {
        return !!this.statusEffects.find(effect => effect.type === 'nullified');
    }

    isPurchasable() {
        return true;
    }

    isTakingSpreadDamage() {
        return !!this.statusEffects.find(effect => effect.type === 'spreaddamage');
    }

    joinTeam() {
        let otherBalls = this.world.select.typeAll(Ball).filter(ball => ball !== this && !ball.isInShop);
        for (let ball of otherBalls) {
            ball.queueAbilities('onBallJoin', this);
        }
    }

    leechFor(amount: number, source: Ball) {
        if (this.dead) return 0;

        let percentDamageChange = this.getPercentDamageChange();
        amount *= percentDamageChange;

        this.hp -= amount;

        if (source.team === 'friend' && youArePlaying(this.world)) {
            updateAchievementProgress('DealDamage', p => p + Math.max(amount, 0));
        }

        this.queueAbilities('onTakeLeechDamage', amount);
        this.handleDeath(source, 'other');
        if (!this.dead && this.state === Ball.States.BATTLE) this.showHpStat(-amount, 0.5);

        return amount;
    }

    levelUp(withProperties: SquadBallProperties, withFanfare: boolean = true, withStatIncrease: boolean = true) {
        let levelUpPropeties = withProperties || this.getPropertiesForCurrentBallState();
        
        this.level++;

        this.dmg = Math.max(this.dmg, levelUpPropeties.damage);
        this.hp = Math.max(this.hp, levelUpPropeties.health);

        if (withStatIncrease) {
            this.dmg += 1;
            this.hp += 1;
        }

        if (!this.equipment) {
            this.equip(levelUpPropeties.equipment);
        }

        let buffs = this.world?.select?.typeAll(Buff) ?? [];
        for (let buff of buffs) {
            if (buff.target.properties === levelUpPropeties) {
                buff.target = this;
            }
        }

        if (withFanfare) {
            this.addChild(new Sprite({
                texture: 'buffbeams',
                blendMode: Texture.BlendModes.ADD,
                copyFromParent: ['layer'],
                scale: (this.physicalRadius + 12) / 64,
                life: 1.5,
                vangle: 180,
                update: function() {
                    this.alpha = M.jumpParabola(0, 1, 0, this.life.progress);
                    World.Actions.orderWorldObjectBefore(this, this.parent);
                },
            }));
            this.world?.playSound('levelup');
        }

        if (withProperties && withProperties !== this.properties && (levelUpPropeties.metadata.extraSellValue > 0 || this.properties.metadata.extraSellValue > 0 || this.storesMoney)) {
            this.properties.metadata.extraSellValue += 1 + levelUpPropeties.metadata.extraSellValue;
        }

        this.queueAbilities('onLevelUp');
    }

    levelDown() {
        this.level = Math.max(this.level-1, 1);
        this.queueAbilities('onLevelDown');
    }

    noteAbilityActivated(abilityType: AbilityType) {
        this.activatedAbilities.push(abilityType);
    }

    onEndGameBeforeDelayResolveObjects() {
        let burnEffect = this.statusEffects.find(effect => effect.type === 'burning') as Ball.BurningStatusEffect;
        if (burnEffect) {
            let burnTime = burnEffect.timeLeft;
            this.addChild(new WorldObject({
                tags: [Tags.DELAY_RESOLVE(Ball.getInverseTeam(this.team))],
                life: Math.min(burnTime+0.1, 5),
            }));
        }

        let spreadDamageEffect = this.statusEffects.find(effect => effect.type === 'spreaddamage') as Ball.SpreadDamageStatusEffect;
        if (spreadDamageEffect) {
            let spreadDamageTime = spreadDamageEffect.timeLeft;
            this.addChild(new WorldObject({
                tags: [Tags.DELAY_RESOLVE(Ball.getInverseTeam(this.team))],
                life: Math.min(spreadDamageTime+0.1, 5),
            }));
        }
    }

    onPickUp() {

    }

    onPutDown() {
        
    }

    onStateChangePreBattle() {
        
    }

    onStateChangeBattle() {
        
    }

    onTeamsSpawned() {

    }

    playButtonClicked() {
        this.queueAbilities('onPlay');
    }

    queueAbilities<T extends AbilityType>(type: T, ...params: AbilityParams<Extract<AbilityType, T>>) {
        this.abilitySet.queueAbilities(type, this, this.isNullified(), params);

        if (_.contains(this.activateTwiceAbilities, type) && this.shouldActivateAbilityTwice()) {
            this.abilitySet.queueAbilities(type, this, this.isNullified(), params);
        }

        this.equipment?.queueAbilities(type, ...<any>params);
    }

    removeNullified() {
        A.filterInPlace(this.statusEffects, effect => effect.type !== 'nullified');
    }

    removeShine() {
        let i = this.effects.pre.filters.findIndex(filter => filter instanceof ShineFilter);
        if (i >= 0) {
            this.effects.pre.filters.splice(i, 1);
        }
    }

    removeStatusEffectsOfType(type: Ball.StatusEffect['type']) {
        A.filterInPlace(this.statusEffects, effect => effect.type === type);
    }

    setBallScale(ballScale: number) {
        this.ballScale = ballScale;
        this.updateBallScaleInternal();
    }

    setMassScale(massScale: number) {
        this.massScale = massScale;
        this.updateBallScaleInternal();
    }

    setMoveScale(moveScale: number) {
        this.moveScale = moveScale;
        this.updateBallScaleInternal();
    }

    stop(time: number) {
        this.addSlow('other', 0.8, time);
        this.addScaleAcceleration(this, 0, time);
    }

    private updateBallScaleInternal() {
        this.scale = this.ballScale * this.moveScale;
        this.mask.texture = Ball.textureMaskForRadius(this.radius * this.scale);
        this.mass = this.radius/8 * (this.ballScale**3) * this.massScale;
        (<CircleBounds>this.bounds).radius = this.radius * this.ballScale;
    }

    setForInShop() {

    }

    setForShare() {
        this.equipment?.setForShare();
    }

    setPreBattleAbilityActiveCheck(check: () => any) {
        this._preBattleAbilityActiveCheck = check;
    }

    shouldActivateAbilityTwice() {
        return this.equipment && this.equipment.chanceToActivateAbilitiesTwice > 0 && !this.isNullified() && Ball.Random.boolean(this.equipment.chanceToActivateAbilitiesTwice);
    }

    shouldSellAtOneGold() {
        // if (!this.world) return false;
        // return this.world.select.typeAll(Ball)
        //     .some(ball => ball.team === this.team && ball !== this && !ball.isInShop && ball.properties.type === this.properties.type && ball.equipment?.stockEquippedBall);
        return false;
    }

    showAllStats() {
        this.showDmgStat(0, Infinity);
        this.showHpStat(0, Infinity);
        this.showLvlStat(Infinity);
        this.showingAllStats = true;
    }

    showDmgStat(changeSign: number, time: number) {
        this.dmgbox.setVisible(true);
        this.dmgbox.setColor(changeSign < 0 ? 0xFF0000 : changeSign > 0 ? 0xFFD800 : 0xFFFFFF);
        if (_.isFinite(time)) {
            this.showDmgStatScript?.stop();
            this.showDmgStatScript = this.runScript(S.chain(
                S.wait(time),
                S.call(() => {
                    this.dmgbox.setColor(0xFFFFFF);
                    if (this.state === Ball.States.BATTLE && !this.showingAllStats) this.dmgbox.setVisible(false)
                }),
            ));
        }
    }

    showHpStat(changeSign: number, time: number) {
        this.hpbox.setVisible(true);
        this.hpbox.setColor(changeSign < 0 ? 0xFF0000 : changeSign > 0 ? 0xFFD800 : 0xFFFFFF);
        if (_.isFinite(time)) {
            this.showHpStatScript?.stop();
            this.showHpStatScript = this.runScript(S.chain(
                S.wait(time),
                S.call(() => {
                    this.hpbox.setColor(0xFFFFFF);
                    if (this.state === Ball.States.BATTLE && !this.showingAllStats) this.hpbox.setVisible(false)
                }),
            ));
        }
    }

    showLvlStat(time: number) {
        this.stars.setVisible(true);
        if (_.isFinite(time)) {
            this.showLvlStatScript?.stop();
            this.showLvlStatScript = this.runScript(S.chain(
                S.wait(time),
                S.call(() => this.stars.setVisible(false)),
            ));
        }
    }

    takeDamage(amount: number, source: Ball, type: 'collision' | 'other', unblockable: boolean = false): number {
        if (this.dead) return 0;
        if (!this.world) return 0;
        if (amount === 0 && !unblockable) return 0;

        this.world.playSound('ballhit', { limit: 10 });

        let damageToDeal = this.calculateDamageAgainstThis(amount, unblockable);

        if (this.equipment && this.equipment.blockOneDiscreteDamage && damageToDeal > 0 && !unblockable) {
            this.breakEquipment();
            if (!this.isNullified()) {
                return 0;
            }
        }

        let damageDealt = Math.min(this.hp, damageToDeal);
        if (this.equipment && this.equipment.spreadDamageOverTime > 0 && !this.isNullified() && !unblockable) {
            this.addSpreadDamage(source, damageToDeal, this.equipment.spreadDamageOverTime);
        } else {
            this.hp -= damageToDeal;
        }

        this.timesTakenDamage++;
        this.queueAbilities('onTakeDamage', damageDealt);
        let otherBalls = this.world.select.typeAll(Ball).filter(ball => ball !== this);
        for (let ball of otherBalls) {
            ball.queueAbilities('onBallTakeDamage', this, damageDealt);
        }

        if (source.team === 'friend' && youArePlaying(this.world)) {
            updateAchievementProgress('DealDamage', p => p + Math.max(damageDealt, 0));
        }

        this.handleDeath(source, type);

        if (!this.dead && damageDealt !== 0) {
            this.showHpStat(-damageDealt, 0.5);
        }

        return damageDealt;
    }

    undisguise() {
        let ballTeamColorFilter = this.effects.pre.filters.find(f => f instanceof BallTeamColorFilter) as BallTeamColorFilter;
        if (!ballTeamColorFilter) return;

        ballTeamColorFilter.setColor(Ball.getTeamColor(this.team));
        this.disguised = false;
    }

    unequip() {
        if (!this.equipment) return;
        this.equipment.cancelAbilities();
        this.equipment.kill();
        this.equipment = undefined;
    }

    unfreeze() {
        this.freezeSprite.kill();
        this.freezeSprite = undefined;
        if (this.isInShop && this.shopSpot >= 0) {
            GAME_DATA.frozenThings[this.shopSpot] = undefined;
        }
    }

    useItem(item: BallItem) {
        item.onApplyToBall(this);
    }

    private getPropertiesForCurrentBallState(): SquadBallProperties {
        return {
            type: this.properties.type,
            damage: this.dmg,
            health: this.hp,
            equipment: this.equipment ? this.equipment.equipmentType : -1,
            level: this.level,
            metadata: _.clone(this.properties.metadata),
        };
    }

    protected getFlow() {
        if (this.world.data.arenaName === Arenas.ARENA_GRAVITY) {
            return Vector2.DOWN.scale(0.8);
        }
        if (this.world.data.arenaName === Arenas.ARENA_ICE && !this.v.isZero()) {
            return Vector2.ZERO;
        }
        return this.getPosition().subtract(global.gameWidth/2, global.gameHeight/2).normalize().rotate(90);
    }

    private getArenaIceSpeedMultiplier() {
        if (this.world.data.arenaName !== Arenas.ARENA_ICE) return 1;
        let arenaShrinkIce = this.world.select.type(ArenaShrinkIce, false);
        if (!arenaShrinkIce) return 1;
        return arenaShrinkIce.speedMultiplier;
    }

    static handleCollision(collision: Physics.Collision) {
        let ball1 = <Ball>collision.self.obj;
        let ball2 = <Ball>collision.other.obj;

        ball1.queueAbilities('onCollideWithBallPreDamage', ball2);
        ball2.queueAbilities('onCollideWithBallPreDamage', ball1);

        ball1.stunImmune.reset();
        ball2.stunImmune.reset();

        let isBall1Immune = ball1.team !== 'neutral' && ball1.life.time < ball1.afterAddImmuneTime;
        let isBall2Immune = ball2.team !== 'neutral' && ball2.life.time < ball2.afterAddImmuneTime;

        if (isBall1Immune || isBall2Immune) return;

        let collisionV = vec2(collision.self.pre_vx - collision.other.pre_vx, collision.self.pre_vy - collision.other.pre_vy);

        if (ball1.team !== ball2.team && !ball1.disguised && !ball2.disguised) {
            ball1.world?.addWorldObject(new BurstPuffSystem({
                x: (ball1.x + ball2.x)/2,
                y: (ball1.y + ball2.y)/2,
                layer: Battle.Layers.fx,
                puffCount: Math.floor(10 * getParticleLevel()),
                puffConfigFactory: () => ({
                    maxLife: 0.6,
                    v: Random.inCircle(70),
                    color: 0xFFFF00,
                    finalColor: 0xAA3300,
                    radius: 2,
                    finalRadius: 0,
                }),
            }));

            ball1.world?.addWorldObject(new Explosion((ball1.x + ball2.x)/2, (ball1.y + ball2.y)/2, 10, { ally: 0, enemy: 0 }));
            (global.theater ?? ball1.world)?.runScript(shake(ball1.world, 1, 0.1));

            let ball1baseDmg = ball1.isNullified() ? ball1.dmg : ball1.getAbilityOverrideCollisionDamage();
            let ball1dmg = ball1baseDmg * Math.min(M.magnitude(collision.self.pre_vx, collision.self.pre_vy) / Ball.oneDamageSpeed, ball1.clampDamageRatio);
            if (ball1.getStun()) ball1dmg = 0;
            let ball2baseDmg = ball2.isNullified() ? ball2.dmg : ball2.getAbilityOverrideCollisionDamage();
            let ball2dmg = ball2baseDmg * Math.min(M.magnitude(collision.other.pre_vx, collision.other.pre_vy) / Ball.oneDamageSpeed, ball2.clampDamageRatio);
            if (ball2.getStun()) ball2dmg = 0;

            let damageDealt2 = ball2.dealsCollisionDamage()
                                ? ball1.takeDamage(ball2dmg, ball2, 'collision')
                                : ball1.calculateDamageAgainstThis(ball2dmg, false);
            let damageDealt1 = ball1.dealsCollisionDamage()
                                ? ball2.takeDamage(ball1dmg, ball1, 'collision')
                                : ball2.calculateDamageAgainstThis(ball1dmg, false);
            
            ball1.queueAbilities('onCollideWithEnemyPostDamage', ball2, damageDealt1);
            ball2.queueAbilities('onCollideWithEnemyPostDamage', ball1, damageDealt2);

            if (isModifierActive('slowcollisions')) {
                ball1.stop(0.5);
                ball2.stop(0.5);
            }

            ball1.timesCollidedWithEnemy++;
            ball2.timesCollidedWithEnemy++;
        } else {
            ball1.world?.addWorldObject(new BurstPuffSystem({
                x: (ball1.x + ball2.x)/2,
                y: (ball1.y + ball2.y)/2,
                layer: Battle.Layers.fx,
                puffCount: Math.floor(10 * getParticleLevel()),
                puffConfigFactory: () => ({
                    maxLife: 0.3,
                    v: Random.inCircle(50),
                    color: 0xFFFFFF,
                    radius: 4 * collisionV.magnitude / 200,
                    finalRadius: 0,
                }),
            }));
        }
    }
}

namespace Ball {
    export namespace States {
        export const PREP = 'prep';
        export const PRE_BATTLE = 'prebattle';
        export const BATTLE = 'battle';
    }

    export const Random = new RandomNumberGenerator();

    export function getInverseTeam(team: Ball.Team) {
        if (team === 'neutral') return 'neutral';
        if (team === 'enemy') return 'friend';
        return 'enemy';
    }

    export function getTeamForColorAprilFools(team: Ball.Team) {
        if (LiveVersion.APRIL_FOOLS) return getInverseTeam(team);
        return team;
    }

    export function getTeamColor(team: Ball.Team) {
        team = getTeamForColorAprilFools(team);
        if (team === 'friend') return 0x484DFF;
        if (team === 'enemy') return 0x00BB00;
        return 0x808080;
    }
    export function getDarkTeamColor(team: Ball.Team) {
        team = getTeamForColorAprilFools(team);
        if (team === 'friend') return 0x24267F;
        if (team === 'enemy') return 0x005D00;
        return 0x404040;
    }
    export function getLightTeamColor(team: Ball.Team) {
        team = getTeamForColorAprilFools(team);
        if (team === 'friend') return 0xA3A6FF;
        if (team === 'enemy') return 0x7FDD7F;
        return 0xBFBFBF;
    }

    const MASK_CACHE = new LazyDictNumber(radiusRounded => new AnchoredTexture(Texture.filledCircle(radiusRounded, 0xFFFFFF), 0.5, 0.5));
    export function textureMaskForRadius(radius: number) {
        let radiusRounded = Math.round(radius);
        return MASK_CACHE.get(radiusRounded);
    }
}