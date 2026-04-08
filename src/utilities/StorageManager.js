import validator from "validator";

class StorageManager {
    _isObjectAndValid(args) {
        /*
            NOTE: This should never be used outside of any StorageManager class/subclass.

            Treat it as protected/private to this file.
        */
        if (typeof args === "object" && args !== null && !Array.isArray(args)) {
            if (Object.keys(args).length > 0) {
                for (const [key, value] of Object.entries(args)) {
                    if (value) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    set(obj, key, value) {
        try {
            this._isObjectAndValid(obj);
        } catch (exception) {
            return exception;
        }

        if (validator.isEmpty(key)) {
            throw new Error(`Invalid key argument: ${key}`);
        }

        if (validator.isEmpty(value)) {
            throw new Error(`Invalid value argument: ${value}`);
        }

        return obj;
    }
}

export class LocalStorageManager extends StorageManager {
    get(key) {
        if (validator.isEmpty(key)) {
            throw new Error(`Invalid key argument: ${key}`);
        }

        const obj = localStorage.getItem(key);

        if (obj) {
            return JSON.parse(obj);
        }

        throw new Error(`No object found for key: ${key}`);
    }

    store(id, obj) {
        try {
            this._isObjectAndValid(obj);
        } catch (exception) {
            return exception;
        }

        localStorage.setItem(id, JSON.stringify(obj));
    }

    delete(key) {
        if (validator.isEmpty(key)) {
            throw new Error(`Invalid key: ${key}`);
        }

        localStorage.removeItem(key);
    }
}

export class SessionStorageManager extends StorageManager {
    get(key) {
        if (validator.isEmpty(key)) {
            throw new Error(`Invalid key argument: ${key}`);
        }

        const obj = sessionStorage.getItem(key);

        if (obj) {
            return JSON.parse(obj);
        }

        throw new Error(`No object found for key: ${key}`);
    }

    store(obj) {
        try {
            this._isObjectAndValid(obj);
        } catch (exception) {
            return exception;
        }

        sessionStorage.setItem(obj.id, JSON.stringify(obj));
    }

    delete(key) {
        if (validator.isEmpty(key)) {
            throw new Error(`Invalid key: ${key}`);
        }

        sessionStorage.removeItem(key);
    }
}
