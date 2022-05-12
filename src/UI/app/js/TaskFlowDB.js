import log from '/common/js/Logger'
import {$, $$, on, uuid} from '@sciter'
import {Database as DB} from '/common/js/Database'
import * as TU from '/common/js/TimeUtil'
import {ClickActor} from '/common/js/ClickActor'
import * as GC from '/common/js/Constants'
import {Result} from '/common/js/Result'
import {TaskFlowInfo} from '/app/js/TaskFlowInfo'
import {TaskBlockInfo} from '/app/js/TaskBlockInfo'

var N = NativeUtil
var M = ClickActor
var MC = MouseClicker

var dbKey = 'task_flows'

function o(str) {
    log(str, 'TaskFlowDB')
}

export const gTesttaskId = 'test_task'

class MyTaskFlowDB {
    constructor() {
    }

    getTaskFlows() {
        var flows = DB.get(dbKey) || {}
        return flows
    }

    getTaskFlowCount() {
        var self = this
        var flows = self.getTaskFlows()
        var count = 0
        for (var flow in flows) {
            count++
        }
        return count
    }

    getTaskFlow(id) {
        var flows = DB.get(dbKey) || {}
        var obj = flows[id]
        var flow = new TaskFlowInfo(obj?.name)
        Object.assign(flow, obj)
        for (var bid in flow.blocks) {
            var b = flow.blocks[bid]
            var blk = new TaskBlockInfo(b.name, bid)
            Object.assign(blk, b)
            blk.setFlow(id)
            flow.setBlock(bid, blk)
        }
        return flow
    }

    deleteTaskFlow(id) {
        var self = this
        var flows = DB.get(dbKey) || {}
        if (flows.hasOwnProperty(id)) {
            o(`delete task flow: ${id}`)
            delete flows[id]
            self.save()
        }
    }

    save(flow) {
        var flows = DB.get(dbKey) || {}
        o(`pre save flow. flows: ${flows}. flow: ${flow?.name}:${flow?.id}`)
        if (flow) flows[flow.id] = flow
        DB.set(dbKey, flows)
        o(`pro save flow. flows: ${flows}. flow: ${flow?.name}:${flow?.id}`)

        Window.post(new Event('TASK_FLOWS_UPDATED'))
    }
}

if (Window.share.TaskFlowDB == undefined || Window.share.TaskFlowDB == null) {
    Window.share.TaskFlowDB = new MyTaskFlowDB()
}

export var TaskFlowDB = Window.share.TaskFlowDB