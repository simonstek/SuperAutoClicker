import log from '/common/js/Logger'
import {Database as DB} from '/common/js/Database'
import * as GC from '/common/js/Constants'
import * as K from '/common/js/KeyMapping'
import {ClickActor} from '/common/js/ClickActor'

var M = ClickActor

function o(str) {
    log(str, 'HotkeyUtil')
}

export function getClickHotkeyStr() {
    var ctrl = DB.get(GC.KeyName.ClickHotCtrl) || false
    var shift = DB.get(GC.KeyName.ClickHotShift) || false
    var alt = DB.get(GC.KeyName.ClickHotAlt) || false
    var keys = getHotkeyPreceding(ctrl, shift, alt)

    var code = DB.get(GC.KeyName.ClickHotKey) || GC.DefaultClickHotkey
    var m = K.getKeyMappingByVkKeycode(code)
    o(`click hotkey. name=${m.name}. vkCode: ${code}. ctrl: ${ctrl}. shift: ${shift}. alt: ${alt}`)
    keys += m.name

    return keys
}

export function getRecordHotkeyStr() {
    var ctrl = DB.get(GC.KeyName.RecordHotCtrl) || false
    var shift = DB.get(GC.KeyName.RecordHotShift) || false
    var alt = DB.get(GC.KeyName.RecordHotAlt) || false
    var keys = getHotkeyPreceding(ctrl, shift, alt)

    var code = DB.get(GC.KeyName.RecordHotKey) || GC.DefaultRecordHotkey
    o(`record hotkey vkCode: ${code}. ctrl: ${ctrl}. shift: ${shift}. alt: ${alt}`)
    var m = K.getKeyMappingByVkKeycode(code)
    keys += m.name

    return keys
}

export function getHotkeyPreceding(ctrl, shift, alt) {
    var preceding = ''

    if (ctrl) preceding += 'Ctrl + '

    if (shift) preceding += 'Shift + '

    if (alt) preceding += 'Alt + '

    return preceding
}