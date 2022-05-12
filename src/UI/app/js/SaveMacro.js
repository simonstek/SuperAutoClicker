import log from '/common/js/Logger'
import {$, $$, on} from '@sciter'
import {centerWindow, showTipsWindow} from '/common/js/WindowUtil'
import {Database as DB} from '/common/js/Database'
import {ClickActor} from '/common/js/ClickActor'
import * as GC from '/common/js/Constants'
import {MacrosDB} from '/app/js/MacrosDB'
import {ErrorCode} from '/common/js/ErrorCode'
import * as TU from '/common/js/TimeUtil'

var M = ClickActor
var MC = MouseClicker
var N = NativeUtil

function o(str) {
    log(str, 'SaveMacroApp')
}

class SaveMacroApp extends SaveMacroElement {
    componentDidMount() {
        var self = this
        log('SaveMacroApp on mounted')
        self.configUI()
    }

    configUI() {
        var self = this
        var win = Window.this

        // win.state = Window.WINDOW_SHOWN
        win.isTopmost = true

        var time = TU.getTimeString((new Date()).getTime())
        var name_input = $('#macro_name_input')
        name_input.value = `My Macro ${time}`
        name_input.edit.selectAll()

        $('#replay_btn').on('click', () => {
            self.replayMacro()
        })

        document.onGlobalEvent('PLAY_MACRO_STARTED', () => {
            o(`SaveMacroApp on play macro started`)
            win.state = Window.WINDOW_HIDDEN
        })

        document.onGlobalEvent('PLAY_MACRO_FINISHED', () => {
            o(`SaveMacroApp on play macro finished`)
            win.state = Window.WINDOW_SHOWN
        })

        $('#record_again_btn').on('click', () => {
            M.startRecording()
            Window.this.close()
        })

        $('#save_macro_btn').on('click', () => {
            self.saveMacro()
        })

        $('#close_btn').on('click', () => {
            Window.this.close()
        })

        self.setWindowAutoFit()
    }

    saveMacro() {
        var name_input = $('#macro_name_input')
        var name = name_input.value
        o(`try to save macro name: ${name}`)

        var ret = MacrosDB.saveMacro(name)
        if (ret.code != ErrorCode.OK) {
            showTipsWindow(@'Error', @'Failed to save macro: {1}'.format(ret.message))
            return
        }

        Window.this.close()
    }

    replayMacro() {
        var self = this
        var win = Window.this

        o(`replay macro`)
        var temp = 'temp_macro'
        o(`save temp macro file: ${temp}`)
        var m = MC.saveMacro(temp, `${GC.MacrosDir}/${N.toBase64Str(temp)}${GC.MacroExtension}`)

        M.startPlaying(m)
    }
}

document.body.patch(<SaveMacroApp/>)