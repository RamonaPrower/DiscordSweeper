const moment = require('moment');

class connectionChecker {
    constructor() {
        if (!connectionChecker.instance) {
            this._gameStore = new Map;
            this._clearCache = setInterval(() => {
                this._prune();
            }, 5000);
            connectionChecker.instance = this;
        }
        return connectionChecker.instance;

    }
    get(id) {
        const store = this._gameStore.get(id);
        if (!store) {
            return null;
        }
        return store;
    }
    set(id) {
        this._gameStore.set(id, new Date());
    }
    del(id) {
        this._gameStore.delete(id);
    }
    _prune() {
        this._gameStore.forEach((lastUpdated, id) => {
            const time = moment().diff(lastUpdated, 'seconds');
            if (time >= 30) {
                this._gameStore.delete(id);
            }
        });
    }
}
const instance = new connectionChecker();
Object.freeze(instance);

module.exports = instance;