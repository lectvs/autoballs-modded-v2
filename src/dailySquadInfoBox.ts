class DailySquadInfoBox extends Sprite {
    private currentEntry: number;
    private squadWorld: YourTeamWorld;
    private floatTimer: Timer;

    currentText: SpriteText;

    enabled = true;
    
    constructor(private maskBounds: Rect) {
        super({
            useGlobalTime: true,
            visible: false,
        });

        this.currentEntry = -1;
        this.squadWorld = this.addChild(new YourTeamWorld(new World()));

        this.floatTimer = new Timer(0.5, () => this.setVisible(true));
    }

    update() {
        super.update();

        let mouseBounds = this.world.getWorldMouseBounds();

        let objects = G.rectContainsPt(this.maskBounds, mouseBounds)
                        ? this.world.select.typeAll(SpriteText).filter(obj => obj.data.bounds && mouseBounds.isOverlapping(obj.data.bounds))
                        : [];
        let closestObject = M.argmin(objects, obj => {
            let bounds = (obj.data.bounds as Bounds).getBoundingBox();
            let midpoint = vec2(bounds.x + bounds.width/2, bounds.y + bounds.height/2);
            return G.distance(midpoint, mouseBounds);
        });

        this.currentText = closestObject;

        let entry = this.enabled ? closestObject?.data?.entry : -1;
        let squad = closestObject?.data?.squad as Squad;

        if (entry >= 0) {
            if (entry !== this.currentEntry) {
                this.currentEntry = entry;
                this.squadWorld.kill();
                if (squad) {
                    this.squadWorld = this.addChild(createTeamWorld(squad, 100, false));
                    this.squadWorld.localx = -this.squadWorld.containedWorld.width/2;
                    this.squadWorld.localy = -100;
                    this.squadWorld.alpha = 1;
                    this.squadWorld.containedWorld.update();
                } else {
                    this.squadWorld = this.addChild(new YourTeamWorld(new World()));
                }
            }

            let width = squad ? 52 + 32*(squad.balls.length-1) : 180;
            if (squad.balls.length === 3) width = 180;
            if (squad.balls.length === 2) width = 116;
            let height = 60;
            this.setTexture(InfoBox.getTextureForSize(width, height));

            let extraMove = IS_MOBILE ? 20 : 0;
            
            this.x = mouseBounds.x + width/2 - 10;
            this.y = mouseBounds.y - height/2 - 10 - extraMove;

            this.floatTimer.update(this.delta);
        } else if (!IS_MOBILE || Input.justDown('click')) {
            this.setVisible(false);
            this.floatTimer.reset();
        }

        this.keepOnScreen();
    }

    postUpdate(): void {
        super.postUpdate();
        World.Actions.moveWorldObjectToFront(this);
        World.Actions.moveWorldObjectToFront(this.squadWorld);
    }

    private keepOnScreen() {
        let width = this.getTexture().width;
        let height = this.getTexture().height;
        this.x = M.clamp(this.x, width/2, global.gameWidth - width/2);
        this.y = M.clamp(this.y, height/2, global.gameHeight - height/2);
    }
}