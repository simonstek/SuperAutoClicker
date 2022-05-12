import log from '/common/js/Logger'
import * as C from 'Constants'
import * as B from '/common/js/BrandConfig'
import {GlobalDef as G} from '/common/js/Global'
import * as env from '@env'
import {centerWindow} from '/common/js/WindowUtil'
import '/common/js/StringUtil'
import {$, $$, on} from '@sciter'
import * as GC from '/common/js/Constants'
import {Database as DB} from '/common/js/Database'
import {ClickActor} from '/common/js/ClickActor'
import * as K from '/common/js/KeyMapping'
import '/common/js/TimerCenter'
import * as TU from '/common/js/TimeUtil'

var N = NativeUtil
var M = ClickActor

function o(str) {
    log(str, 'ReplayingApp')
}

class ReplayingApp extends ReplayingElement {
    _macro = undefined
    _hotkeyName = 'unkown_hotkey_name'

    componentDidMount() {
        this.configUI()
    }

    async configUI() {
        var self = this
        var win = Window.this

        o('ReplayingApp on mounted')

        G.DefaultLogFilter = 'ReplayingApp'

        self._macro = win.parameters?.macro
        o(`ReplayingApp received param: ${win.parameters}`)

        win.state = Window.WINDOW_SHOWN
        if (N.canMainWindowTopmost) win.isTopmost = true

        var key = DB.get('replaying_key') || GC.DefaultReplayHotkey
        var m = K.getKeyMappingByVkKeycode(key)
        self._hotkeyName = m.name
        o(`replay hotkey: ${m.name}`)

        self.initialUI()
        self.setWindowAutoFit()
        self.setWindowLocation()

        document.onGlobalEvent('REPLAY_MOUSE_POS', e => {
            self.setWindowPos(e.data.x, e.data.y)
        })

        document.onGlobalEvent('PLAY_MACRO_FINISHED', e => {
            win.close()
        })

        document.onGlobalEvent('PLAY_MACRO_PROGRESS', e => {
            self.onPlayProgress(e)
        })

        document.onGlobalEvent('REPLAYING_STOPPED', () => {
            win.close()
        })
    }

    initialUI() {
        var self = this
        var cx = N.getCursorX()
        var cy = N.getCursorY()
        o(`QT cursor x: ${cx} y: ${cy}`)
        self.setWindowPos(cx, cy)

        self.startTiming()

        self.setProgressTips(0)
    }

    startTiming() {
        var self = this
        var up_label = $('#time_up_label')
        var down_label = $('#time_left_label')
        var macro_name_label = $('#macro_name_label')

        var secs = 0
        up_label.innerHTML = @'{1}'.format(TU.toMS(0))

        if (self._macro) {
            macro_name_label.innerHTML = @'Replaying: {1}'.format(self._macro.name)

            var totalSecs = parseInt((self._macro.duration / 1000).toFixed(0))
            down_label.innerHTML = @'{1}'.format(TU.toMS(totalSecs))
        }

        TimerCenter.setInterval(() => {
            secs++
            up_label.innerHTML = @'{1}'.format(TU.toMS(secs))
            down_label.innerHTML = @'{1}'.format(TU.toMS(totalSecs - secs))
        }, 1000)
    }

    setProgressTips(progress) {
        var self = this
        $('#replay_progress').value = `${progress}`
        $('#progress_tip').innerHTML = @'Replay progress: {1}% (Press <span>{2}</span> to stop)'.format(progress, self._hotkeyName)
    }

    onPlayProgress(e) {
        var self = this
        var progress = (e.data.currTime * 1.0 / e.data.totalTime) * 100
        progress = parseInt(progress.toFixed(0))
        // o(`on play progress: ${progress}`)
        self.setProgressTips(progress)
    }

    setWindowLocation() {
        var self = this
        var win = Window.this

        const [x, y, w, h] = win.box('xywh', 'border', 'monitor')
        const [sw, sh] = win.screenBox('workarea', 'dimension')

        if (w > 0 && h > 0) {
            o('window xywh: ' + x + ' ' + y + ' ' + w + ' ' + h + '. screen size: ' + sw + ' ' + sh)
            var wx = (sw - w)
            var wy = (sh - h)
            win.move(wx, wy)
            o('set window to: ' + wx + ' ' + wy)
        }
    }

    setWindowPos(x, y) {
        $('#pos_label').innerHTML = @'Mouse position: {1}, {2}'.format(x, y)
    }
}

document.body.patch(<ReplayingApp/>)