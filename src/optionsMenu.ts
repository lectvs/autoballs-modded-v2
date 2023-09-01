function addOptionsMenu(world: World) {
    world.addWorldObjects(lciDocumentToWorldObjects('optionsmenu'));

    world.select.name<Sprite>('options').updateCallback = function() {
        this.angle = Math.sin(2*this.life.time) * 3;
    };

    let sfxVolumeLabel = world.select.name('sfxvolumelabel');
    let musicVolumeLabel = world.select.name('musicvolumelabel');

    world.addWorldObject(new OptionsSlider(sfxVolumeLabel.x, sfxVolumeLabel.y + 19, 96, 0, 1, () => Options.sfxVolume, value => Options.sfxVolume = value));
    world.addWorldObject(new OptionsSlider(musicVolumeLabel.x, musicVolumeLabel.y + 19, 96, 0, 1, () => Options.musicVolume, value => Options.musicVolume = value));

    let musicLabel = world.select.name('musiclabel');
    addOptionSetting(world, musicLabel.x + 4, musicLabel.y + 16, ['Themed', 'Random', 'Side A', 'Side B'], '', () => getMusicType(), v => setMusicType(v as MusicType));

    let profanitycheckmark = world.select.name<Sprite>('profanitycheckmark');
    profanitycheckmark.updateCallback = function() {
        this.setVisible(getAllowProfaneSquadNames());
    };
    profanitycheckmark.setVisible(getAllowProfaneSquadNames());
    world.select.name('profanitycheckbox').addModule(new Button({
        hoverTint: 0xFFFF00,
        clickTint: 0xBBBB00,
        onJustHovered: function() {
            juiceButton(2).apply(this);
            juiceObject(profanitycheckmark, 2);
        },
        onClick: function() {
            global.game.playSound('click');
            setAllowProfaneSquadNames(!getAllowProfaneSquadNames());
            juiceButton(2).apply(this);
            juiceObject(profanitycheckmark, 2);
        },
    }));

    let fasttransitionscheckmark = world.select.name<Sprite>('fasttransitionscheckmark');
    fasttransitionscheckmark.updateCallback = function() {
        this.setVisible(getFastBattleTransitions());
    };
    fasttransitionscheckmark.setVisible(getFastBattleTransitions());
    world.select.name('fasttransitionscheckbox').addModule(new Button({
        hoverTint: 0xFFFF00,
        clickTint: 0xBBBB00,
        onJustHovered: function() {
            juiceButton(2).apply(this);
            juiceObject(fasttransitionscheckmark, 2);
        },
        onClick: function() {
            global.game.playSound('click');
            setFastBattleTransitions(!getFastBattleTransitions());
            juiceButton(2).apply(this);
            juiceObject(fasttransitionscheckmark, 2);
        },
    }));

    let fullscreencheckmark = world.select.name<Sprite>('fullscreencheckmark');
    fullscreencheckmark.updateCallback = function() {
        this.setVisible(Fullscreen.enabled);
    };
    fullscreencheckmark.setVisible(Fullscreen.enabled);
    world.select.name('fullscreencheckbox').addModule(new Button({
        hoverTint: 0xFFFF00,
        clickTint: 0xBBBB00,
        onJustHovered: function() {
            juiceButton(2).apply(this);
            juiceObject(fullscreencheckmark, 2);
        },
        onClick: function() {
            global.game.playSound('click');
            Fullscreen.toggleFullscreen();
            juiceButton(2).apply(this);
            juiceObject(fullscreencheckmark, 2);
        },
    }));

    let bigdraggingcheckmark = world.select.name<Sprite>('bigdraggingcheckmark');
    bigdraggingcheckmark.updateCallback = function() {
        this.setVisible(getBigDragging());
    };
    bigdraggingcheckmark.setVisible(getBigDragging());
    world.select.name('bigdraggingcheckbox').addModule(new Button({
        hoverTint: 0xFFFF00,
        clickTint: 0xBBBB00,
        onJustHovered: function() {
            juiceButton(2).apply(this);
            juiceObject(bigdraggingcheckmark, 2);
        },
        onClick: function() {
            global.game.playSound('click');
            setBigDragging(!getBigDragging());
            juiceButton(2).apply(this);
            juiceObject(bigdraggingcheckmark, 2);
        },
    }));

    if (IS_MOBILE) {
        world.removeWorldObject(world.select.name('fullscreencheckmark'));
        world.removeWorldObject(world.select.name('fullscreencheckbox'));
        world.removeWorldObject(world.select.name('fullscreenlabel'));
    } else {
        world.removeWorldObject(world.select.name('bigdraggingcheckmark'));
        world.removeWorldObject(world.select.name('bigdraggingcheckbox'));
        world.removeWorldObject(world.select.name('bigdragginglabel'));
    }
}