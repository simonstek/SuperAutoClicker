import log from '/common/js/Logger'
import {Database as DB} from '/common/js/Database'
import '/common/js/StringUtil'
import {$, $$, on} from '@sciter'
import * as C from 'Constants'
import * as B from '/common/js/BrandConfig'
import * as GC from '/common/js/Constants'
import {GlobalDef as G} from '/common/js/Global'
import * as env from '@env'
import {centerWindow, createToolWindow} from '/common/js/WindowUtil'
import {e_call} from '/common/js/DebugUtil'
import * as KU from 'HotkeyUtil'
import {BaseElement} from '/common/js/BaseElement'

var N = NativeUtil

function o(str) {
    log(str, 'MacroItem')
}

export class MacroItem extends BaseElement {
    constructor(props, kids) {
        super()
    }

    render() {
        var self = this

        return <div class="macro_item">
            <label>Macro Item</label>
        </div>
    }
}