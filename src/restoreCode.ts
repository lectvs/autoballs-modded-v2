class RestoreCode extends WorldObject {
    private lastFour: string;

    constructor() {
        super();

        this.lastFour = "xxxx";
    }

    update(): void {
        super.update();

        for (let n = 0; n <= 9; n++) {
            if (Input.justDown(`${n}`)) {
                this.pushChar(`${n}`);
            }
        }

        if (Input.justDown('ach_cheat')) {
            this.pushChar('p');
        }

        if (this.lastFour === 'p'+'6'+'6'+'8') {
            unlockAllAchievements();
            this.kill();
        }

        if (this.lastFour === 'p'+'8'+'9'+'6') {
            seeAllAlmanacEntries();
            this.kill();
        }

        if (this.lastFour === 'p'+'7'+'0'+'6') {
            restoreCompleteAlmanac();
            this.kill();
        }
        
        if (this.lastFour === 'p'+'9'+'6'+'9') {
            unlockAllAchievements();
            restoreCompleteAlmanac();
            this.kill();
        }
    }

    private pushChar(char: string) {
        this.lastFour = this.lastFour.substring(1, 4) + `${char}`;
    }
}