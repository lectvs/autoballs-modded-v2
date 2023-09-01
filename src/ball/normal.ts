namespace Balls {
    export class Normal extends Ball {
        getName() { return this.team === 'neutral' ? 'Neutral Ball' : 'Basic Ball'; }
        getDesc() { return this.team === 'neutral' ? 'Attacks both teams' : 'No effect :('; }

        constructor(config: Ball.Config) {
            super('balls/normal', 8, config);
        }
    }
}