import log from '/common/js/Logger'
import * as C from 'Constants'
import * as B from '/common/js/BrandConfig'
import {GlobalDef as G} from '/common/js/Global'
import * as GC from '/common/js/Constants'
import * as env from '@env'
import {centerWindow} from '/common/js/WindowUtil'
import '/common/js/StringUtil'
import {$, $$, on} from '@sciter'
import {Database as DB} from '/common/js/Database'
import * as K from '/common/js/KeyMapping'
import * as KU from 'HotkeyUtil'
import '/common/js/TimerCenter'
import {ClickActor} from '/common/js/ClickActor'

var N = NativeUtil
var M = ClickActor

function o(str) {
    log(str, 'HotkeyWindow')
}

class HotkeyApp extends HotkeyElement {
    _pressedRealKey = 0
    _ctrlKeyPressed = false
    _shiftKeyPressed = false
    _altKeyPressed = false

    componentDidMount() {
        var self = this
        var win = Window.this

        o('HotkeyApp on mounted')

        G.DefaultLogFilter = 'HotkeyApp'

        self.initHotkey()

        $('#cancel_btn').on('click', async () => {
            win.state = Window.WINDOW_HIDDEN
            win.close()
        })

        $('#ok_btn').on('click', async () => {
            win.state = Window.WINDOW_HIDDEN
            self.onClickOK()
        })

        win.isTopmost = true
        self.setWindowAutoFit()
        win.state = Window.WINDOW_SHOWN
    }

    initHotkey() {
        var self = this
        o('init hotkey')

        var keys = KU.getClickHotkeyStr()
        self.setHotkeyLabel(keys)

        document.on('keydown', async (e) => {
            o(`on keydown. e.code=${e.code} e.key=${e.key} e.keyCode=${e.keyCode}`)
            await self.onKeyDown(e)
        })
        document.on('keyup', (e) => {
            self.onKeyUp(e)
        })
    }

    async onKeyDown(e) {
        var self = this

        self._pressedRealKey = 0 // 真实按键归零

        self._ctrlKeyPressed = e.ctrlKey
        self._shiftKeyPressed = e.shiftKey
        self._altKeyPressed = e.altKey

        var keys = KU.getHotkeyPreceding(e.ctrlKey, e.shiftKey, e.altKey)

        if (!self.isCombinationKey(e.code)) {
            var m = K.getKeyMappingBySciterKeycode(e.keyCode)
            keys += m.name
            self._pressedRealKey = m.vkCode // 记录真实按键
        }

        self.setHotkeyLabel(keys)
    }

    onKeyUp(e) {
        var self = this
        var hasPressedCombinationKey = (e.ctrlKey || e.shiftKey || e.altKey)
        if (!hasPressedCombinationKey && self._pressedRealKey == 0) {
            self.setHotkeyLabel(@'None')
            self._ctrlKeyPressed = false
            self._shiftKeyPressed = false
            self._altKeyPressed = false
        }
    }

    setHotkeyLabel(str) {
        $('#hotkey_text').innerHTML = str
    }

    isCombinationKey(code) {
        const combinationKeys = ['ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight']
        var ret = (combinationKeys.indexOf(code) >= 0)
        return ret
    }

    onClickOK() {
        var self = this
        var win = Window.this

        M.saveClickHotkey(self._pressedRealKey, self._ctrlKeyPressed, self._shiftKeyPressed, self._altKeyPressed)

        Window.post(new Event('click_hotkey_setted'))

        win.close()
    }
}

document.body.patch(<HotkeyApp/>)