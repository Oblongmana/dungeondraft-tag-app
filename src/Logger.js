class _Logger {

    constructor() {
        this.ENABLE_LOGGING = false;
    }

    log() {
        if (this.ENABLE_LOGGING) {
            console.log.apply(null, arguments);
        }
    }

    time() {
        if (this.ENABLE_LOGGING) {
            console.time.apply(null, arguments);
        }
    }

    timeEnd() {
        if (this.ENABLE_LOGGING) {
            console.timeEnd.apply(null, arguments);
        }
    }
}

const Logger = new _Logger();
export default Logger;