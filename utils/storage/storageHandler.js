const moment = require('moment');
const qdCache = require('qdcache');
const { MongoBoard } = require('../../models/boardStore');
const { deepClone } = require('../common');

class storageHandler {
    constructor() {
        if (!storageHandler.instance) {
            this._data = new Map;
            this._clearCache = setInterval(async () => {
                await this._prune();
            }, 5000);
            this._updateCache = new Map;
            this._updateCacheAction = setInterval(async () => {
                await this._store();
            }, 1000);
            storageHandler.instance = this;
        }
        return storageHandler.instance;

    }
    async get(tag) {
        let store = qdCache.get(tag);
        if (!store) {
            store = await MongoBoard.checkBoard(tag);
            if (!store) {
                return null;
            }
            return store.board;
        }
        return store;
    }
    async set(tag, data) {
        this._updateCache.set(tag, deepClone(data));
        qdCache.set(tag, data);
        this._data.set(tag, new Date());
    }
    async _prune() {
        this._data.forEach(async (val, key) => {
            const time = moment().diff(val, 'minutes');
            if (time >= 30) {
                this._data.delete(key);
                qdCache.delete(key);
                await MongoBoard.deleteOne({ tag: key });
            }
        });
    }
    async _store() {
        this._updateCache.forEach(async (val, key) => {
            let store = await MongoBoard.checkBoard(key);
            if (!store) {
                const board = new MongoBoard({
                    tag: key,
                    board: val,
                });
                await board.save();
                store = await MongoBoard.checkBoard(key);
            }
            store.board = val;
            await store.save();
            this._updateCache.delete(key);
        });
    }
}
const instance = new storageHandler();
Object.freeze(instance);

module.exports = instance;