const PATCH_NOTES_INT = [`
- Patch 9/3 -

Congrats to [pg]Xephia[/] for winning the Auto Balls Shuffle Scuffle tournament!

Balance
+ Ball of Ice: now costs [dgold]1<star>[/] to use
        its ability
+ Toxin: [r]1<sword>[/r] [pg]2<heart>[/pg] -> [r]3<sword>[/r] [pg]3<heart>[/pg],
        now a Tier II ball, acid
        pool shrinks 33% faster

Minor Changes
+ You can now see damage/health
  values of certain objects (e.g
  medpacks, mines, buffs, bullets,
  etc.) while paused.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Patch 8/17 -

Bug Fixes
+ Fixed an issue where some "on
  enter battle" abilities would
  trigger twice if a Mocha was in
  play
+ Added a tiny, unnoticeable
  cooldown to Seeker's ability to
  prevent it from rapidly shooting
  spikes in certain situations

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Patch 8/11 -

Balance
+ Curry is no longer completely
  negated by Nullifier at the
  start of battle. Its effect
  will continue after Nullify
  wears off.
+ Nullifier: ability time scaling
  reduced per level and now caps
  at 7s (reduced from 10s)
+ Toxin: acid pool radius now
  decreases over time


Minor Changes
+ Increased the weight of
  Cannonballs.
+ Applied slight tints to Toxin's
  and Butterball's abilities to
  visually differentiate teams.
+ Increased battle transition
  speed with Fast Battle
  Transitions enabled.

Bug Fixes
+ Fixed issue where you could
  pause the game during round
  resolution.
+ Fixed issue where Mechanic could
  waste its ability if its target
  ally died before the equipment
  reached it.
+ Fixed issue where a Cue Ball
  equipped with Mocha could boost
  an ally with unbounded velocity
+ Fixed issue where a Jetpack-
  equipped ball would not be
  stopped by Stopper.
+ Fixed issue where Ball of Yarn's
  and Butterball's trails would
  reset when starting early with
  Mocha.
+ Fixed bug where Nullifier's
  ability would sometimes not end
  on death.
+ Fixed bug where some balls like
  Alchemist and Poke Ball could
  still activate their abilities
  after being nullified.
+ Fixed visual bug where Stopper's
  effect would not play if it died
  on collision.
+ Fixed visual bug with ball stats
  sometimes disappearing.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Patch 8/8 -

Changes
+ Updated the Shuffle matchmaker to
  match you with other weekly
  squads!
+ Fixed issue where rounds
  sometimes ended while Phoenix's
  or Best Friend's revivals were
  still activating.  
+ The Bug can no longer change
  balls into invalid ball mutations
  in the Victory Lap.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.4B -

[pg]The Auto Balls Weekly Shuffle is here![/pg] A random pack of balls from Classic and Community generated every week!

Major Changes
+ The Auto Balls Weekly Shuffle is
  here!
+ 4 new balls!
+ 2 new items!
+ 3 new achievements!
+ A whole week of Dailies with new
  modifiers!
+ You can now pick separate packs
  for players in VS Mode!
+ New VS Mode pack: Shuffle!

Balance Changes
+ Dolly: now works with Green Cube!
+ Glitched Ball: new abilities
        + Leave acid pool
        + Stop enemy for 1s
+ Greater Mimic: removed from the
        game, extra power given to
        the normal Mimic
+ Mimic: now gains half the
        target's level during
        battle
+ Vagrant: can no longer take
        Molecular Disassemblers
        from the shop. You are
        safe now! :)

Bug Fixes
+ Fixed various issues related to
  round results being decided too
  early (during the slowdown)
+ Fixed issue where Haunt's ghost
  could keep the game going even
  after one team lost
+ Fixed issue where Versus Mode
  games were not keeping track of
  certain game statistics when
  reloading the game.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.4.1 -

Balance Changes
+ Bandaid: health gain on purchase
        now applies on equip too
        (so it works when given by
        Mechanic or stolen by Thief
        Mask, for example)
+ Bank: payout period now maxes at
        6 rounds
+ Burner: radius now has falloff at
        high levels similar to
        Grenade
+ Curry: now lasts for 10 seconds
        in battle
+ Medkit: healing timer [grey]3[/]s -> [grey]2[/]s
+ Mimic: [r]1<sword>[/r] [pg]8<heart>[/pg] -> [r]2<sword>[/r] [pg]8<heart>[/pg],
        shop stocks Greater Mimics
        instead of Mimics in
        Tier 3+
+ Nullifier: effect now ends
        immediately if the
        Nullifier dies

Bug Fixes
+ Fixed bug where old game state
  would sometimes carry over into
  a new Versus Mode game
+ Fixed some issues with abilities
  activating in the wrong order
+ Fixed bug where Joker was not
  removed after use if equipped on
  a Mimic
+ Fixed bug where some abilities
  would not wait for Hitman's
  ability to finish before
  activating

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Patch 7/1 -

Changes
+ You can now view others' final
  squads on the Daily leaderboard!

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Patch 6/30 -

Changes
+ Updated the Daily leaderboard to
  treat low rounds as better for
  victories and high rounds as
  better for defeats.

Bug Fixes
+ Fixed bug where too many Hunter's
  Marks crashed the game
+ Fixed bug where Bandaid could
  activate multiple times in a
  battle
+ Fixed bug where multiple Dollies
  would not all activate
+ Fixed bug where sometimes a
  second item would appear in the
  shop when there should only be
  one
+ Fixed bug where you would appear
  to get Ballmanac progress for
  each Victory Lap win
+ Fixed bug where the wrong win
  count was displayed for the
  Classic pack

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.4 -

[pg]Auto Balls Dailies are here![/pg] Compete with other players for the top spot; same opponents, same shop, same RNG! But be careful, you only get one shot!

Major Changes
+ Auto Balls Dailies are here!
+ 5 new Community Pack balls!
+ 2 new items!
+ 5 new achievement unlockables!
+ Congrats to [pg]Materwelons[/] for
  winning the Auto Balls Community
  Bash tournament!
+ Added anti-timeout mechanisms to
  the arenas from the last update.
+ Changed Zoomer unlock criteria,
  you may have to re-unlock it even
  if you had it before.

Balance Changes
+ Angel: [r]2<sword>[/r] [pg]1<heart>[/pg] -> [r]3<sword>[/r] [pg]1<heart>[/pg]
+ Armor Plating:
        damage reduction [r]1<sword>[/r] -> [r]2<sword>[/r]
+ Bank: (rework) now pays out money
        over several rounds
+ Butter Ball: now additionally
        boosts ally acceleration as
        well as max speed
+ Devil: spike damage is now a
        fixed [r]2/3/4<sword>[/r],
        removed target limit
+ Fireball: [r]0<sword>[/r] [pg]2<heart>[/pg] -> [r]0<sword>[/r] [pg]3<heart>[/pg]
+ Fragmenter: [r]1<sword>[/r] [pg]2<heart>[/pg] -> [r]1<sword>[/r] [pg]3<heart>[/pg]
+ Grave: summoned skeletons
        [grey]1[/] -> [grey]2[/]
+ Guardian: (rework) now heals
        allies when they take
        damage
+ Haunt: ghost now appears much
        quicker
+ Hitman: now only sacrifices half
        of its [r]<sword>[/r]
+ Impostor: decreased detection
        radius by 25%
+ Jetpack: increased acceleration
        by 33%
+ Mitosis: copies no longer count
        as summons
+ Necromancer: summon limit
        [grey]4[/] -> [grey]5[/]
+ Nullifier: now only targets
        enemies with battle effects
+ Old Crystal Ball: [r]1<sword>[/r] [pg]7<heart>[/pg] -> [r]6<sword>[/r] [pg]2<heart>[/pg]
+ Phoenix: can no longer revive
        more than twice when
        equipped with Green Cube
+ Protection Bubble: damage
        reduction [grey]33%[/] -> [grey]50%[/]
+ Reducer: stars removed
        [grey]2/3/4[/][dgold]<star>[/] -> [grey]1/2/3[/][dgold]<star>[/]
+ Scrap Cannon: restocks needed to
        reach full power [grey]5[/] -> [grey]4[/]
+ Sleeper: self-healing
        [pg]0.5/1/1.5[/] -> [pg]0.25/0.5/0.75[/],
        increased heal radius by
        50%, now starts healing
        immediately when entering
        battle
+ Unstable Catalyst: health drain
        -[pg]0.3<heart>/s[/pg] -> -[pg]0.25<heart>/s[/pg]
+ Vampire: [r]4<sword>[/r] [pg]1<heart>[/pg] -> [r]5<sword>[/r] [pg]2<heart>[/pg]
+ Vanguard: increased protection
        radius by 25%
+ Watcher: (rework) now gains buff
        when an ally or enemy is
        summoned,
        removed activation limit
+ Wizard: now gains [r]1<sword>[/r] [pg]1<heart>[/pg] when it
        reappears in the shop
+ Wobby: health buff is now given
        to itself as well as allies

Bug Fixes
+ Fixed bug where some players were
  locked out of their matchmaking
  game after reloading the game.
+ Fixed bug where Leech and Cheel
  did not disperse remaining [r]<sword>[/]/[pg]<heart>[/] on
  death.
+ Fixed bug where Joker could
  scramble a team to the opposite
  side of the arena.
+ Fixed bug where Versus Mode games
  incorrectly counted toward your
  matchmaking win count.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Patch 5/17 -

Changes
+ Complete the Ballmanac and get
  your name added to the credits!
+ Cloud Sync now smartly merges
  cloud data with local data to
  help avoid data being
  unintentionally overwritten

Bug Fixes
+ The Ballmanac now properly syncs
  with Cloud Save
+ Orbiting Potato now correctly
  counts victories in the Ballmanac
+ Fixed Orbiting Potato not
  blocking projectiles during
  prebattle

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.3.0 -

Introducing the [pg]Auto Balls Community Pack[/pg]! A brand new pack of balls suggested by the amazing gamers in the Auto Balls Discord server!

[pg]35[/] new balls!
[pg]15[/] new items!

Major Changes
+ A shiny pack of 35 new balls
  suggested by you guys!
+ Track your wins with every ball
  and item in the [pg]Ballmanac[/pg]!
+ Looking for a challenge? Test
  your skill against [dgold][offsetx -3]<crown>[/offsetx][/dgold]Winning
  squads in Challenge Mode!
+ Your Matchmaking and Versus Mode
  games are now saved locally, so
  you can quit and pick up where
  you left off later!
+ Abilities activating at the start
  of battle are now done one at a
  time for better clarity
+ Introducing Tier [dgold]<crown>[/dgold], a special
  tier for Victory Lap that offers
  powerful mutated balls in the
  shop!
+ You now gain +1[r]<heart>[/r] every lap in
  Victory Lap
+ And too many quality-of-life
  changes to list!

Balance Changes
+ Bandaid: now gives [pg]1<heart>[/pg] on purchase
+ Claw: increased damage [r]3<sword>[/r] -> [r]4<sword>[/r]
+ Clout-In-A-Jar: removed level cap
        restriction
+ Coin: can store a max of 50[gold]<coin>[/gold]
+ Commando: [r]<sword>[/]/[pg]<heart>[/] gained per death
        [grey]10%/20%/30%[/grey] -> [grey]0.5/1/1.5[/grey]
+ Crown: bonus stars
        1/2/3[gold]<star>[/gold] -> 0/1/2[gold]<star>[/gold],
        can now be killed by allies
        like Poke Ball, etc. at the
        start of battle.
        allies will not replace the
        crown on kill
+ Crusher: damage gain on hit
        [r]1/1.5/2<sword>[/r] -> [r]1/2/3<sword>[/r]
+ Hyper Driver: multiple Hyper
        Drivers now take 5[gold]<coin>[/gold] each
        for consistency
+ Magnet: now takes about a second
        for the magnetism to ramp
        up at the start of battle
+ Necromancer: no longer
        distinguishes between
        "living" and "non-living"
        allies
+ Ninja: spikes shot
        [grey]2/3/4[/grey] -> [grey]2/4/6[/grey],
        spikes no longer change
        target if the target dies
+ Overcharger: each zap now deals
        [r]2<sword>/s[/], decaying to [r]1<sword>/s[/]
        over 1s;
        increased range slightly
+ Poke Ball: ally level increase
        [grey]-2/-1/0[/grey][gold]<star>[/gold] -> [grey]0/1/2[/grey][gold]<star>[/gold]
+ Sniper: now shoots bullets at
        enemies instead of spikes,
        ability activates when an
        enemy is summoned or
        gains 1 [pg]<heart>[/pg]/[r]<sword>[/r]
+ Trainer: damage buff
        [r]1/2/3<sword>[/r] -> [r]1/1.5/2<sword>[/r],
        now gives buff when an ally
        enters battle
+ Vanguard: damage reduction
        [r]1/1.5/2<sword>[/r] -> [r]1/2/3<sword>[/r]
+ Wobby: can now buff other Wobbies

Bug Fixes
+ Pause and fast-forward are smooth
  once again! (in Matchmaking)
+ Toxic Fungus now destroys itself
  after use
+ Balls can no longer activate
  their abilities on the same frame
  they are eaten by Poke Ball
+ Poke Ball no longer removes
  Grenade health after storing it
+ Balls revived by Best Friend are
  now correctly treated as equal to
  the original
+ Improved performance when using
  Ball of Yarn
+ Fixed some issues with dragging
  and freezing on mobile

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Happy Birthday Auto Balls!!! -

[pg]Thank you all so much for playing and supporting the game! :) Enjoy a week-long celebration with a limited-time new ball, and an item that transforms the game...[/]

Available Jan 19 - Jan 25!

Bug Fixes:
+ Fixed bug where Medic's medkits
  did not heal the correct amount
+ Fixed bug where Cue Ball could
  yeet itself out of existence at
  the start of battle

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.2.5 (Patch) -

[pg]The Auto Balls Itch page now works on iOS!! (mostly!)[/] This is a work in progress, please let me know if you notice any issues :)

I'm working to improve matchmaking over the next week or so. You may notice better variety in opponents coming soon!

Balance Changes
+ Voodoo Ball: removed ability
        damage cap

App Bug Fixes (Requires app update)
+ Fixed bug where you could get
    stuck in Twitter when sharing
    on mobile
+ Probably fixed a bug where audio
    would continue playing after
    switching or closing the app

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.2.5 -

[pg]Auto Balls is now on Android!! Check it out now on Google Play or Itch.io![/]

Major Changes
+ 1 new ball and 1 new item!
+ Sync your save data to the cloud
    with [pg]Cloud Sync[/], in the bottom-
    left corner of the main menu!
+ "Complete a Victory Lap" is now a
    secret achievement
+ Booster is now unlocked from a
    new achievement. If you had
    Booster unlocked previously,
    it will remain unlocked :)
+ Adjusted several descriptions to
    be more accurate

Balance Changes
+ Armor Plating: damage limit
        1 -> 0.75
+ Crown: ability now activates only
        when killed by an enemy
+ Smoke Bomb: now a Tier 2
        equipment
+ Vagrant: can now take any item
        from the shop, frozen or
        unfrozen
+ Vampire: [r]4<sword>[/r] [pg]4<heart>[/pg] -> [r]4<sword>[/r] [pg]1<heart>[/pg],
        now a Tier 3 ball,
        now drains health at a rate
        of [pg]3<heart>/s[/pg] from nearby allies
+ Vanguard: damage limit
        1 -> 0.75

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.2.4 -

Major Changes
+ [pg]1 new ball and 1 new item![/]
+ By popular demand, you can now
    [dgold]spectate[/] others' Versus Mode
    games! Check it out in the
    Versus Mode menu :)
+ Spruced up the UI in Versus Mode.
    Now you'll know when the other
    player is ready!
+ Removed the Bio-Grenade
    achievement... for now.

Balance Changes
+ Booster: now a Tier 2 ball,
        [r]1<sword>[/r] [pg]3<heart>[/pg] -> [r]3<sword>[/r] [pg]4<heart>[/pg]
+ Hyper Driver: gold requirement
        now increases by [dgold]<coin>3[/]
        per additional Hyper Driver
        in your squad
+ Medic: dispensed medkits are now
        slightly magnetic toward
        hurt friendly balls
+ Psychic: now waits one frame
        after battle start before
        determining which ball to
        lock

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.2.3 -

Major Changes
+ Added option for fast transitions
    between battles

Balance Changes
+ Best Friend: revive with
        [r]half <sword>[/r] [pg]1<heart>[/pg] -> [r]1<sword>[/r] [pg]1<heart>[/pg]
+ Booster: now spreads boosts
        across multiple allies
+ Necromancer: skeleton health
        [pg]1/1/1<heart>[/pg] -> [pg]1/2/3<heart>[/pg]
+ Rejuvenator: removed healing cap
+ Skull Charm: skeleton gains [r]1<sword>[/r]
        for each [dgold]<star>[/dgold] on the equipped
        ball
+ Unstable Catalyst: health drain
        -[pg]0.5<heart>/s[/pg] -> -[pg]0.3<heart>/s[/pg]

Bug Fixes:
+ Fixed bug where balls could
    activate previous equipment if
    leveled-up in battle

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.2.2 (Patch) -

Balance Changes
+ Retro Glasses: "guaranteed" ->
        "significantly more likely"
    - effect is decreased on
        certain balls such as
        Crystal Ball
    - removed the discount for
        equipped balls

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.2.2 (1.2B) -

[pg]2[/] new balls!
[pg]4[/] new items!
[pg]1[/] new achievement!

Major Changes
+ Don't feel like quitting after
    winning? Take a Victory Lap!
+ Customize your Versus Mode
    experience with new settings!
+ Removed Bio-Grenade... for now.

Balance Changes
+ Ball of Ice: [r]3<sword>[/r] [pg]4<heart>[/pg] -> [r]2<sword>[/r] [pg]4<heart>[/pg],
        multiple BOIs can no longer
        target the same frozen ball
+ Ball of Yarn: now slows on hit
        in addition to its trail
+ Necromancer: [r]2<sword>[/r] [pg]5<heart>[/pg] -> [r]1<sword>[/r] [pg]6<heart>[/pg],
        skeleton damage
            [r]1/1/1<sword>[/r] -> [r]1/2/3<sword>[/r]
        skeleton health
            [pg]1/2/3<heart>[/pg] -> [pg]1/1/1<heart>[/pg]
        now can only summon a
        maximum of 4 skeletons
+ Sapper: removed cap on sapped
        enemies (previously 2 max)
+ Thief Mask: now activates
        before enemy equipment

Bug Fixes:
+ Fixed a bug where Assassin would
    target some balls immediately
    after they spawn
+ Fixed a bug where you could get
    some achievements in Versus
    Mode by rejoining before
    victory

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.2.1 -

Changes
+ Minor improvements to how stats
    and info boxes are shown before
    and after the battle

Balance Changes
+ Assassin: execute threshold
            [r]2/3/4[/r] -> [r]1/2/3[/r]
+ Bandaid: effect is now applied
    at death, meaning it is now
    affected by Mechanic, Thief
    Mask, etc.
+ Gladiator: no longer gives dmg
    bonus, now gains a Shield on
    the first [grey]1/2/3[/grey] kills
+ Mechanic: no longer gives
    "useless" equipment
    (e.g. Hyper Driver)
+ VIP Ticket: now a Tier 3 item

Bug Fixes:
+ Fixed a bug where the equipment
    stolen by Thief Mask would
    return to the enemy if the
    recipient died
+ Fixed a bug where you could join
    a Versus Mode game as both
    sides from the same browser

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.2.0 -

[pg]Versus Mode[/] BETA is here! Play 1v1 against a friend!

[pg]5[/] new balls!
[pg]2[/] new items!
[pg]2[/] new achievements!

Major Changes
+ The shop ball distribution is now
    slightly skewed, making it more
    likely to get higher tier balls
    as the game progresses
+ In Shop Tier 3+, at least one
    Tier 3+ ball is guaranteed on
    every stock/restock
+ All equipment with "On Enter
    Battle" conditions will now
    activate if equipped during
    battle
+ Two achievements have been
    balanced to be slightly easier:
    + [grey]<lte>2 balls[/grey] -> [grey]<lte>3 balls[/grey]
    + [grey][r]8<sword>[/r] [pg]8<heart>[/pg] squad[/grey] -> [grey][r]7<sword>[/r] [pg]7<heart>[/pg] squad[/grey]
+ Detail box now differentiates
    between Balls, Items, and
    Equipments
+ Added a link to the wiki in the
    main menu

Balance Changes
+ 8-Ball: [r]1<sword>[/r] [pg]2<heart>[/pg] -> [r]1<sword>[/r] [pg]3<heart>[/pg]
+ Ball of Ice: [r]2<sword>[/r] [pg]3<heart>[/pg] -> [r]3<sword>[/r] [pg]4<heart>[/pg],
            buff amount
            [grey]1/1.5/2[r]<sword>[/r][pg]<heart>[/pg][/grey] -> [grey]1/2/3[r]<sword>[/r][pg]<heart>[/pg][/grey]
            now grants buff to a
            random frozen shop ball
+ Bio-Grenade: toxic cloud lasts
    twice as long (0.5s -> 1s)
+ Coin: [r]1<sword>[/r] [pg]2<heart>[/pg] -> [r]1<sword>[/r] [pg]3<heart>[/pg]
+ Leech: increased aura radius
+ Mechanic: equipments given
            [grey]1/2/3/4[/grey] -> [grey]2/2/2/3[/grey],
            can give equipment even
            after the battle starts
+ Ninja: spikes now change target
            should their target die
+ Powerball: [r]1<sword>[/r] [pg]2<heart>[/pg] -> [r]1<sword>[/r] [pg]3<heart>[/pg]
+ Psychic: hits required to break
            lock now stacks with
            multiple Psychics
+ Smoke Bomb: explosion damage
            [r]3x<sword>[/r] -> [r]2x<sword>[/r],
            slightly decreased
            explosion radius
+ Sniper: no longer attacks balls
            buffed immediately at
            the start of battle
            (e.g. Vampire)
+ Spiker: [r]2<sword>[/r] [pg]6<heart>[/pg] -> [r]1<sword>[/r] [pg]6<heart>[/pg]
+ Trainer: buff is now instant
+ Vagrant: items taken from shop
            [grey]1/1/1[/grey] -> [grey]1/2/3[/grey],
            no longer requires gold

Bug Fixes
+ Fixed exploit where you could
    push balls across the mid line
    during the shop phase
+ Fixed bug where Bounty would give
    gold even if equipped by an
    enemy
+ Fixed issue where Snowball could
    get stuck on the center ring

There is more to come in 1.2!
Stay tuned! :)

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- Auto Balls v1.1.1 -

Major Changes
+ Each team may only have at most
    25 balls in the battle at once
+ Many balls' abilities now
    activate when entering a battle
    (e.g. summoned) instead of only
    at battle start
+ Fixed a bug where game options
    (e.g. volume) were not saved
+ Decreased loading time
+ Improved matchmaking :)

Balance Changes
+ Ball of Ice: [r]3<sword>[/r] [pg]3<heart>[/pg] -> [r]2<sword>[/r] [pg]3<heart>[/pg],
            damage and health buff
            [grey]1/2/3[r]<sword>[/r][pg]<heart>[/pg][/grey] -> [grey]1/1.5/2[r]<sword>[/r][pg]<heart>[/pg][/grey]
+ Bio-Grenade: NEW ABILITY!
+ Buffer: "On battle start"
            -> "On enter battle"
+ Death Star: ability no longer
            activates from other
            Death Stars
+ Green Crystal Ball:
            [r]1<sword>[/r] [pg]3<heart>[/pg] -> [r]1<sword>[/r] [pg]4<heart>[/pg]
+ Mechanic: "On battle start"
            -> "On enter battle"
+ Ninja: "On battle start"
            -> "On enter battle",
            spikes shot
            [grey]1/2/3[/grey] -> [grey]2/3/4[/grey]
+ Sapper: "On battle start"
            -> "On enter battle"
+ Smoke Bomb: "On battle start"
            -> "On enter battle"
+ Snowball: time to fully grow
            [grey]8[/grey] -> [grey]10[/grey] seconds
+ Spiker: spikes shot per hit
            [grey]2/4/6[/grey] -> [grey]2/3/4[/grey]
            spike damage
            [r]1/1/1[/r] -> [r]1/1.25/1.5[/r]
+ Splinter: spikes shot
            [grey]1/2/3[/grey] -> [grey]2/3/4[/grey]
+ Spore: extra damage per hit
            [r]3<sword>[/r] -> [r]1<sword>[/r]
+ Toxic Fungus: NEW ABILITY!
+ Vagrant: now takes UNFROZEN items
            only

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
`
- AUTO BALLS v1.1 -

[pg]14[/] new balls!
[pg]8[/] new items!
A brand new tier, [pg]Tier 3+[/]!
[pg]14[/] new achievements! Go get those
unlocks!

Major Changes
+ [pb]Freezing[/pb] is here!! Right-click on
    a shop ball to keep it around!
+ Removed the Thief ball. Added the
    Thief Mask item.
+ The arena now starts to shrink
    after a while to avoid
    unnecessary timeouts.
+ Did you win? Your squad will get
    a little [dgold][offsetx -3]<crown>[/offsetx][/dgold]crown so everyone
    knows they're battling a
    champion! :)
+ Removed loading tip "A squad of
    five is always better than a
    squad of four"\\ \\ @AyumiDev >_>
+ Updated some descriptions to be
    more accurate
+ Added a list of Portugese bad
    words to the profanity filter
+ Updated the localization files
+ Removed Herobrine

Balance Changes
  + Buffer: damage buff
            [r]2/3/4<sword>[/r] -> [r]2/4/6<sword>[/r]
  + Cat Ears: they're now free??
  + Coin:   [r]1<sword>[/r] [pg]3<heart>[/pg] -> [r]1<sword>[/r] [pg]2<heart>[/pg],
            now tracks total sell
            value instead of extra
  + Crown:  [r]4<sword>[/r] [pg]4<heart>[/pg] -> [r]6<sword>[/r] [pg]6<heart>[/pg],
            bonus stars
              0/1/2[gold]<star>[/gold] -> 1/2/3[gold]<star>[/gold],
            moved to Tier 3+,
            when replaced, keeps
            its original health
            and damage
  + Crusher: damage gain
            [r]1/2/3<sword>[/r] -> [r]1/1.5/2<sword>[/r]
  + Crystal Ball: [r]1<sword>[/r] [pg]3<heart>[/pg] -> [r]2<sword>[/r] [pg]4<heart>[/pg]
            moved to Tier 2,
            weaker versions appear
            in Tier 1
  + Gacha Ball: spawned ball stats
            [grey]1/2/3[r]<sword>[/r][pg]<heart>[/pg][/grey] -> [grey]2/3/4[r]<sword>[/r][pg]<heart>[/pg][/grey]
            no longer spawns
            useless balls
            (Coin, Crown, etc.)
  + Healer: increased heal radius,
            increased heal rate
            [pg]1/1.5/2<heart>[/pg] -> [pg]1.5/2/2.5<heart>[/pg]
  + Necromancer: skeleton damage
            [r]2<sword>[/r] -> [r]1<sword>[/r]
  + Pickleball: [r]2<sword>[/r] [pg]2<heart>[/pg] -> [r]2<sword>[/r] [pg]1<heart>[/pg]
            now creates pickles
            equal to the current
            round (max 6)
  + Powerball: [r]2<sword>[/r] [pg]2<heart>[/pg] -> [r]1<sword>[/r] [pg]2<heart>[/pg]
  + Sapper: enemies sapped
            [grey]1/1/2[/grey] -> [grey]1/2/2[/grey]
  + Spiker: spikes shot per hit
            [grey]1/2/3[/grey] -> [grey]2/4/6[/grey]
  + Trainer: [r]3<sword>[/r] [pg]4<heart>[/pg] -> [r]5<sword>[/r] [pg]7<heart>[/pg]
            moved to Tier 3+,
            removed health buff
  + Turret: increased bullet speed,
            reduced wind up time
  + Vampire: [r]2<sword>[/r] [pg]2<heart>[/pg] -> [r]4<sword>[/r] [pg]4<heart>[/pg],
            moved to Tier 3+
`];

namespace PatchNotes {
    export function formatNotes(notes: string) {
        let lines = notes.split('\n');
        lines.shift();

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let newLine = line.trim();
            if (newLine.startsWith('+')) {
                newLine = '<bullet>' + newLine.substring(1);
            }
            while (line.startsWith(' ')) {
                line = line.substring(1);
                newLine = '\\ ' + newLine;
            }
            lines[i] = newLine;
        }

        return lines.join('\n');
    }
}

const PATCH_NOTES = PATCH_NOTES_INT.map(PatchNotes.formatNotes);