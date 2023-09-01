class LiveVersion {
    static hasLoaded = false;
    static BDAY: boolean;
    static APRIL_FOOLS: boolean;
    static ALMANAC_EXPERTS: string[];
    static DAILY_SCHEDULE: string[];

    static get BDAY_VS() { return this.BDAY; }

    static load() {
        API.getliveversion((response, err) => {
            if (response) {
                this.BDAY = response.bday;
                this.APRIL_FOOLS = response.aprilFools;
                this.ALMANAC_EXPERTS = response.almanacExperts;
                this.DAILY_SCHEDULE = response.dailySchedule;
            } else {
                this.BDAY = false;
                this.APRIL_FOOLS = false;
                this.ALMANAC_EXPERTS = [];
                this.DAILY_SCHEDULE = ["Anything is possible!"];
            }
            this.hasLoaded = true;
        });
    }
}