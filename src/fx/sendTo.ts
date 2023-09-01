function sendTo(time: number, obj: WorldObject, point: Pt, startVelocity: Vector2): Script.Function {
    return S.doOverTime(time, t => {
        let timescale = global.world ? global.world.timeScale : 1;
        let dx = M.lerp(startVelocity.x * global.script.delta, point.x - obj.x, Tween.Easing.InExp(t));
        let dy = M.lerp(startVelocity.y * global.script.delta, point.y - obj.y, Tween.Easing.InExp(t));
        obj.x += dx * timescale;
        obj.y += dy * timescale;
    });
}