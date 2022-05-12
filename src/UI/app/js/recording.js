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
    log(str, 'RecordingApp')
}

class RecordingApp extends RecordingElement {
    componentDidMount() {
        this.configUI()
    }

    configUI() {
        var self = this
        var win = Window.this

        o('RecordingApp on mounted')

        G.DefaultLogFilter = 'RecordingApp'

        win.state = Window.WINDOW_SHOWN
        if (N.canMainWindowTopmost) win.isTopmost = true

        self.initialUI()
        self.setWindowAutoFit()
        self.setWindowLocation()

        document.onGlobalEvent('RECORD_MOUSE_POS', e => {
            self.setWindowPos(e.data.x, e.data.y)
        })

        document.onGlobalEvent('RECORDING_STOPPED', e => {
            win.close()
        })
    }

    initialUI() {
        var self = this
        var cx = N.getCursorX()
        var cy = N.getCursorY()
        o(`QT cursor x: ${cx} y: ${cy}`)
        self.setWindowPos(cx, cy)

        $('#stop_btn').on('click', () => {
            M.stopRecording()
        })

        self.startTiming()

        self.setStopBtnTips()
    }

    startTiming() {
        var self = this
        var tag = $('#time_label')
        var secs = 0
        tag.innerHTML = @'Duration: {1}'.format(TU.toHMS(0))
        TimerCenter.setInterval(() => {
            secs++
            tag.innerHTML = @'Duration: {1}'.format(TU.toHMS(secs))
        }, 1000)
    }

    setStopBtnTips() {
        var key = DB.get('recording_key') || GC.DefaultRecordHotkey
        var m = K.getKeyMappingByVkKeycode(key)
        $('#stop_btn').innerHTML = @'Stop Recording ({1})'.format(m.name)
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

document.body.patch(<RecordingApp/>)