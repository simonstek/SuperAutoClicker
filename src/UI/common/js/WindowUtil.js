import log from '/common/js/Logger'
import {Database as DB} from '/common/js/Database'

function o(str) {
    log(str, 'WindowUtil')
}

export function centerWindow() {
    var wnd = Window.this
    const [x, y, w, h] = wnd.box('xywh', 'border', 'screen', true)
    const [sw, sh] = wnd.screenBox('workarea', 'dimension')
    o(`sh=${sh}`)

    if (w > 0 && h > 0) {
        o('window xywh: ' + x + ' ' + y + ' ' + w + ' ' + h + '. screen size: ' + sw + ' ' + sh)
        var wx = (sw - w) / 2
        var wy = (sh - h) / 2
        wnd.move(wx, wy)
        o('center window to: ' + wx + ' ' + wy)
    }
}

export function createToolWindow(url, param) {
    var nw = new Window({url: url, x: -10000, type: Window.TOOL_WINDOW, state: Window.WINDOW_HIDDEN, parameters: param})
    return nw
}

export function showTipsWindow(title, text, okText = @'OK') {
    var m = Window.this.modal({
        url: '/common/modal.html',
        x: -10000,
        parameters: {
            title: title,
            text: text,
            mode: 'tips',
            okText: okText
        }
    })
    var r = DB.get('modal_result')
    DB.set('modal_result', false)
    return r
}

export function showAskDialog(title, text, okText = @'Yes', noText = @'No') {
    var m = Window.this.modal({
        url: '/common/modal.html',
        x: -10000,
        parameters: {
            title: title,
            text: text,
            mode: 'ask',
            okText: okText,
            noText: noText
        }
    })
    var r = DB.get('modal_result')
    DB.set('modal_result', false)
    return r
}

export function showModal(url, param = undefined) {
    var m = Window.this.modal({
        url: url,
        x: -10000,
        parameters: param
    })
    var r = DB.get('modal_result')
    DB.set('modal_result', false)
    return r
}