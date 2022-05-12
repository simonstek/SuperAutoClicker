import log from '/common/js/Logger'
import {$, $$, on} from '@sciter'
import {centerWindow, showTipsWindow, showModal} from '/common/js/WindowUtil'
import {Database as DB} from '/common/js/Database'
import {ClickActor} from '/common/js/ClickActor'
import * as GC from '/common/js/Constants'
import {MacrosDB} from '/app/js/MacrosDB'
import {ErrorCode} from '/common/js/ErrorCode'
import * as TU from '/common/js/TimeUtil'
import {TaskFlowInfo} from '/app/js/TaskFlowInfo'
import {TaskBlockInfo, TaskBlockType} from '/app/js/TaskBlockInfo'
import {TaskBlockView} from '/app/js/TaskBlockView'
import {TaskStartView} from '/app/js/TaskStartView'
import {FlowState} from 'FlowState'
import {FunctionLink} from 'FunctionLink'
import {TaskFlowDB} from 'TaskFlowDB'
import * as K from '/common/js/KeyMapping'
import {debounce} from '/common/js/throttle-debounce/index'

var M = ClickActor
var MC = MouseClicker
var N = NativeUtil

const MouseBtn = {
    Left: 1,
    Right: 2,
    Middle: 3
}

function o(str) {
    log(str, 'TaskFlowApp')
}

class TaskFlowApp extends TaskFlowElement {
    constructor(props, kids) {
        super()
        this.activeLink = undefined
        this.setTask()
        this.linkLineColor = '#80c3efcc'
        this.canvasScale = 1.0
        this.DebounceGenerateCanvasImage = debounce(300, false, this.generateCanvasImage)
        this.links = []
    }

    setTask() {
        var param = Window.this.parameters
        if (N.isAutoReload) param = { id: 'H0T4BXK3N0V91IEYE2GGEWVLJ' }
        o(`param.id=${param?.id}`)
        if (param == undefined || param.id == undefined) {
            this.flow = new TaskFlowInfo('temp_task_flow')
        } else {
            this.flow = TaskFlowDB.getTaskFlow(param.id)
        }
    }

    componentDidMount() {
        var self = this
        log('TaskFlowApp on mounted')
        self.configUI()
    }

    configUI() {
        var self = this
        var win = Window.this

        Window.share.flowState = FlowState.Idle

        self.configWindw()
        self.configTitleBtns()
        self.configCanvas()
        self.configFunctionBar()
        self.configMain()
        self.configFooter()
        self.configContextMenu()
    }

    configWindw() {
        var self = this
        var win = Window.this

        const [x, y, w, h] = win.box('xywh', 'border', 'desktop', true)
        const [sw, sh] = win.screenBox('workarea', 'dimension')

        N.isAutoReload ? win.move(x, y, 1200, 700) : win.move(-10000, -10000, 1920, 1000)

        if (!N.isAutoReload) centerWindow()

        // win.isTopmost = true
        win.state = Window.WINDOW_SHOWN
        if (N.isAutoReload) win.isTopmost = true

        var bg = $('#cavas_container')
        var [bx, by] = bg.state.box('position', 'border', 'window')
        o(`bg initial pos: ${bx}, ${by}`)
        self.bgX = bx
        self.bgY = by
    }

    configTitleBtns() {
        var self = this
        var win = Window.this

        self.configTaskName()
        $('#edit_task_info_block').on('click', () => {
            self.showEditTaskInfoDialog()
        })

        $('#close_btn').on('click', () => {
            win.close()
        })

        document.onGlobalEvent('TASK_FLOWS_UPDATED', e => {
            o(`on task flows updated`)
            self.configTaskName()
        })
    }

    configTaskName() {
        var self = this
        $('#edit_task_info_block label').innerHTML = self.flow.name
    }

    showEditTaskInfoDialog() {
        showModal('/app/edit_task_info.html', {flow: this.flow})
    }

    configFunctionBar() {
        var self = this
        o(`config function bar`)
        document.on('click', '#command_tree a', e => {
            self.generateRandomTaskBlock()
        })

        var toggler = document.getElementsByClassName("caret")
        for (var i = 0; i < toggler.length; i++) {
            toggler[i].addEventListener("click", function() {
                this.parentElement.querySelector(".nested").classList.toggle("active")
                this.classList.toggle("caret-down")
            });
        }
    }

    generateRandomTaskBlock() {
        var self = this
        o(`generate random task block`)
        var blk = new TaskBlockInfo(`random_fn_${Math.random() * 100}`)
        blk.move(600 * Math.random(), 400 * Math.random())
        o(`blk is: ${blk}`)
        self.addTaskBlockView(blk)
    }

    configMain() {
        var self = this
        $('#save_btn').on('click', () => {
            self.save()
        })
    }

    configFooter() {
        $('#status_label').innerHTML = @'Task flow name: {1}. Created time: {2}. Edit time: {3}'.format(this.flow.name, TU.getTimeString(this.flow.createdTime), TU.getTimeString(this.flow.editedTime))
    }

    save() {
        this.flow.save()
        Window.this.close()
    }

    configCanvas() {
        var self = this
        var win = Window.this

        var cvs = $('#canvas')
        self.ctx = cvs.getContext('2d')

        var bg = $('#canvas_frame')

        bg.on('mousedown', e => {
            self.onMouseDownBg(e)
        })

        bg.on('mouseup', e => {
            self.onMouseUpBg(e)
        })

        document.on('mousemove', e => {
            self.onMouseMoveDocument(e)
            self.onMouseMoveCanvas(e)
        })

        document.on('mousewheel', e => {
            self.onMouseWheelCanvas(e)
        })

        bg.on('mouseleave', e => {
            self.onMouseLeaveCanvas(e)
        })

        document.on('keyup', e => {
            self.onKeyUp(e)
        })

        document.on('keydown', e => {
            self.onKeyDown(e)
        })

        document.on('mouseup', e => {
            self.onMouseUp(e)
        })

        document.on('click', e => {
            self.onClickDocument(e)
        })

        document.onGlobalEvent('MOUSE_DOWN_TASK_BLOCK', e => {
            o(`on mouse down task block. state: ${Window.share.flowState}`)
            if (Window.share.flowState == FlowState.Idle) {
                self.startDrag(e)
            }
        })
        self.configTaskBlockViews()
        self.updateCanvas(true)
        self.generateCanvasImage()
    }

    onMouseDownBg(e) {
        var self = this
        o(`on mouse down canvas: ${e.button}`)

        if (e.button == MouseBtn.Left) {
            if (Window.share.hoveringItem == undefined) {
                o(`set flow state to frame-selecting`)
                Window.share.flowState = FlowState.FrameSelecting
                self.frameSelectionStartPonit = {x: e.clientX - self.bgX, y: e.clientY - self.bgY}
            }
        } else if (e.button == MouseBtn.Middle) {
            self.draggingCanvas = true
            self.canvasDraggingStartPoint = {x: e.clientX, y: e.clientY}

            var bg = $('#cavas_container')
            var [x, y] = bg.state.box('position', 'border', 'window')
            self.canvasInitialPoint = {x: x - self.bgX, y: y - self.bgY}

            o(`canvas initial pos: ${x}, ${y}`)
        }
    }

    onMouseUpBg(e) {
        o(`on mouse up canvas: ${e.button}`)
        if (e.button == MouseBtn.Middle) {
            this.draggingCanvas = false
        }
    }

    onMouseLeaveCanvas(e) {
        o(`on mouse leave canvas`)
        this.draggingCanvas = false
    }

    onMouseMoveDocument(e) {
        var self = this

        // o(`on mouse move background. draging canvas: ${self.draggingCanvas}`)
        if (this.draggingCanvas) {
            self.dragBackground(e)
        }

        // o(`on mouse move. state: ${Window.share.flowState}`)

        switch (Window.share.flowState) {
            case FlowState.Dragging:
                self.dragItem(e)
                self.DebounceGenerateCanvasImage()
                break;
            case FlowState.Linking:
                self.drawLinking(e)
                self.DebounceGenerateCanvasImage()
                break;
            case FlowState.FrameSelecting:
                self.drawFrameSelection(e)
                break;
            default:
                break;
        }
    }

    dragBackground(e) {
        var self = this
        var offset = {x: e.clientX - self.canvasDraggingStartPoint.x, y: e.clientY - self.canvasDraggingStartPoint.y}
        var bg = $('#cavas_container')

        var px = self.canvasInitialPoint.x + offset.x
        var py = self.canvasInitialPoint.y + offset.y
        bg.style.left = px
        bg.style.top = py

        // o(`move canvas to ${px}, ${py}`)
    }

    drawFrameSelection(e) {
        this.setFrameSelectionAction('draw', e)
        this.updateCanvas(false)
    }

    finishFrameSelection(e) {
        var self = this

        o(`finish frame selection`)

        var rect = self.setFrameSelectionAction('clear', e)
        self.updateFrameSelections(rect)

        Window.share.flowState = FlowState.Idle
    }

    cancelFrameSelecting() {
        var self = this
        o(`cancel frame selection`)

        self.updateFrameSelections({left: -10000, top: -100000, right: -100000, bottom: -10000})

        Window.share.flowState = FlowState.Idle
    }

    setFrameSelectionAction(action, e) {
        var self = this

        var cvs = $('#canvas')
        var ctx = cvs.getContext('2d')
        ctx.fillStyle = '#1074ad'

        var bg = $('#cavas_container')
        var [x, y] = bg.state.box('position', 'border', 'window')

        var width = (e.clientX - self.frameSelectionStartPonit.x) - self.bgX
        var height = (e.clientY - self.frameSelectionStartPonit.y) - self.bgY

        ctx.beginPath()
        // self.ctx.moveTo(start.x, start.y)

        var left = self.frameSelectionStartPonit.x - x + self.bgX
        var top = self.frameSelectionStartPonit.y - y + self.bgY
        var rect = {
            left: left,
            top: top,
            right: left + width,
            bottom: top + height
        }

        switch (action) {
            case 'draw':
                ctx.fillRect(rect.left, rect.top, width, height)
                break;
            case 'clear':
                ctx.clearRect(rect.left, rect.top, width, height)
                break;
        }

        ctx.stroke()

        return rect
    }

    updateFrameSelections(rect) {
        var self = this
        o(`update frame selections.`)
        var layer = $('#task_block_layer')
        for (var view of layer.childNodes) {
            // o(`block node: ${view}`)
            var [x0, y0, x1, y1] = view.state.box('rect', 'border', 'window')
            var sub = {left: x0 - self.bgX, top: y0 - self.bgY, right: x1 - self.bgX, bottom: y1 - self.bgY}
            var contains = self.rectContains(rect, sub)
            view.select(contains)
        }

        self.updateCanvas(false)
    }

    rectContains(con, sub) {
        var con_minX = Math.min(con.left, con.right)
        var con_maxX = Math.max(con.left, con.right)
        var con_minY = Math.min(con.bottom, con.top)
        var con_maxY = Math.max(con.bottom, con.top)

        var sub_minX = Math.min(sub.left, sub.right)
        var sub_maxX = Math.max(sub.left, sub.right)
        var sub_minY = Math.min(sub.bottom, sub.top)
        var sub_maxY = Math.max(sub.bottom, sub.top)

        return con_minX <= sub_minX && sub_maxX <= con_maxX &&
            con_minY <= sub_minY && sub_maxY <= con_maxY
    }

    onMouseWheelCanvas(e) {
        var self = this

        o(`on mouse wheel canvas. ${e.deltaY}`)

        self.canvasScale = self.canvasScale - e.deltaY / 12000.0 * 5
        o(`scale to ${self.canvasScale}`)
        $('#cavas_container').style.transform = `scale(${self.canvasScale})`
    }

    configTaskBlockViews() {
        var self = this
        var win = Window.this

        o(`config function items`)

        o(`self.flow.blocks: ${self.flow.blocks}`)
        for (var id in self.flow.blocks) {
            var blk = self.flow.blocks[id]
            self.addTaskBlockView(blk)
        }
    }

    addTaskBlockView(blk) {
        var self = this
        var layer = $('#task_block_layer')

        var view = undefined

        switch(blk.type) {
        	case TaskBlockType.Start:
        		view = <TaskStartView info={blk}/>
        		break;
        	default:
        		view = <TaskBlockView info={blk}/>
        		break;
        }

        layer.append(view)

        self.flow.addBlock(blk)
        self.updateDragTip()
    }

    rmvTaskBlockView(view) {
        var self = this
        var bg = $('#cavas_container')
        o(`removed TaskBlockView ${view.info.name}:${view.info.id}`)
        self.flow.rmvBlock(view.info.id)
        view.remove()
    }

    dragItem(e) {
        var self = this
        // o(`drag item: ${Window.share.draggingItem}`)
        if (Window.share.draggingItem != undefined) {
            Window.share.draggingItem.setPos(e.clientX - self.dragOffset.x, e.clientY - self.dragOffset.y)
            self.updateCanvas(true)
        }
    }

    drawLinking(e) {
        var self = this

        var link = {}

        if (Window.share.hoveringItem) {
            if (Window.share.hoveringItem == Window.share.linkStartItem) {
                // o(`hovering self item. skip drawing linking`)
            } else {
                var start = Window.share.linkStartItem.info?.getOutputPos()
                var item = Window.share.hoveringItem
                var stop = item.info.getInputPos()
                link = {start, stop}
                self.setActiveLink(link)
            }
        } else {
            var start = Window.share.linkStartItem.info?.getOutputPos()
            var stop = {x: e.clientX - self.bgX, y: e.clientY - self.bgY}
            link = {start, stop}
            self.setActiveLink(link)
        }
    }

    startDrag(e) {
        var self = this
        o(`start drag`)
        Window.share.flowState = FlowState.Dragging
        Window.share.draggingItem = e.data.item
        self.dragOffset = {
            x: e.data.event.clientX - e.data.item.info?.pos.x,
            y: e.data.event.clientY - e.data.item.info?.pos.y
        }
    }

    onClickDocument(e) {
        var self = this
        o(`on clicking document`)

        Window.share.flowState = FlowState.Idle
        self.cancelLinking()
        self.updateCanvas(true)
    }

    onMouseUp(e) {
        var self = this
        o(`flow on mouse up. state: ${Window.share.flowState}`)

        switch (Window.share.flowState) {
            case FlowState.Dragging:
                self.onDraggingMouseUp(e);
                break;
            case FlowState.Linking:
                self.onLinkingMouseUp(e);
                break;
            case FlowState.FrameSelecting:
                self.finishFrameSelection(e)
                break;
            default:
                break;
        }
    }

    onDraggingMouseUp(e) {
        var self = this
        self.stopDrag(e)
    }

    onLinkingMouseUp(e) {
        var self = this
        o(`on mouse up current hovering item: ${Window.share.hoveringItem}`)

        if (Window.share.hoveringItem == undefined) return
        if (Window.share.linkStartItem == undefined) return
        if (Window.share.hoveringItem == Window.share.linkStartItem) return

        var prev = Window.share.linkStartItem.info
        var next = Window.share.hoveringItem.info

        if (next.prev) {
            var origPrev = self.flow.getBlock(next.prev)
            origPrev.rmvNext(next.id)
        }

        next?.setPrev(prev)
        prev?.setNext(next)

        o(`after linking-up`)

        Window.share.flowState = FlowState.Idle
        self.updateCanvas(true)
    }

    stopDrag(e) {
        var self = this
        o(`stop drag`)
        Window.share.flowState = FlowState.Idle
        Window.share.draggingItem = undefined
    }

    onKeyUp(e) {
        var self = this
        o(`on key up: ${e.keyCode}`)
        if (e.keyCode == 256) // ESC
        {
            o(`on ESC key up`)

            switch (Window.share.flowState) {
                case FlowState.Linking:
                    self.cancelLinking();
                    break;
                case FlowState.Dragging:
                    self.stopDrag();
                    break;
            }

            self.cancelFrameSelecting()
        }
    }

    onKeyDown(e) {
        var self = this
        var m = K.getKeyMappingBySciterKeycode(e.keyCode)
        o(`on key ${m.name} down`)
        if (m.name == 'Delete') {
            var item = Window.share.hoveringItem
            if (item && item.info?.removable) {
                o(`removing TaskBlockView ${item.info.name}:${item.info.id}`)
                self.rmvTaskBlockView(item)
                self.updateCanvas(true)
                self.generateCanvasImage()
                self.updateDragTip()
            }
        }
    }

    updateDragTip() {
        var count = this.flow.getNumBlocks()
        o(`flow blocks count: ${count}`)
        $('#drag_tip').style.display = count > 0 ? 'none' : 'block'
    }

    setActiveLink(link) {
        var self = this

        // o(`set active link to ${link}`)

        self.activeLink = link
        self.updateCanvas(false)
    }

    cancelLinking() {
        var self = this
        o(`cancel linking`)
        Window.share.flowState = FlowState.Idle
        // Window.share.hoveringItem = undefined
        self.setActiveLink(undefined)
    }

    drawActiveLinking() {
        var self = this

        if (Window.share.flowState != FlowState.Linking) {
            return
        }

        self.ctx.lineWidth = 2
        self.ctx.strokeStyle = self.linkLineColor

        if (self.activeLink !== undefined) {
            // draw active linking
            FunctionLink.drawCurve(self.ctx, self.activeLink.start, self.activeLink.stop, '#80c3efcc')
        }
    }

    drawFunctionLinkings(restructLinks = false) {
        var self = this

        o(`draw function linkings. restruct links: ${restructLinks}`)

        self.ctx.lineWidth = 2
        self.ctx.strokeStyle = self.linkLineColor

        if (restructLinks) {
            self.links.length = 0
            for (var id in self.flow.blocks) {
                var blk = self.flow.blocks[id]
                o(`block ${blk.name} prev: ${blk.prev}`)
                if (blk.prev) {
                    var prev = self.flow.getBlock(blk.prev)
                    if (prev) {
                        var link = new FunctionLink()
                        link.setStartNode(prev)
                        link.setStopNode(blk)
                        link.setColor(self.linkLineColor)
                        link.draw(self.ctx)
                        self.links.push(link)
                    }
                }
            }
        } else {
            for (var link of self.links) {
                link.draw(self.ctx)
            }
        }
    }

    updateCanvas(restructLinks) {
        var self = this
        self.drawActiveLinking()
        self.drawFunctionLinkings(restructLinks)
    }

    generateCanvasImage() {
        var self = this
        var cvs = $('#canvas')
        var [w, h] = cvs.state.box('dimension', 'border', 'window')
        o(`draw canvas iamge. canvas size: ${w}, ${h}`)
        self.canvasImage = new Graphics.Image(w, h, cvs)
    }

    onMouseMoveCanvas(e) {
        var self = this
        // o(`on mouse move canvas: ${e.clientX}, ${e.clientY}`)
        if (self.canvasImage != undefined) {
            var cvs = $('#canvas')
            var [x, y] = cvs.state.box('position', 'border', 'window')

            var px = (e.clientX - x) / self.canvasScale
            var py = (e.clientY - y) / self.canvasScale

            // update corresponding link color
            var hoveredLinkName = ''
            for (var link of self.links) {
                var contains = link.contains({x: px, y: py})
                var thisLinkIsHovered = (contains && self.hoveringItem == undefined)
                if (thisLinkIsHovered) {
                    hoveredLinkName = link.getName()
                    self.hoveringLink = link
                }
                link.setColor(thisLinkIsHovered ? '#FFAB2A' : self.linkLineColor)
                // o(`${link.getName()} is hovered by ${px}, ${py}:${thisLinkIsHovered}. contains: ${contains}`)
            }

            if (hoveredLinkName != self.lastHoveredLinkName) {
                self.updateCanvas(false)
                self.lastHoveredLinkName = hoveredLinkName
            }

            if (hoveredLinkName == '') {
                self.hoveringLink = undefined
            }
        }
    }

    configContextMenu() {
        var self = this
        document.on('contextmenu', (evt) => {
            if (self.hoveringLink) {
                evt.source = Element.create(<menu.context id="remove_link_menus">
                    <li>Remove link</li>
                </menu>)
            }

            return true
        })

        document.on('click', 'menu.context#remove_link_menus>li', (evt, menuitem) => {
            o(`on click at remove link menu li ${menuitem}`)
            if (self.hoveringLink) {
                self.hoveringLink.startNode.setNext(undefined)
                self.hoveringLink.stopNode.setPrev(undefined)
                self.updateCanvas(true)
            }
        })
    }
}

document.body.patch(<TaskFlowApp/>)