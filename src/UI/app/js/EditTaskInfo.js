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
    log(str, 'EditTaskInfoApp')
}

class EditTaskInfoApp extends EditTaskInfoElement {
    componentDidMount() {
        var self = this
        log('EditTaskInfoApp on mounted')
        self.configUI()
    }

    configUI() {
        var self = this
        var win = Window.this

        self.configWindow()

        self.configName()

        self.configBtns()

        self.setWindowAutoFit()
    }

    configWindow() {
        var self = this
        var win = Window.this
        // win.state = Window.WINDOW_SHOWN
        win.isTopmost = true
    }

    configName() {
        var self = this
        var win = Window.this
        var param = win.parameters
        self.flow = param?.flow

        var name_input = $('#name_input')
        name_input.value = self.flow?.name
        name_input.edit.selectAll()
    }

    configBtns() {
        var self = this
        var win = Window.this

        $('#save_btn').on('click', () => {
            self.save()
        })

        $('#close_btn').on('click', () => {
            Window.this.close()
        })
    }

    save() {
        var self = this
        var name_input = $('#name_input')
        var name = name_input.value
        o(`try to save task name: ${name}`)

        var ret = self.flow.rename(name)
        if (ret.code != ErrorCode.OK) {
            showTipsWindow(@'Error', @'Failed to save task: {1}'.format(ret.message))
            return
        }
        self.flow.save()

        Window.this.close()
    }
}

document.body.patch(<EditTaskInfoApp/>)