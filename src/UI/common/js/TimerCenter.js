import log from '/common/js/Logger'

var N = NativeUtil
var WW = window

class TimerCenter {
    static _instance = null

    static getInstance() {
        if (TimerCenter._instance == null) {
            TimerCenter._instance = new TimerCenter()
        }
        return TimerCenter._instance
    }

    _intervals = []
    _timeouts = []

    _inited = false

    init() {
        var self = this
        log('TimerCenter init')
        document.on('beforeunload', () => {
            log('TimerCenter before document  unload')
            self.clearAllRunningTimers()
        })
    }

    setInterval(fn, mils) {
        var self = this

        if (!self._inited) {
            self.init()
            self._inited = true
        }

        var t = WW.setInterval(fn, mils)
        self._intervals.push(t)
        log(`TimerCenter set interval. current interval-timer: ${t}. num interval-timers: ${self._intervals.length}`)

        return t
    }

    clearInterval(t) {
        var self = this
        log(`TimerCenter clear interval: ${t}`)
        WW.clearInterval(t)

        var idx = self._intervals.indexOf(t)
        self._intervals.splice(idx, 1)
    }

    setTimeout(fn, mils) {
        var self = this

        if (!self._inited) {
            self.init()
            self._inited = true
        }

        var t = WW.setTimeout(fn, mils)
        self._timeouts.push(t)
        log(`TimerCenter set timeout. current timeout-timer: ${t}. num timeout-timers: ${self._timeouts.length}`)

        return t
    }

    clearTimeout(t) {
        var self = this
        log(`TimerCenter clear timeout: ${t}`)
        WW.clearTimeout(t)

        var idx = self._timeouts.indexOf(t)
        self._timeouts.splice(idx, 1)
    }

    clearAllRunningTimers() {
        var self = this
        log(`TimerCenter clear all running interval-timers. num interval-timers: ${self._intervals.length}. num timeout-timers: ${self._timeouts.length}`)

        for (var t of self._intervals) {
            if (t > 0) {
                log(`TimerCenter clear interval-timer: ${t}`)
                clearInterval(t)
            }
        }

        for (var t of self._timeouts) {
            if (t > 0) {
                log(`TimerCenter clear timeout-timer: ${t}`)
                clearTimeout(t)
            }
        }
    }
}

window.TimerCenter = TimerCenter.getInstance()