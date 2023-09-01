class CloudSave {
    static hasLoaded = false;

    static load() {
        let saveInfo = getSaveInfo();
        if (!saveInfo) {
            debug('No save info specified, skipping load from cloud');
            this.hasLoaded = true;
            return;
        }
    
        
    }

    static save() {
        let saveId = getSaveInfo()?.saveId;
        if (!saveId) {
            console.error('Error saving to cloud: No save id');
            return;
        }

        
    }
}