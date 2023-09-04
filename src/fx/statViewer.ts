namespace StatViewer {
    export type Type = {
        type: 'damage';
        getDamage: () => number;
    } | {
        type: 'heal';
        getHealth: () => number;
    } | {
        type: 'buff';
        getDmg: () => number;
        getHp: () => number;
    }
}

class StatViewer extends SpriteText {
    constructor(private statType: StatViewer.Type, ox: number, oy: number) {
        super({
            x: ox, y: oy,
            text: StatViewer.getText(statType),
            font: 'smallnumbers',
            anchor: Vector2.CENTER,
            effects: { outline: {} },
            copyFromParent: ['layer'],
        });
    }

    postUpdate(): void {
        super.postUpdate();

        if (this.shouldShow()) {
            this.setVisible(true);
            this.setText(StatViewer.getText(this.statType));
            World.Actions.moveWorldObjectToFront(this);
        } else {
            this.setVisible(false);
        }
    }

    private shouldShow() {
        if (getBattleState(this.world) === Ball.States.PREP) return false;
        let battleSpeedController = global.theater?.select?.type(BattleSpeedController, false);
        if (!battleSpeedController) return false;
        return battleSpeedController.paused || battleSpeedController.endOfGame;
    }
}

namespace StatViewer {
    export function getText(statType: StatViewer.Type) {
        if (statType.type === 'damage') return `[r]${getNumberText(statType.getDamage())}[/r]`;
        if (statType.type === 'heal') return `[g]${getNumberText(statType.getHealth())}[/g]`;
        if (statType.type === 'buff') {
            let dmg = statType.getDmg();
            let hp = statType.getHp();
            if (dmg === 0 && hp === 0) return '';
            if (dmg === 0) return `[g]${getNumberText(statType.getHp())}[/g]`;
            if (hp === 0) return `[r]${getNumberText(statType.getDmg())}[/r]`;
            return `[r]${getNumberText(statType.getDmg())}[/r] [offsetx -1][g]${getNumberText(statType.getHp())}[/g][/]`;
        }
        return '';
    }

    function getNumberText(num: number) {
        let text = Math.round(num) === num ? `${num}` : `${num.toFixed(1)}`;
        let parts = text.split('.');
        if (parts.length === 2) {
            text = `[offsetx 1]${parts[0]}[/].[offsetx -1]${parts[1]}[/]`;
        }
        return text;
    }
}