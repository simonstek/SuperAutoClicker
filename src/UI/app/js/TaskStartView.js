import log from '/common/js/Logger'
import {Database as DB} from '/common/js/Database'
import '/common/js/StringUtil'
import {$, $$, on, uuid} from '@sciter'
import * as C from 'Constants'
import * as B from '/common/js/BrandConfig'
import * as GC from '/common/js/Constants'
import {GlobalDef as G} from '/common/js/Global'
import * as env from '@env'
import {centerWindow, createToolWindow} from '/common/js/WindowUtil'
import {e_call} from '/common/js/DebugUtil'
import * as KU from 'HotkeyUtil'
import {BaseElement} from '/common/js/BaseElement'
import {FlowState} from 'FlowState'
import {FunctionLink} from 'FunctionLink'
import {TaskFlowDB} from 'TaskFlowDB'
import * as K from '/common/js/KeyMapping'
import {TaskBlockType} from 'TaskBlockInfo'
import {TaskBlockView} from 'TaskBlockView'

var N = NativeUtil

function o(str) {
    log(str, 'TaskStartView')
}

export class TaskStartView extends TaskBlockView {
    constructor(props, kids) {
        super()
        var self = this
        self.info = props.info
        o(`construct TaskStartView ${self.info?.name}:${self.info?.id}`)
        self.configOutputPos()
    }

    configOutputPos() {
        this.info.outputRelativePos = { x: 76, y: 26 }
    }

    render() {
        var self = this

        return (
            <div class='function_item flow_start'>
                <div class="function_top_line_left" />
                <div class="function_top_line_right" />
                <div class class="function_header_plate1" />
                <div class class="function_header_plate2" />
                <div class="function_glow" />
                <div class="function_body">
                    <label class="function_name">DoOnce</label>
                    <img class="function_output function_socket" src="/app/img/function_socket.svg" />
                </div>
            </div>
        )
    }
}