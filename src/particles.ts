function getParticleLevel() {
    return IS_MOBILE ? 0.5 : 1;
}

function newPuff(x: number, y: number, layer: string, type: 'small' | 'medium') {
    let radius = { 'small': 2, 'medium': 4 }[type];
    let maxLife = { 'small': 0.4, 'medium': 0.5 }[type];
    return new BurstPuffSystem({
        x: x, y: y,
        layer: layer,
        puffCount: Math.floor(10 * getParticleLevel()),
        puffConfigFactory: () => ({
            maxLife: maxLife,
            v: Random.inCircle(70),
            color: 0xFFFFFF,
            radius: radius,
            finalRadius: 0,
        }),
    });
}

function newBdayPuff(x: number, y: number, layer: string, type: 'small' | 'medium') {
    let radius = { 'small': 2, 'medium': 4 }[type];
    let maxLife = { 'small': 0.6, 'medium': 1 }[type];
    return new BurstPuffSystem({
        x: x, y: y,
        layer: layer,
        puffCount: Math.floor(10 * getParticleLevel()),
        puffConfigFactory: () => ({
            maxLife: maxLife,
            v: Random.inCircle(70),
            color: Random.element([0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFFFFF]),
            radius: radius,
            finalRadius: 0,
        }),
    });
}