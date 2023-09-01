class Weekly {
    static hasLoaded = false;
    static LIVE_WEEK: number;
    private static LAST_FETCHED: number;

    static load(callbacks: { onSuccess: () => void, onError: () => void }) {
        let now = Date.now();
        if (this.LIVE_WEEK > 0 && this.LAST_FETCHED > 0 && now - this.LAST_FETCHED < 300000) {  // Five minutes
            callbacks.onSuccess();
            return;
        }

        API.getweekly((response, error) => {
            if (!error && response && response.week !== undefined) {
                this.set(response.week);
                callbacks.onSuccess();
                return;
            }

            console.error("Failed to get weekly: ", error);
            callbacks.onError();
        });
    }

    static set(week: number) {
        this.LIVE_WEEK = week;
        this.LAST_FETCHED = Date.now();
        this.hasLoaded = true;
    }
}