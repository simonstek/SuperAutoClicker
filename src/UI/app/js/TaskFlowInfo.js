import log from '/common/js/Logger'
import {$, $$, on, uuid} from '@sciter'
import {Database as DB} from '/common/js/Database'
import * as TU from '/common/js/TimeUtil'
import {ClickActor} from '/common/js/ClickActor'
import * as GC from '/common/js/Constants'
import {Result} from '/common/js/Result'
import {ErrorCode} from '/common/js/ErrorCode'
import {TaskFlowDB} from 'TaskFlowDB'
import {TaskBlockInfo, TaskBlockType} from 'TaskBlockInfo'

function o(str) {
    log(str, 'TaskFlowInfo')
}

export class TaskFlowInfo {
    constructor(name, id) {
        this.id = id || uuid()
        this.name = name || `undefined_name_for_${this.id}`
        this.createdTime = (new Date()).getTime()
        this.editedTime = (new Date()).getTime()
        this.blocks = {}
        this.genStartBlock()
        o(`created TaskFlowInfo ${name}:${this.id}`)
    }

    rename(name) {
        if (name == undefined || name == null || name == '' || name.trim().length <= 0) {
            return Result.Error(ErrorCode.EmptyName, 'Task flow name cannot be empty')
        }

        if (name.trim().length > 50) {
            return Result.Error(ErrorCode.Error_TooLongName, 'Task flow name too long')
        }

        if (name == this.name) {
            return Result.OK()
        }

        var oldName = this.name
        this.name = name
        o(`rename task flow from ${oldName} to ${name}`)

        return Result.OK()
    }

    genStartBlock() {
        o(`gen start block`)
        var blk = new TaskBlockInfo(@'Start')
        blk.removable = false
        blk.setType(TaskBlockType.Start)
        blk.move(30, 25)
        this.addBlock(blk)
    }

    addBlock(block) {
        this.blocks[block.id] = block
        o(`added block ${block.name}:${block.id}`)
    }

    setBlock(id, block) {
        this.blocks[id] = block
        o(`setted block ${block.name}:${block.id}`)
    }

    rmvBlock(id) {
        var self = this
        if (!self.blocks.hasOwnProperty(id)) return
        var blk = self.blocks[id]

        // 断开联系
        if (blk.prev) {
            var prev = self.getBlock(blk.prev)
            if (prev) prev.setNext(undefined)
        }
        if (blk.next) {
            var next = self.getBlock(blk.next)
            if (next) next.setPrev(undefined)
        }

        o(`deleted block ${blk.name}:${id}`)
        delete self.blocks[id]
    }

    getBlock(id) {
        return this.blocks[id]
    }

    getNumBlocks() {
        var count = 0
        for (var blk in this.blocks) {
            count++
        }
        return count - 1 // 去掉start
    }

    save() {
        this.editedTime = (new Date()).getTime()
        o(`saved task flow ${this.name}:${this.id}`)
        TaskFlowDB.save(this)
    }
}