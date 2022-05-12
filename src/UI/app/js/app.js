import log from '/common/js/Logger'
import {Database as DB} from '/common/js/Database'
import '/common/js/StringUtil'
import {$, $$, on} from '@sciter'
import * as C from 'Constants'
import * as B from '/common/js/BrandConfig'
import * as GC from '/common/js/Constants'
import {GlobalDef as G} from '/common/js/Global'
import * as env from '@env'
import {centerWindow, createToolWindow, showTipsWindow, showAskDialog, showModal} from '/common/js/WindowUtil'
import {e_call} from '/common/js/DebugUtil'
import * as KU from 'HotkeyUtil'
import * as K from '/common/js/KeyMapping'
import {ClickActor} from '/common/js/ClickActor'
import * as TU from '/common/js/TimeUtil'
import {MacrosDB} from '/app/js/MacrosDB'
import {TaskFlowDB} from '/app/js/TaskFlowDB'
import '/common/js/TimerCenter'

var N = NativeUtil
var M = ClickActor
var MC = MouseClicker

function o(str) {
    log(str, 'MainApp')
}

class MainApp extends AppElement {
    _fitWindowImmediately = false
    _lastClickedRepeatBtn = ClickRepeatType.RepeatLimitedTimes
    _lastClickedLocationType = ClickLocationType.CurrentLocation
    _lastClickLocationX = 0
    _lastClickLocationY = 0
    _clickButton = ''
    _clickType = ''

    componentDidMount() {
        this.init()
    }

    async init() {
        G.DefaultLogFilter = 'MainApp'

        o('app ui initializing....')

        o(`install dir: ${DB.get('install_dir')}`)

        this.initDocument()

        this.initTitle()

        this.listenCaptionBtns()

        this.setTabsMode()

        this.initBottomBar()

        this.listenToCloseEvent()

        this.setShareData()

        this.setWindowAutoFit()

        this.setWindowVisibility()

        this.handleStartupParam()
    }

    handleStartupParam() {
        var self = this
        var ars = DB.get('app_startup_param')
        DB.set('app_startup_param', '') // 第一时间清除启动参数避免影响后续启动
        if (ars != null && ars != undefined) {
            if (ars.indexOf('ShowVersionsList') >= 0) {
                o(`startup param contains ShowVersionsList command. so show versions panel`)
                createToolWindow('versions.html')
            }
        }
    }

    initDocument() {
        var self = this
        var win = Window.this

        o('init document')

        document.onGlobalEvent('RECORDING_STARTED', () => {
            o('MainApp on recording started')
            win.state = Window.WINDOW_HIDDEN
        })

        document.onGlobalEvent('RECORDING_STOPPED', () => {
            o('MainApp on recording stopped')
            win.state = Window.WINDOW_SHOWN

            // show macro tab
            $('select|switch#tabs').value = 'macro_mode'
            document.setAttribute('mode', 'macro_mode')
            self.refreshMacroMode()

            showModal('/app/save_macro.html')
        })

        document.onGlobalEvent('PLAY_MACRO_STARTED', () => {
            o(`MainApp on play macro started`)
            win.state = Window.WINDOW_MINIMIZED
        })

        document.onGlobalEvent('PLAY_MACRO_FINISHED', () => {
            o(`MainApp on play macro finished`)
            win.state = Window.WINDOW_SHOWN
        })

        $('#home_menu').on('click', async () => {
            await self.launchOfficialWebsite()
        })

        $('#about_menu').on('click', () => {
            createToolWindow('about.html')
        })
    }

    initTitle() {
        Window.this.N.setTitle(B.TranslatedBrandName)
    }

    async launchOfficialWebsite() {
        var site = `https://www.${B.Domain}`
        Window.this.state = Window.WINDOW_MINIMIZED
        env.launch(site)
    }

    initBottomBar() {
        o('init bottom bar')

        // search icon
        document.on('click', '#bottom_search_grid', async () => {
            Window.this.state = Window.WINDOW_MINIMIZED
            env.launch(@'search_url{1}'.format(B.TranslatedBrandName))
        })

        // official website
        $('#official_website_href').innerHTML = `www.${B.Domain}`
        document.on('click', '#official_website_href', async () => {
            await self.launchOfficialWebsite()
        })

        // version label
        $('#bottom_version_label').innerHTML = @'V{1}.{2}'.format(N.nativeVersion, B.UIVersion)

        document.on('click', '#bottom_about_btn', async () => {
            createToolWindow('about.html')
        })
    }

    listenCaptionBtns() {
        var win = Window.this

        $('#min_btn').on('click', async () => {
            o('on click min btn')
            win.state = Window.WINDOW_MINIMIZED
            return true;
        })

        $('#close_btn').on('click', async () => {
            o('on click close btn')
            win.N.hideFromTaskBar()
            return true;
        })
    }

    setTabsMode() {
        var self = this

        self.initClickMode()
        self.initMacroMode()
        self.initTaskMode()
        self.initMarketMode()
        self.initToolMode()

        document.on('change', 'select|switch#tabs', function (evt, select) {
            o(`on select tab: ${select.value}`)
            document.setAttribute('mode', select.value)

            switch (select.value) {
                case 'click_mode':
                    self.refreshClickMode();
                    break;
                case 'macro_mode':
                    self.refreshMacroMode();
                    break;
                case 'task_mode':
                    self.refreshTaskMode();
                    break;
                case 'market_mode':
                    self.refreshMarketMode();
                    break;
                case 'tool_mode':
                    self.refreshToolMode();
                    break;
                default:
                    break;
            }
        })

        document.setAttribute('mode', 'click_mode')
        self.refreshClickMode()
    }

    async initClickMode() {
        o(`init click mode`)
        // click settings
        await this.initClickInterval()
        await this.initClickButton()
        await this.initClickType()
        await this.initRepeatType()
        await this.initClickHotKey()
        await this.initClickLocation()

        // record settings
        await this.initRecordBtn()
    }

    adjustWindowLayout(tabs_align) {
        TimerCenter.setTimeout(() => {
            $('#tabs_line').style['horizontal-align'] = tabs_align
        }, 1000)
    }

    refreshClickMode() {
        this.adjustWindowLayout('left')
    }

    initMacroMode() {
        var self = this

        $('#record_macro_btn').on('click', async e => {
            M.startRecording()
        })

        $('#empty_macros_tip a').on('click', async e => {
            M.startRecording()
        })

        $('#clear_all_macros_btn').on('click', () => {
            self.clearAllMacros()
        })

        document.onGlobalEvent('MACROS_UPDATED', () => {
            o(`on macros list updated`)
            self.refreshMacroMode()
        })
    }

    clearAllMacros() {
        var self = this
        o(`clear all macros`)
        let macros = DB.get('recorded_macros')

        if (macros == undefined || macros.length <= 0) {
            o(`there's no any recorded macros. skip`)
            return
        }

        var ret = showAskDialog(@'Confirm', @'Are you sure to clear all macros? This action cannot be undone')
        o(`confirm clear macros: ${ret}`)
        if (ret == true) {
            o(`to-delete macro num: ${macros.length}`)
            var ids = []
            for (var mac of macros) {
                ids.push(mac.id)
            }

            for (var id of ids) {
                self.deleteMacroById(id, false)
            }
            self.refreshMacroMode()
        }
    }

    refreshMacroMode() {
        o(`refresh macro mode`)

        var self = this
        var win = Window.this

        var macros = DB.get('recorded_macros')
        o(`recorded macros: ${macros}`)

        $('#empty_macros_tip').style.visibility = ((macros == undefined || macros.length <= 0) ? 'visible' : 'hidden')

        var edit_tip = @'Double click to edit'
        var replay_macro_tip = @'Replay this macro'
        var edit_macro_tip = @'Edit this macro'
        var schedule_macro_tip = @'Schedule this macro'
        var delete_macro_tip = @'Delete this macro'

        var list = []
        if (macros !== undefined && macros !== null) {
            for (var mac of macros) {
                var hotkey = (mac.hotkeyVkCode == undefined || mac.hotkeyVkCode <= 0 ? @'None' : K.getKeyNameByVkCode(mac.hotkeyVkCode))
                list.push(
                    <tr class="table_row" data-id={mac.id} title={edit_tip}>
                        <td class="time_td" data-id={mac.id}>{TU.getTimeString(mac.createdTime)}</td>
                        <td data-id={mac.id}>{mac.name}</td>
                        <td class="duration_td" data-id={mac.id}>{TU.getSecsString(mac.duration)}</td>
                        <td class="hotkey_td" data-id={mac.id}>{hotkey}</td>
                        <td class="macro_operations_group" data-id={mac.id}>
                            <img class="macro_btn play" src="img/play.svg" title={replay_macro_tip} data-id={mac.id}/>
                            <img class="macro_btn edit" src="img/edit.svg" title={edit_macro_tip} data-id={mac.id}/>
                            <img class="macro_btn schedule" src="img/schedule.svg" title={schedule_macro_tip} data-id={mac.id}/>
                            <img class="macro_btn delete" src="img/delete.svg" title={delete_macro_tip} data-id={mac.id}/>
                        </td>
                    </tr>)
            }
        }

        document.$("table#macro_table>tbody").content(list)

        if (macros !== undefined && macros !== null) {
            // handle play
            var macro_play_btns = document.$$('table#macro_table .macro_btn.play')
            if (macro_play_btns != undefined) {
                o(`listen to macro play buttons: ${macro_play_btns}`)
                for (var btn of macro_play_btns) {
                    btn.on('click', (evt, ele) => {
                        var id = ele.attributes['data-id']
                        o(`on click play macro: ${id}`)
                        self.playMacroById(id)
                    })
                }
            }

            // handle double click
            var macro_tds = document.$$('table#macro_table .table_row td')
            if (macro_tds != undefined) {
                o(`listen to macro tds`)
                for (var td of macro_tds) {
                    td.on('dblclick ', (evt, ele) => {
                        o(`on double click ele: ${ele}. event: ${evt}`)
                        var id = ele.attributes['data-id']
                        o(`on click macro row: ${id}`)
                        self.editMacroById(id)
                    })
                }
            }

            // handle edit
            var macro_edit_btns = document.$$('table#macro_table .macro_btn.edit')
            if (macro_edit_btns != undefined) {
                o(`listen to macro edit buttons: ${macro_edit_btns}`)
                for (var btn of macro_edit_btns) {
                    btn.on('click', (evt, ele) => {
                        var id = ele.attributes['data-id']
                        o(`on click edit macro: ${id}`)
                        self.editMacroById(id)
                    })
                }
            }

            // handle schedule
            var macro_schedule_btns = document.$$('table#macro_table .macro_btn.schedule')
            if (macro_schedule_btns != undefined) {
                o(`listen to macro schedule buttons: ${macro_schedule_btns}`)
                for (var btn of macro_schedule_btns) {
                    btn.on('click', (evt, ele) => {
                        var id = ele.attributes['data-id']
                        o(`on click schedule macro: ${id}`)
                        showTipsWindow(@'Tips', @'This function is under development. Stay tuned...')
                    })
                }
            }

            // handle delete
            var macro_delete_btns = document.$$('table#macro_table .macro_btn.delete')
            if (macro_delete_btns != undefined) {
                o(`listen to macro delete buttons: ${macro_delete_btns}`)
                for (var btn of macro_delete_btns) {
                    btn.on('click', (evt, ele) => {
                        var id = ele.attributes['data-id']
                        o(`on click delete macro: ${id}`)
                        self.deleteMacroById(id, true)
                    })
                }
            }
        }

        this.adjustWindowLayout('center')
    }

    playMacroById(id) {
        var self = this
        o(`play macro by id: ${id}`)
        var ret = MacrosDB.getMacroById(id)
        if (ret != undefined) {
            o(`found to play macro index: ${ret.index}`)
            if (ret.index != -1 && ret.index != undefined) {
                M.startPlaying(ret.macro)
            }
        }
    }

    playTaskById(id) {
        var self = this
        o(`play task by id: ${id}`)
    }

    editMacroById(id) {
        var self = this
        o(`edit macro by id: ${id}`)
        var ret = MacrosDB.getMacroById(id)
        if (ret != undefined) {
            o(`found to edit macro index: ${ret.index}`)
            if (ret.index != -1 && ret.index != undefined) {
                showModal('macro.html', {macro: ret.macro})
            }
        }
    }

    editTaskById(id) {
        var self = this
        o(`edit task by id: ${id}`)
        var flow = TaskFlowDB.getTaskFlow(id)
        if (flow != undefined) {
            o(`found to edit task flow: ${flow.name}:${flow.id}`)
            showModal('flow.html', {id: flow.id})
        }
    }

    deleteMacroById(id, refreshView) {
        var self = this
        MacrosDB.deleteMacroById(id)
        if (refreshView) self.refreshMacroMode()
    }

    deleteTaskById(id, refreshView) {
        var self = this
        TaskFlowDB.deleteTaskFlow(id)
        if (refreshView) self.refreshTaskMode()
    }

    initTaskMode() {
        var self = this
        o(`init task mode`)
        $('#create_task_btn').on('click', () => {
            o(`on click create-task button`)
            self.createTaskFlowWindow()
        })
        $('#empty_tasks_tip a').on('click', () => {
            o(`on click create-one-task button`)
            self.createTaskFlowWindow()
        })

        document.onGlobalEvent('TASK_FLOWS_UPDATED', e => {
            o(`on task flows updated`)
            self.refreshTaskMode()
        })
    }

    createTaskFlowWindow() {
        showTipsWindow(@'Tips', @'This function is in Early Access state and can just be used for testing purpose.')
        showModal('/app/flow.html')
    }

    refreshTaskMode() {
        var self = this
        var win = Window.this

        var flows = TaskFlowDB.getTaskFlows()

        var count = TaskFlowDB.getTaskFlowCount()
        $('#empty_tasks_tip').style.visibility = (count <= 0 ? 'visible' : 'hidden')

        var edit_tip = @'Double click to edit'
        var replay_flow_tip = @'Replay this task flow'
        var edit_flow_tip = @'Edit this task flow'
        var delete_flow_tip = @'Delete this task flow'

        var list = []
        if (count > 0) {
            for (var id in flows) {
                var flow = flows[id]
                list.push(
                    <tr class="table_row" data-id={flow.id} title={edit_tip}>
                        <td class="time_td" data-id={flow.id}>{TU.getTimeString(flow.createdTime)}</td>
                        <td className="edit_td" data-id={flow.id}>{TU.getTimeString(flow.editedTime)}</td>
                        <td data-id={flow.id}>{flow.name}</td>
                        <td class="task_operations_group" data-id={flow.id}>
                            <img class="macro_btn play" src="img/play.svg" title={replay_flow_tip} data-id={flow.id}/>
                            <img class="macro_btn edit" src="img/edit.svg" title={edit_flow_tip} data-id={flow.id}/>
                            <img class="macro_btn delete" src="img/delete.svg" title={delete_flow_tip} data-id={flow.id}/>
                        </td>
                    </tr>)
            }
        }

        document.$("table#task_table>tbody").content(list)

        if (count > 0) {
            // handle play
            var task_play_btns = document.$$('table#task_table .macro_btn.play')
            if (task_play_btns != undefined) {
                o(`listen to task play buttons: ${task_play_btns}`)
                for (var btn of task_play_btns) {
                    btn.on('click', (evt, ele) => {
                        var id = ele.attributes['data-id']
                        o(`on click play task: ${id}`)
                        self.playTaskById(id)
                    })
                }
            }

            // handle double click
            var task_tds = document.$$('table#task_table .table_row td')
            if (task_tds != undefined) {
                o(`listen to task tds`)
                for (var td of task_tds) {
                    td.on('dblclick ', (evt, ele) => {
                        o(`on double click ele: ${ele}. event: ${evt}`)
                        var id = ele.attributes['data-id']
                        o(`on click task row: ${id}`)
                        self.editTaskById(id)
                    })
                }
            }

            // handle edit
            var task_edit_btns = document.$$('table#task_table .macro_btn.edit')
            if (task_edit_btns != undefined) {
                o(`listen to task edit buttons: ${task_edit_btns}`)
                for (var btn of task_edit_btns) {
                    btn.on('click', (evt, ele) => {
                        var id = ele.attributes['data-id']
                        o(`on click edit task: ${id}`)
                        self.editTaskById(id)
                    })
                }
            }

            // handle delete
            var task_delete_btns = document.$$('table#task_table .macro_btn.delete')
            if (task_delete_btns != undefined) {
                o(`listen to task delete buttons: ${task_delete_btns}`)
                for (var btn of task_delete_btns) {
                    btn.on('click', (evt, ele) => {
                        var id = ele.attributes['data-id']
                        o(`on click delete task: ${id}`)
                        self.deleteTaskById(id, true)
                    })
                }
            }
        }

        this.adjustWindowLayout('center')
    }

    initToolMode() {

    }

    refreshToolMode() {
        this.adjustWindowLayout('center')
    }

    initMarketMode() {

    }

    refreshMarketMode() {
        this.adjustWindowLayout('center')
    }

    async initRecordBtn() {
        o('init record btn')

        var self = this
        var win = Window.this

        var keys = KU.getRecordHotkeyStr()
        self.setRecordHotkeyLabel(keys)
    }

    async initClickInterval() {
        o('init click interval')

        var self = this

        var hours = 0
        var minutes = 0
        var seconds = 0
        var millis = 0

        // hours interval
        hours = DB.get(GC.KeyName.ClickInterval.HourValue)
        if (hours === undefined || hours === null) hours = GC.DefaultClickIntervalHours
        $('#hour_interval').value = hours
        $('#hour_interval').on('input', async (evt, ele) => {
            hours = parseInt(ele.value)
            if (isNaN(hours)) {
                hours = 0
                ele.value = hours
            }
            await self.setClickInterval(hours, minutes, seconds, millis, true)
        })

        // minutes interval
        minutes = DB.get(GC.KeyName.ClickInterval.MinuteValue)
        if (minutes === undefined || minutes === null) minutes = GC.DefaultClickIntervalMinutes
        $('#minute_interval').value = minutes
        $('#minute_interval').on('input', async (evt, ele) => {
            minutes = parseInt(ele.value)
            if (isNaN(minutes)) {
                minutes = 0
                ele.value = minutes
            }
            await self.setClickInterval(hours, minutes, seconds, millis, true)
        })

        // seconds interval
        seconds = DB.get(GC.KeyName.ClickInterval.SecondValue)
        if (seconds === undefined || seconds === null) seconds = GC.DefaultClickIntervalSeconds
        $('#second_interval').value = seconds
        $('#second_interval').on('input', async (evt, ele) => {
            seconds = parseInt(ele.value)
            if (isNaN(seconds)) {
                seconds = 0
                ele.value = seconds
            }
            await self.setClickInterval(hours, minutes, seconds, millis, true)
        })

        // milliseconds interval
        millis = DB.get(GC.KeyName.ClickInterval.MillisecondValue)
        if (millis === undefined || millis === null) millis = GC.DefaultClickIntervalMilliseconds
        $('#millisecond_interval').value = millis
        $('#millisecond_interval').on('input', async (evt, ele) => {
            millis = parseInt(ele.value)
            if (isNaN(millis)) {
                millis = 1
                ele.value = millis
            }
            await self.setClickInterval(hours, minutes, seconds, millis, true)
        })

        await self.setClickInterval(hours, minutes, seconds, millis, false)
    }

    async setClickInterval(hours, minutes, seconds, millis, fromHuman) {
        if (isNaN(hours)) hours = 0
        if (isNaN(minutes)) minutes = 0
        if (isNaN(seconds)) seconds = 0
        if (isNaN(millis)) millis = 1

        DB.set(GC.KeyName.ClickInterval.HourValue, hours)
        DB.set(GC.KeyName.ClickInterval.MinuteValue, minutes)
        DB.set(GC.KeyName.ClickInterval.SecondValue, seconds)
        DB.set(GC.KeyName.ClickInterval.MillisecondValue, millis)

        var total = hours * 3600 * 1000 + minutes * 60 * 1000 + seconds * 1000 + millis
        o(`set click interval. total=${total} h=${hours} m=${minutes} s=${seconds} ms=${millis}`)
        M.setClickInterval(total)
    }

    async initClickButton() {
        o('init click button')

        var self = this

        var btn = DB.get(GC.KeyName.ClickButton)
        if (btn === undefined || btn === null) btn = ClickButton.Left
        await self.setMouseClickButton(btn, false)

        document.on('change', '#click_button_select', async (evt, ele) => {
            o(`on select click button to ${ele.value}`)
            await self.setMouseClickButton(ele.value, true)
        })
    }

    async setMouseClickButton(btn, fromHuman) {
        o(`setMouseClickButton=${btn}`)
        document.$(`#click_button_select`).value = `${btn}`
        DB.set(GC.KeyName.ClickButton, btn)
        M.setClickButton(parseInt(btn))

        // update button text
        if (btn === ClickButton.Left) this._clickButton = @'Left Button'
        if (btn === ClickButton.Middle) this._clickButton = @'Middle Button'
        if (btn === ClickButton.Right) this._clickButton = @'Right Button'
        if (btn === ClickButton.Side) this._clickButton = @'Side Button'

        this.refreshClickTipText()
    }

    async initClickType() {
        o('init click type')

        var self = this

        var type = DB.get(GC.KeyName.ClickType) || ClickType.OneClick
        await self.setMouseClickType(type, false)

        document.on('change', '#click_type_select', async (evt, ele) => {
            o(`on select click type to ${ele.value}`)
            await self.setMouseClickType(ele.value, true)
        })
    }

    async setMouseClickType(type, fromHuman) {
        o(`setMouseClickType=${type}`)
        document.$(`#click_type_select`).value = `${type}`
        DB.set(GC.KeyName.ClickType, type)
        M.setClickType(parseInt(type))

        // update click type
        if (type == ClickType.OneClick) this._clickType = @'Single Click'
        if (type == ClickType.DoubleClick) this._clickType = @'Double Click'

        this.refreshClickTipText()
    }

    async initRepeatType() {
        o('init repeat type')

        var self = this

        var type = DB.get(GC.KeyName.RepeatType)
        if (type === undefined || type === null) type = ClickRepeatType.RepeatUntilStopped
        self._lastClickedRepeatBtn = type
        await self.setClickRepeatType(type, false)

        var times = DB.get(GC.KeyName.RepeatTimes) || GC.DefaultClickRepeatTimes
        await self.setClickRepeatTimes(times, false)

        document.on('click', '#click_repeat_group li', async (evt, ele) => {
            self._lastClickedRepeatBtn = ele.nodeIndex
            await self.setClickRepeatType(parseInt(ele.nodeIndex), true)
        })

        // repeat times input handling
        document.on('focus', '#repeat_time_input', async (evt, ele) => {
            o('on click repeat time input')
            await self.setClickRepeatType(ClickRepeatType.RepeatLimitedTimes, true)
        })
        document.on('change', '#repeat_time_input', async (evt, ele) => {
            o('on click repeat time input')
            await self.setClickRepeatType(ClickRepeatType.RepeatLimitedTimes, true)
            await self.setClickRepeatTimes(parseInt(ele.value), true)
        })
    }

    async setClickRepeatType(type, fromHuman) {
        var self = this
        o(`setClickRepeatType to ${type}`)
        o(`last clicked repeat type: ${self._lastClickedRepeatBtn}`)
        DB.set(GC.KeyName.RepeatType, type)
        document.$(`#click_repeat_group li:nth-child(${self._lastClickedRepeatBtn + 1})`).state.checked = false
        document.$(`#click_repeat_group li:nth-child(${type + 1})`).state.checked = true

        M.setClickRepeatType(type)
    }

    async setClickRepeatTimes(times, fromHuman) {
        DB.set(GC.KeyName.RepeatTimes, times)
        document.$(`#repeat_time_input`).value = `${times}`
        M.setRepeatTimes(times)
    }

    async initClickLocation() {
        o('init click location')
        var self = this
        var win = Window.this

        var type = DB.get(GC.KeyName.ClickLocationType)
        if (type === undefined || type === null) type = ClickLocationType.CurrentLocation
        await self.setClickLocationType(type, false)

        var x = DB.get(GC.KeyName.ClickLocationX) || 0
        var y = DB.get(GC.KeyName.ClickLocationY) || 0
        await self.setClickLocationPos(x, y)

        document.on('click', '#cursor_location_ul li', async (evt, ele) => {
            var type = parseInt(ele.nodeIndex)
            self.setClickLocationType(type, true)
        })

        // location pos input handling
        document.on('click', '#pick_location_btn', async (e, ele) => {
            o('on click pick-location btn')
            o(`main window on click pick_location_btn. screen: ${win.screen}. screenX: ${e.screenX} screenY: ${e.screenY}`)
            createToolWindow('pick.html')
            await self.setClickLocationType(ClickLocationType.PickedLocation, true)
            win.state = Window.WINDOW_MINIMIZED
        })
        document.onGlobalEvent('FINISH_PICKING', async (e) => {
            o('main window on receive FINISH_PICKING')
            win.state = Window.WINDOW_SHOWN
            var cx = N.getCursorX()
            var cy = N.getCursorY()
            await self.setClickLocationPos(cx, cy)
        })
        document.on('focus', '#location_x_input', async (evt, ele) => {
            o('on click location x focus')
            await self.setClickLocationType(ClickLocationType.PickedLocation, true)
        })
        document.on('focus', '#location_y_input', async (evt, ele) => {
            o('on click location y focus')
            await self.setClickLocationType(ClickLocationType.PickedLocation, true)
        })
        document.on('change', '#location_x_input', async (evt, ele) => {
            o('on click repeat x input')
            await self.setClickLocationType(ClickLocationType.PickedLocation, true)
            await self.setClickLocationPos(parseInt(ele.value), self._lastClickLocationY, true)
        })
        document.on('change', '#location_y_input', async (evt, ele) => {
            o('on click location y input')
            await self.setClickLocationType(ClickLocationType.PickedLocation, true)
            await self.setClickLocationPos(self._lastClickLocationX, parseInt(ele.value), true)
        })
    }

    async setClickLocationType(type, fromHuman) {
        var self = this
        o(`setClickLocationType to ${type}`)
        DB.set(GC.KeyName.ClickLocationType, type)
        $(`#cursor_location_ul li:nth-child(${self._lastClickedLocationType + 1})`).state.checked = false
        $(`#cursor_location_ul li:nth-child(${type + 1})`).state.checked = true
        self._lastClickedLocationType = type
        M.setClickLocationType(type)
    }

    async setClickLocationPos(x, y) {
        var self = this
        o(`setClickLocationPos to ${x} ${y}`)
        DB.set(GC.KeyName.ClickLocationX, x)
        DB.set(GC.KeyName.ClickLocationY, y)
        self._lastClickLocationX = x
        self._lastClickLocationY = y
        $('#location_x_input').value = `${x}`
        $('#location_y_input').value = `${y}`
        M.setClickPos(x, y)
    }

    async initClickHotKey() {
        o('init click hotkey')

        var self = this
        var win = Window.this

        var keys = KU.getClickHotkeyStr()
        self.setClickHotkeyLabel(keys)
        // $('#click_hotkey_select').value = `${key.index}`
        this.refreshClickTipText()

        $('#start_btn').on('click', () => {
            M.startClicking()
        })

        $('#stop_btn').on('click', () => {
            M.stopClicking()
        })

        $('#hotkey_setting_btn').on('click', async () => {
            o(`MainApp on click hotkey-setting button. show hotkey window`)
            win.modal({url: 'hotkey.html', state: Window.WINDOW_HIDDEN, x: -10000})
            o(`after hotkey panel closed. MainApp get click hotkey str...`)
        })

        document.onGlobalEvent('click_hotkey_setted', async e => {
            var keys = KU.getClickHotkeyStr()
            self.setClickHotkeyLabel(keys)
        })

        $('#record_and_playback_btn').on('click', async () => {
            M.startRecording()
        })
    }

    setClickHotkeyLabel(keys) {
        $('#start_btn').innerHTML = @'Start ({1})'.format(keys)
        $('#stop_btn').innerHTML = @'Stop ({1})'.format(keys)
    }

    setRecordHotkeyLabel(keys) {
        $('#record_and_playback_btn').innerHTML = @'Record & Playback ({1})'.format(keys)
    }

    refreshClickTipText(started) {
        var self = this
        // $('#click_tip_label').innerHTML = @'Press <span style=\'{1}\'>{2}</span> key to start/stop {3} {4}'.format(GC.hotkey_span_style, self._clickHotKey, self._clickButton, self._clickType)
    }

    listenToCloseEvent() {
        document.on('beforeunload', () => {
            o('mian window on before unload. remove from global share')
            Window.share.mainWindow = null
        })

        document.onGlobalEvent('fake_quit_app', e => {
            o('MainApp window on receive fake_quit_app event. close me')
            Window.this.close()
        })
    }

    setShareData() {
        var win = Window.this
        Window.share.mainWindow = win
        Window.share.mainHwnd = win.N.hwnd()
        o(`main window set share data. mainHwnd=${Window.share.mainHwnd.toString(16)}`)
    }

    setWindowVisibility() {
        var self = this
        var win = Window.this
        if (win.N.showOnLoaded) {
            self.doShowWindow()
        }
    }

    doShowWindow() {
        var win = Window.this
        o('app main window do show')
        // if (!N.isAutoReload) centerWindow()
        // win.state = Window.WINDOW_SHOWN

        // o('app main window set to topmost')
        // if (N.canMainWindowTopmost) win.isTopmost = true

        o('app main window post shown event')
        Window.post(new Event('main_window_shown'))
    }
}

document.body.patch(<MainApp/>)