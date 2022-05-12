import log from '/common/js/Logger'
import {$, $$, on} from '@sciter'
import {centerWindow, showTipsWindow} from '/common/js/WindowUtil'
import {Database as DB} from '/common/js/Database'
import * as TU from '/common/js/TimeUtil'
import {MacrosDB} from '/app/js/MacrosDB'
import {MouseMsg} from '/common/js/MouseMsg'
import * as K from '/common/js/KeyMapping'
import * as GC from '/common/js/Constants'
import {ErrorCode} from '/common/js/ErrorCode'

var N = NativeUtil
var MC = MouseClicker

function o(str) {
    log(str, 'MacroApp')
}

const InputType = {
    Mouse: 0,
    Keyboard: 1
}

class MacroApp extends MacroElement {
    _macro = {
        name: 'test_macro',
        events: [
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1},
            {time: 1, msg: 1, vkCode: 0, x: 1, y: 1}
        ]
    }

    componentDidMount() {
        var self = this
        log('MacroApp on mounted')
        self.configUI()
    }

    configUI() {
        var self = this
        var win = Window.this

        win.state = Window.WINDOW_SHOWN
        win.isTopmost = true

        self._macro = win.parameters?.macro || self._macro
        o(`macro is: ${self._macro}`)

        self.configTitle()
        self.configName()
        self.configBtns()
        self.configCommands()

        self.setWindowAutoFit()
    }

    configTitle() {
        var self = this
        $('#title_label').innerHTML = self._macro?.name
    }

    configName() {
        var self = this
        var edit = $('#macro_name_edit')
        edit.value = self._macro?.name
        edit.edit.selectRange(edit.value.length, edit.value.length)
    }

    configBtns() {
        var self = this
        $('#close_btn').on('click', () => {
            Window.this.close()
        })

        $('#save_btn').on('click', () => {
            if (self.saveMacroOk()) {
                Window.this.close()
            }
        })

        $('#schedule_btn').on('click', () => {
            Window.this.close()
        })
    }

    configCommands() {
        var self = this
        var macro = MC.getMacroFile(`${GC.MacrosDir}/${N.toBase64Str(self._macro.name)}${GC.MacroExtension}`)
        var len = macro?.events?.length
        o(`config commands. num commands: ${len}`)

        var list = []
        if (len >= 0) {
            var order = 0
            for (var e of macro?.events) {
                order++

                var desc = self.getActionDesc(e)
                // o(`append event: ${e.time}`)
                list.push(
                    <tr class="table_row">
                        <td class="order_td">{order}</td>
                        <td class="time_td">{`${e.time}ms`}</td>
                        <td class="action_td">{desc.action}</td>
                        <td class="p1_td">{desc.param1}</td>
                        <td class="p2_td">{desc.param2}</td>
                    </tr>)
            }
        }
        o(`list len: ${list.length}`)
        var tbody = document.$("table#actions_table>tbody")
        o(`tbody: ${tbody}`)
        tbody.content(list)
    }

    getActionDesc(e) {
        var desc = {action: `unkown_action_desc_${e.msg}`, param1: '', param2: ''}

        if (e.type == InputType.Mouse) {
            if (e.msg == MouseMsg.WM_MOUSEMOVE) {
                desc.action = @'Move'
            } else if (e.msg == MouseMsg.WM_LBUTTONDBLCLK) {
                desc.action = @'Left Click'
            } else if (e.msg == MouseMsg.WM_RBUTTONDBLCLK) {
                desc.action = @'Right Click'
            } else if (e.msg == MouseMsg.WM_MBUTTONDBLCLK) {
                desc.action = @'Middle Click'
            } else if (e.msg == MouseMsg.WM_XBUTTONDBLCLK) {
                desc.action = @'X Button Click'
            } else if (e.msg == MouseMsg.WM_LBUTTONDOWN ||
                e.msg == MouseMsg.WM_RBUTTONDOWN ||
                e.msg == MouseMsg.WM_MBUTTONDOWN ||
                e.msg == MouseMsg.WM_XBUTTONDOWN
            ) {
                desc.action = @'Mouse Down'
            } else if (e.msg == MouseMsg.WM_LBUTTONUP ||
                e.msg == MouseMsg.WM_RBUTTONUP ||
                e.msg == MouseMsg.WM_MBUTTONUP ||
                e.msg == MouseMsg.WM_XBUTTONUP
            ) {
                desc.action = @'Mouse Up'
            }

            desc.param1 = `X = ${e.x}`
            desc.param2 = `Y = ${e.x}`
        } else {
            if (e.msg == MouseMsg.WM_KEYDOWN) {
                desc.action = @'Key Down'
            } else if (e.msg == MouseMsg.WM_KEYUP) {
                desc.action = @'Key Up'
            }


            desc.param1 = K.getKeyNameByVkCode(e.vkCode)
        }

        return desc
    }

    saveMacroOk() {
        var self = this
        o(`save macro`)

        var name = $('#macro_name_edit').value
        o(`now macro name: ${name}`)

        if (name == self._macro.name) {
            o(`same name as before. skip`)
            return true
        }

        var ret = MacrosDB.validateName(name)
        if (ret.code != ErrorCode.OK) {
            showTipsWindow(@'Error', @'Failed to save macro: {1}'.format(@'{1}'.format(ret.message)))
            return false
        }

        MacrosDB.updateMacroNameById(self._macro.id, name)

        return true
    }
}

document.body.patch(<MacroApp/>)