import log from '/common/js/Logger'
import * as C from 'Constants'
import * as B from '/common/js/BrandConfig'
import {MouseMsg} from '/common/js/MouseMsg'
import {GlobalDef as G} from '/common/js/Global'
import * as env from '@env'
import {centerWindow} from '/common/js/WindowUtil'
import '/common/js/StringUtil'
import {$, $$, on} from '@sciter'
import {ClickActor} from '/common/js/ClickActor'

var N = NativeUtil
var M = ClickActor

function o(str) {
    log(str, 'PickApp')
}

class PickApp extends PickElement {

    componentDidMount() {
        var self = this
        var win = Window.this

        o('PickApp on mounted')

        G.DefaultLogFilter = 'PickApp'

        self.setWindowAutoFit(false)
        win.isTopmost = true
        const [x, y, w, h] = win.box('xywh', 'border', 'monitor')

        var cx = N.getCursorX()
        var cy = N.getCursorY()
        o(`QT cursor x: ${cx} y: ${cy}`)
        win.state = Window.WINDOW_SHOWN
        self.fitWindowPos(cx, cy, w, h)
        self.setWindowPos(cx, cy)
        M.startPicking()

        document.onGlobalEvent('PICK_MOUSE_POS', e => {
            self.fitWindowPos(e.data.x, e.data.y, w, h)
            self.setWindowPos(e.data.x, e.data.y)
        })

        document.onGlobalEvent('FINISH_PICKING', e => {
            win.close()
        })
    }

    setWindowPos(x, y) {
        $('#pos_text_x').innerHTML = @'X: {1}'.format(x)
        $('#pos_text_y').innerHTML = @'Y: {1}'.format(y)
    }

    fitWindowPos(x, y, w, h) {
        var win = Window.this

        var mc = N.getMonitorCount()
        var ci = win.screen

        const [sx, sy, sw, sh] = win.screenBox('frame', 'xywh')
        // o(`sx: ${sx}. sy: ${sy}. sw: ${sw}. sh: ${sh}`)
        // o(`sx+sw=${sx+sw}`)

        // 如果只有一块屏幕
        if (mc == 1) {
            // 不要再往左了
            if (x < sx) x = sx
            // 不要再往右了
            if (x + w > sx + sw) x = sx + sw - w
        }


        // 窗口移到下方时往上挪一挪
        if (y + h > sh) y = y - h

        win.move(x, y, w, h)
    }
}

document.body.patch(<PickApp/>)