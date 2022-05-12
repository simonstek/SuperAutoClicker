import {centerWindow} from 'WindowUtil'
import log from '/common/js/Logger'
import {$, $$, on} from '@sciter'
import '/common/js/TimerCenter'
import { ObjectViewer } from '/common/js/ObjectViewer'

var N = NativeUtil

function o(str) {
    log(str, 'BaseElement')
}

export class BaseElement extends Element {
    _fitWindowImmediately = true

    setWindowAutoFit(center = true) {
        var self = this
        var win = Window.this
        o('BaseElement fit and center')

        N.isAutoReload ? self.fitWindowSize(0, 0) : self.fitWindowSize(-10000, -10000)

        document.body.on('sizechange', e => {
            o(`on html body resize}`)
            ObjectViewer.view(e, 'ResizeEvent')
            if (self._fitWindowImmediately) {
                self.doFitWindow()
            } else {
                TimerCenter.setTimeout(() => {
                    self.doFitWindow()
                }, 200)
            }
        })

        if (!N.isAutoReload && center) centerWindow()

        win.state = Window.WINDOW_SHOWN
    }

    doFitWindow() {
        var self = this
        var win = Window.this
        var [x, y] = win.box('position', 'border', 'screen', true)
        self.fitWindowSize(x, y)
        if (!N.isAutoReload) centerWindow()
        win.state = Window.WINDOW_SHOWN
    }

    fitWindowSize(x, y) {
        var self = this
        var win = Window.this
        let [w, h] = this.state.box('dimension', 'border', 'screen', true)
        o(`move and resize window to ${x}, ${y}, ${w},${h}`)
        win.move(x, y, w, h)
    }

    setWindowSize(w, h) {
        var self = this
        var win = Window.this
        var [x, y] = win.box('position', 'border', 'screen', true)
        o(`move and resize window to ${x}, ${y}, ${w},${h}`)
        win.move(x, y, w, h)
    }
}