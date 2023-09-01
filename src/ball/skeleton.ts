namespace Balls {
    export class Skeleton extends Ball {
        getName() { return 'Skeleton'; }
        getDesc() { return 'No effect'; }

        constructor(config: Ball.Config) {
            super('balls/skeleton', 8, config);
        }
    }
}