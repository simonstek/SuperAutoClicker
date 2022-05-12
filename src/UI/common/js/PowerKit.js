import log from '/common/js/Logger'
import {Database as DB} from '/common/js/Database'
import '/common/js/StringUtil'
import {$, $$, on} from "@sciter"
import * as sys from "@sys"; // '@' is mandatory
import * as env from '@env'
import {centerWindow} from '/common/js/WindowUtil'
import {GlobalDef as G} from '/common/js/Global'
import {e_call} from '/common/js/DebugUtil'
import * as B from '/common/js/BrandConfig'
import * as GC from '/common/js/Constants'
import '/common/js/TimerCenter'

var N = NativeUtil

function o(str) {
    log(str, 'PowerKit')
}

export function run(action, param) {
    o(`PowerKit do background work.`)
    // create temp unstaller dir if neccesary
    var tmpDir = `${N.getTempPath()}/${B.ProcessName}_PowerKit_Temp`
    var exists = sys.fs.$stat(tmpDir) != null
    o(`temp PowerKit dir : ${tmpDir}. exists: ${exists}`)
    if (!exists) {
        var result = sys.fs.$mkdir(tmpDir)
        o(`create dir: ${tmpDir}. result: ${result}`)
        if (!result) {
            o('failed to create temp PowerKit dir')
        }
    }

    // copy neccecary files from installation folder
    var kit = GC.PowerKit
    var exe = `${tmpDir}/${kit}`
    o(`copy ${kit} to ${exe}`)
    var cur = N.processFolder()
    o(`current process folder: ${cur}`)
    N.copyFile(`${cur}/${kit}`, exe, true)
    N.copyFile(`${cur}/${GC.QT5CORE}`, `${tmpDir}/${GC.QT5CORE}`, true)
    N.copyFile(`${cur}/${GC.MSVCP}`, `${tmpDir}/${GC.MSVCP}`, true)
    N.copyFile(`${cur}/${GC.VCRUNTIME}`, `${tmpDir}/${GC.VCRUNTIME}`, true)

    // convert param string to base64 to avoid white-space
    var b = N.toBase64Str(param)
    env.exec(exe, `"${action}" "${b}"`)
}