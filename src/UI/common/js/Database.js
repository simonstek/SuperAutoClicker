import * as Storage from "@storage"
import * as Env from "@env"
import * as Sciter from "@sciter"
import log from 'Logger'
import * as B from '/common/js/BrandConfig'
import * as sys from "@sys"
import {encode, decode} from "@sciter"

var N = NativeUtil

function o(str) {
    log(str, 'DB')
}

class MyDatabase {
    _storage = undefined

    constructor() {
        var self = this
        self.init()
    }

    getDbPath() {
        var dbDir = `${N.appDataPath()}/${B.ProcessName}`
        N.mkdir(dbDir)
        var db = `${dbDir}/${B.ProcessName}.db`
        // o(`dbPath: ${db}`)
        return db
    }

    init() {
        var self = this
        o('MyDatabase init')

        var db = self.getDbPath()
        var stat = sys.fs.$stat(db)
        if (stat) {
            var buffer = sys.fs.$readfile(db)
            try {
                var str = decode(buffer, "utf-8")
                // o(`parsed db str: ${str}`)
                self._storage = JSON.parse(str)
            } catch (e) {
                o(`restore db error: ${e.message}`)
                self._storage = {}
            }
        } else {
            self._storage = {}
        }

        o(`db root is: ${JSON.stringify(self._storage, null, 2)}`)

    }

    set(key, value) {
        var self = this
        // o('try to set ' + key + ':' + value)

        // adding it to storage
        self._storage[key] = value
        // o(`set [${key}]=${value}`)

        var str = JSON.stringify(self._storage, null, 2)
        // o(`new db str: ${str}`)
        var db = self.getDbPath()
        var f = sys.fs.$open(db, 'w+')
        f.$write(encode(str, "utf-8"))
        f.$close()
    }

    get(key) {
        var self = this
        // o(`try to get ${key}`)
        if (self._storage == undefined) {
            o(`sorry. invalid storage`)
            return undefined
        }

        var value = self._storage[key]
        // o(`get [${key}]=${value}`)

        return value
    }
}

if (Window.share.DB == undefined) {
    Window.share.DB = new MyDatabase()
}

export var Database = Window.share.DB