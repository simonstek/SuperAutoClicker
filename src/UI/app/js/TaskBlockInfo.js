import log from '/common/js/Logger'
import {$, $$, on, uuid} from '@sciter'
import {Database as DB} from '/common/js/Database'
import * as TU from '/common/js/TimeUtil'
import {ClickActor} from '/common/js/ClickActor'
import * as GC from '/common/js/Constants'
import {Result} from '/common/js/Result'

function o(str) {
    log(str, 'TaskBlockInfo')
}

export const TaskBlockType = {
    Start: 0,
    Node: 1,
    End: 2
}

export class TaskBlockInfo {
    constructor(name, id) {
        this.id = id || uuid()
        this.name = name || `undefined_name_for_${this.id}`
        this.createdTime = (new Date()).getTime()
        this.pos = {x: 0, y: 0}
        this.inputRelativePos = {x: 10, y: 36}
        this.outputRelativePos = {x: 171, y: 36}
        this.prev = undefined
        this.next = []
        this.type = TaskBlockType.Node
        this.removable = true
        o(`created TaskBlockInfo ${name}:${this.id}`)
    }

    setType(t) {
        this.type = t
    }

    setFlow(id) {
        this.flowId = id
        o(`bind to flow: ${id}`)
    }

    rename(name) {
        var oldName = this.name
        this.name = name
        o(`rename task block from ${oldName} to ${name}`)
    }

    setPrev(block) {
        this.prev = block?.id
        o(`set task block ${this.name}:${this.id} prev: ${block?.name}`)
    }

    setNext(block) {
        var self = this

        if (self.next.indexOf(block?.id) == -1) {
            self.next.push(block?.id)
            o(`set task block ${self.name}:${self.id} next: ${block?.name}`)
        }
    }

    rmvNext(id) {
        var self = this
        if (id == undefined || id == null || id.trim().length <= 0) return

        var index = self.next.indexOf(id)
        if (index != -1) {
            self.next.splice(index, 1)
            o(`TaskBlockInfo remove next ${id} at ${index}`)
        }
    }

    move(x, y) {
        this.pos.x = x
        this.pos.y = y
        // o(`move task block ${this.id} to ${x}, ${y}`)
    }

    getInputPos() {
        return {
            x: this.pos.x + this.inputRelativePos.x,
            y: this.pos.y + this.inputRelativePos.y
        }
    }

    getOutputPos() {
        return {
            x: this.pos.x + this.outputRelativePos.x,
            y: this.pos.y + this.outputRelativePos.y
        }
    }
}