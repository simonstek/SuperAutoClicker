import {GlobalDef as G} from '/common/js/Global'

export default function log(str, filter) {
    NativeUtil.log(str, filter || G.DefaultLogFilter)
}