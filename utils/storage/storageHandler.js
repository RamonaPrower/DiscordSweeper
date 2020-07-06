const moment = require('moment');
const qdCache = require('qdcache');

class storageHandler {
    constructor() {
        if (!storageHandler.instance) {
            this._data = new Map;
            this._clearCache = setInterval(() => {
                this._prune();
            }, 5000);
            storageHandler.instance = this;
        }
        return storageHandler.instance;

    }
    get(tag) {
        const store = qdCache.get(tag);
        if (!store) {
            return null;
        }
        return store;
    }
    set(tag, data) {
        qdCache.set(tag, data);
        this._data.set(tag, new Date());
    }
    _prune() {
        this._data.forEach((val, key) => {
            const time = moment().diff(val, 'minutes');
            if (time >= 30) {
                this._data.delete(key);
                qdCache.delete(key);
                console.log(`deleted session ${key} from connection cache`);
            }
        });
    }
}
const instance = new storageHandler();
Object.freeze(instance);

module.exports = instance;