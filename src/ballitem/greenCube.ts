namespace BallItems {
    export class GreenCube extends EquipmentItem {
        getName() { return 'Green Cube'; }
        getDesc() { return `The equipped ball's abilities have a 33% chance of activating twice`; }
        getCredits() { return [CreditsNames.C_RRY]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/greencube', 34);
        }

        canApplyToBall(ball: Ball): boolean {
            return !_.contains(GreenCube.INVALID_BALL_TYPES, ball.properties.type);
        }

        static INVALID_BALL_TYPES = [
            0,   // Normal
            25,  // Crown
            45,  // Gladiator
            46,  // Vanguard

            110,  // Zoomer
            127,  // Dove
            136,  // Crown
            143,  // Bowling Ball
        ];
    }
}