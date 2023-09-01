const Cheat = {
    win: function() {
        global.world.removeWorldObjects(global.world.select.typeAll(Ball).filter(ball => ball.team === 'enemy'));
    },
    lose: function() {
        global.world.removeWorldObjects(global.world.select.typeAll(Ball).filter(ball => ball.team === 'friend'));
    },
    draw: function() {
        global.world.removeWorldObjects(global.world.select.typeAll(Ball));
    },
    victory: function() {
        GAME_DATA.wins=7;
        Cheat.win();
    },
    gameover: function() {
        GAME_DATA.health=1;
        Cheat.lose();
    },
    invincible: function() {
        global.world.select.typeAll(Ball).forEach(ball => ball.hp = ball.maxhp = 10000);
    },
    reset: function() {
        global.world.select.typeAll(Ball).forEach(ball => ball.hp = ball.maxhp = 6);
    },
    round: function(r: number) {
        GAME_DATA.round = r;
        GAME_DATA.gold = 100;
    },
}

Object.defineProperty(window, 'GOLD', {
    get: () => GAME_DATA.gold,
    set: v => GAME_DATA.gold = v,
});

Object.defineProperty(window, 'ROUND', {
    get: () => GAME_DATA.round,
    set: v => GAME_DATA.round = v,
});