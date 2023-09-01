namespace BallItems {
    export class ProtectionBubble extends EquipmentItem {
        getName() { return 'Protection Bubble'; }
        getDesc() { return `Take 50% less damage, but deal none on collision`; }
        getCredits() { return [CreditsNames.MATERWELONS]; }

        constructor(x: number, y: number) {
            super(x, y, 'items/protectionbubble', 29);
        }
    }
}