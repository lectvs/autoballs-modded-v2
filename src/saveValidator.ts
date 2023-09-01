namespace SaveValidator {
    var lastCloudLockSessionId: string;
    export function storeLastCloudLockSessionId() {
        debug('getting last lockSessionId...');
        lastCloudLockSessionId = undefined;

        let saveInfo = getSaveInfo();

        if (!saveInfo) {
            debug('No cloud save active, fetching from local');
            let data = loadAllData();
            if (!data) {
                debug('No local lock found');
                return;
            }
            lastCloudLockSessionId = getLockSessionIdFromData(data);
            debug('Set lastCloudLockSessionId:', lastCloudLockSessionId);
            return;
        }

        
    }

    export function validateAsync() {
        debug('validating...');
        let saveInfo = getSaveInfo();

        if (!saveInfo) {
            let data = loadAllData();
            if (!data) return;
            let valid = isDataValid(data);
            enforceValidation(valid);
            return;
        }

        
    }

    function isDataValid(data: AutoBallsData) {
        let fetchedLockSessionId = getLockSessionIdFromData(data);

        if (!fetchedLockSessionId) return true;

        if (fetchedLockSessionId === lockSessionId) {
            lastCloudLockSessionId = lockSessionId;
        }
        
        if (fetchedLockSessionId !== lockSessionId) {
            if (fetchedLockSessionId === lastCloudLockSessionId) {
                debug('fetched data matches lastCloudLockSessionId:', fetchedLockSessionId);
            } else {
                debug('fetched data lockSessionId is from another session', fetchedLockSessionId);
                return false;
            }
        }

        return true;
    }

    function enforceValidation(valid: boolean) {
        if (valid) {
            debug('data is valid');
            return;
        }

        debug('data is invalid!');

        global.theater.runScript(function*() {
            let syncing = global.theater.addWorldObject(new SpriteText({
                x: global.gameWidth/2, y: global.gameHeight/2,
                text: '\\ Syncing...',
                anchor: Vector2.CENTER,
                alpha: 0,
            }));

            yield [
                S.fadeOut(1),
                S.tween(1, syncing, 'alpha', 0, 1),
            ];

            yield S.wait(1);

            CloudSave.load();

            yield [
                S.tween(0.5, syncing, 'alpha', 1, 0),
            ];

            yield S.wait(0.5);

            global.game.loadMainMenu();
        });
    }

    function getLockSessionIdFromData(data: AutoBallsData) {
        if (DAILY) {
            return data?.dailyGameData?.matchmakingGameData?.lock?.lockSessionId;
        }

        if (CHALLENGE_MODE_ENABLED) {
            return data?.challengeModeGameData?.lock?.lockSessionId;
        }

        return data?.matchmakingGameData?.lock?.lockSessionId;
    }

    export class Obj extends WorldObject {
        constructor() {
            super({
                useGlobalTime: true,
            });

            this.runScript(function*() {
                yield S.wait(20);
                SaveValidator.validateAsync();

                let interval = getSaveInfo() ? 20 : 5;

                while (true) {
                    yield S.wait(interval);
                    SaveValidator.validateAsync();
                }
            });
        }
    }
}