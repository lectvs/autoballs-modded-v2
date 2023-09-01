namespace Parts {
    const COMMON_CONFIG: PhysicsWorldObject.Config = {
        layer: Battle.Layers.walls,
        physicsGroup: Battle.PhysicsGroups.walls,
        immovable: true,
    }

    export function circle(x: number, y: number, radius: number) {
        return new PhysicsWorldObject({
            x, y,
            bounds: new CircleBounds(0, 0, radius),
            ...COMMON_CONFIG
        });
    }

    export function rect(x: number, y: number, width: number, height: number) {
        return new PhysicsWorldObject({
            x, y,
            bounds: new RectBounds(0, 0, width, height),
            ...COMMON_CONFIG
        });
    }

    export function slope(x: number, y: number, width: number, height: number, direction: SlopeBounds.Direction) {
        return new PhysicsWorldObject({
            x, y,
            bounds: new SlopeBounds(0, 0, width, height, direction),
            ...COMMON_CONFIG
        });
    }

    export function trapezoidV(x: number, y: number, topWidth: number, bottomWidth: number, height: number) {
        if (topWidth === bottomWidth) return rect(x, y, topWidth, height);
        let result = new WorldObject({ x, y });
        result.addChild(rect(Math.abs(topWidth - bottomWidth)/2, 0, Math.min(topWidth, bottomWidth), height));
        result.addChild(slope(0, 0, Math.abs(topWidth - bottomWidth)/2, height, topWidth > bottomWidth ? 'downleft' : 'upleft'));
        result.addChild(slope(Math.min(topWidth, bottomWidth) + Math.abs(topWidth - bottomWidth)/2, 0, Math.abs(topWidth - bottomWidth)/2, height, topWidth > bottomWidth ? 'downright' : 'upright'));
        return result;
    }

    export function trapezoidH(x: number, y: number, leftHeight: number, rightHeight: number, width: number) {
        if (leftHeight === rightHeight) return rect(x, y, width, leftHeight);
        let result = new WorldObject({ x, y });
        result.addChild(rect(0, Math.abs(leftHeight - rightHeight)/2, width, Math.min(leftHeight, rightHeight)));
        result.addChild(slope(0, 0, width, Math.abs(leftHeight - rightHeight)/2, leftHeight > rightHeight ? 'upright' : 'upleft'));
        result.addChild(slope(0, Math.min(leftHeight, rightHeight) + Math.abs(leftHeight - rightHeight)/2, width, Math.abs(leftHeight - rightHeight)/2, leftHeight > rightHeight ? 'downright' : 'downleft'));
        return result;
    }
}