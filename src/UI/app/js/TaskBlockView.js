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

var N = NativeUtil

function o(str) {
    log(str, 'TaskBlockView')
}

export class TaskBlockView extends BaseElement {
    constructor(props, kids) {
        super()
        var self = this
        self.info = props?.info
        o(`construct TaskBlockView ${self.info?.name}:${self.info?.id}`)
    }

    componentDidMount() {
        var self = this
        self.configPos()
        self.configTitle()
        self.configDrag()
        self.configLinking()
        self.configGlow()
        self.select(false)
    }

    configPos() {
        var self = this
        self.setPos(self.info?.pos.x, self.info?.pos.y)
    }

    setPos(x, y) {
        var self = this

        // o(`set TaskBlockView ${self.info.id} pos to ${x}, ${y}`)

        self.style.left = x
        self.style.top = y

        self.info?.move(x, y)
    }

    configTitle() {
        var self = this
        self.$('.function_name').innerHTML = self.info?.name
    }

    configDrag() {
        var self = this

        self.on('mousedown', e => {
            o(`on mouse down TaskBlockView ${self.info?.name}:${self.info?.id}`)
            self.onMouseDown(e)
        })
    }

    configLinking() {
        var self = this
        o(`config linking`)

        self.$('.function_output').on('click', (evt, ele) => {
            o(`on clicking ${self.info?.name}`)
            Window.share.flowState = FlowState.Linking
            Window.share.linkStartItem = this
            evt.stopPropagation()
        })

        self.on('mouseenter', e => {
            // o(`hovering ${self}`)
            Window.share.hoveringItem = self
        })
        self.on('mouseleave', e => {
            // o(`leaving ${self}`)
            Window.share.hoveringItem = undefined
        })
    }

    configGlow() {
        var r = 255 * Math.random()
        var g = 255 * Math.random()
        var b = 255 * Math.random()
        var glow = this.$('.function_glow')
        if (glow) glow.style.boxShadow = `120px 120px 100px 20px rgb(${r},${g},${b});`
    }

    onMouseDown(e) {
        Window.post(new Event('MOUSE_DOWN_TASK_BLOCK', {data: {event: e, item: this}}))
    }

    select(v) {
        var self = this
        self.selected = v
    }

    render() {
        var self = this

        return (
            <div class='function_item' title={self.info.name}>
                <div class="function_top_line_left" />
                <div class="function_top_line_right" />
                <div class class="function_header_plate1" />
                <div class class="function_header_plate2" />
                <div class="function_glow" />
                <div class="function_body">
                    <img class="function_icon" src="/app/img/formula.svg" />
                    <label class="function_name">DoOnce</label>
                    <img class="function_input function_socket" src="/app/img/function_socket.svg" />
                    <img class="function_output function_socket" src="/app/img/function_socket.svg" />
                </div>
            </div>
        )
    }
}