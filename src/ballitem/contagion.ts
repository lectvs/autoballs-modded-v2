namespace BallItems {
    export class Contagion extends EquipmentItem {
        getName() { return 'Contagion'; }
        getDesc() { return `At the start of battle, give nearby allies [dg]Infection equipments[/dg]\n\nInfected balls summon Skeletons on death`; }

        constructor(x: number, y: number) {
            super(x, y, 'items/contagion', 32);
        }
    }
}