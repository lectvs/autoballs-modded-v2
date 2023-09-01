class SquadViewerMenu extends Menu {
    gameid: string;
    round: number;
    yourTeamWorld: YourTeamWorld;
    roundText: SpriteText;

    private cache: DictNumber<API.SquadData>;

    constructor(gameid: string, round: number = 1) {
        super({
            backgroundColor: 0x808080,
            volume: 1,
        });

        this.gameid = gameid;
        this.round = round;
        this.roundText = this.addWorldObject(new SpriteText({
            x: this.width/2, y: this.height/2 - 50,
            anchor: Vector2.CENTER,
            update: () => {
                this.roundText.setText(`Round ${this.round}`);
            },
        }));

        this.cache = {};

        this.updateForCurrentRound();

        this.addWorldObject(new WorldObject({
            update: () => {
                if (Input.justDown('left')) {
                    this.round = Math.max(this.round-1, 1);
                    this.updateForCurrentRound();
                } else if (Input.justDown('right')) {
                    this.round = this.round+1;
                    this.updateForCurrentRound();
                }
            }
        }));

        global.game.stopMusic();
    }

    private updateForCurrentRound() {
        let round = this.round;

        if (round in this.cache) {
            this.updateYourTeamWorldWithSquad(this.cache[round]);
            return;
        }

        API.getsquadforgame((squad, err) => {
            if (err) {
                console.error(err);
                this.yourTeamWorld?.kill();
                return;
            }

            console.log('got squad', squad);
            this.cache[round] = squad;
            this.updateYourTeamWorldWithSquad(squad);
        }, this.gameid, round);
    }

    private updateYourTeamWorldWithSquad(squad: API.SquadData) {
        if (this.yourTeamWorld) {
            this.yourTeamWorld.kill();
        }

        this.yourTeamWorld = this.addWorldObject(createTeamWorld(squad.squad, this.height/2));
        this.yourTeamWorld.alpha = 1;
    }
}