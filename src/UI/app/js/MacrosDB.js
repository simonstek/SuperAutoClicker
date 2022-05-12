import log from '/common/js/Logger'
import {$, $$, on} from '@sciter'
import {Database as DB} from '/common/js/Database'
import * as TU from '/common/js/TimeUtil'
import {ClickActor} from '/common/js/ClickActor'
import * as GC from '/common/js/Constants'
import {Result} from '/common/js/Result'

var N = NativeUtil
var M = ClickActor
var MC = MouseClicker

function o(str) {
    log(str, 'MacrosDB')
}

class MyMacrosDB {
    constructor() {
    }

    getMacroById(id) {
        o(`to get macro id: ${id}`)
        var macros = DB.get('recorded_macros')
        var index = -1
        for (var macro of macros) {
            index++
            // o(`looped mac id: ${mac.id}`)
            var equals = (macro.id == id)
            // o(`founded: ${equals}`)
            if (equals) {
                o(`founded macrod: ${macro.name}. id: ${macro.id}`)
                return {macro, index}
            }
        }

        return undefined
    }

    getMacroByName(name) {
        o(`to get macro name: ${name}`)
        var macros = DB.get('recorded_macros')
        var index = -1
        for (var macro of macros) {
            index++
            // o(`looped mac id: ${mac.id}`)
            var equals = (macro.name == name)
            // o(`founded: ${equals}`)
            if (equals) {
                o(`founded macrod: ${macro.name}. id: ${macro.id}`)
                return {macro, index}
            }
        }

        return undefined
    }

    validateName(name) {
        var self = this
        o(`try to validate macro name: ${name}`)

        // empty name
        if (name == undefined || name == null || name.trim().length <= 0) {
            return Result.Error(Result.Error_EmptyName, @'Empty macro name')
        }

        // too long name
        if (name.trim().length > 255) {
            return Result.Error(Result.Error_TooLongName, @'Macro name too long')
        }

        // existing name
        var old = self.getMacroByName(name)
        if (old !== undefined && old.index !== -1) {
            return Result.Error(Result.Error_NameAlreadyExists, @'This macro name already exists')
        }

        return Result.OK()
    }

    saveMacro(name) {
        var self = this
        o(`try to save macro name: ${name}`)

        var m = MC.saveMacro(name, `${GC.MacrosDir}/${N.toBase64Str(name)}${GC.MacroExtension}`)
        var mo = {
            id: m.id,
            name: m.name,
            createdTime: m.createdTime,
            duration: m.duration,
            hotkeyVkCode: m.hotkeyVkCode
        }
        o(`saved macros is: ${mo}`)

        var ms = DB.get('recorded_macros') || []
        ms.push(mo)
        DB.set('recorded_macros', ms)
        Window.post(new Event('MACROS_UPDATED'))

        return Result.OK()
    }

    updateMacroNameById(id, newName) {
        var self = this
        o(`update macro name by id: ${id}. name: ${newName}`)
        var ret = self.getMacroById(id)
        if (ret != undefined) {
            var oldName = ret.macro.name
            ret.macro.name = newName
            var macros = DB.get('recorded_macros')
            DB.set('recorded_macros', macros)
            MC.renameMacro(`${GC.MacrosDir}/${N.toBase64Str(oldName)}.mac`, `${GC.MacrosDir}/${N.toBase64Str(newName)}${GC.MacroExtension}`, newName)
            Window.post(new Event('MACROS_UPDATED'))
        }
    }

    deleteMacroById(id) {
        var self = this
        o(`delete macro by id: ${id}`)
        var ret = self.getMacroById(id)
        if (ret != undefined) {
            o(`found to delete macro index: ${ret.index}`)
            if (ret.index != -1) {
                var macros = DB.get('recorded_macros')
                macros.splice(ret.index, 1)
                N.removeFile(`${GC.MacrosDir}/${N.toBase64Str(ret.macro.name)}${GC.MacroExtension}`)
                DB.set('recorded_macros', macros)
            }
        }
    }
}

if (Window.share.MacrosDB == undefined || Window.share.MacrosDB == null) {
    Window.share.MacrosDB = new MyMacrosDB()
}

export var MacrosDB = Window.share.MacrosDB