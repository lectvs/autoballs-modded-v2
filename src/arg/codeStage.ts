namespace ARG.Stages {
    export function CODE() {
        let world = ARG.Stages.BASE_INNER_STAGE(1);

        world.onTransitioned = function() {
            global.theater.playCutscene(ARG.Cutscenes.ARG3_GET_CODE);
        }

        return world;
    }
}