import log from '/common/js/Logger'
import {MouseMsg} from '/common/js/MouseMsg'
import * as GC from 'Constants'
import {Database as DB} from '/common/js/Database'
import * as K from 'KeyMapping'
import '/common/js/TimerCenter'
import {centerWindow, createToolWindow, showTipsWindow} from '/common/js/WindowUtil'

var N = NativeUtil
var MC = MouseClicker
var NA = NativeActor

// 键鼠执行器在任一时刻只能处于以下其中一种状态
const ActorState = {
    Idle: 0,		// 空闲
    Clicking: 1,	// 自动点击中
    Picking: 2,		// 拾取鼠标位置中
    Recording: 3, 	// 录制中
    Replaying: 4 	// 回放中
}

function o(str) {
    log(str, 'ClickActor')
}

class MyClickActor {
    // auto-click hotkeys
    _clickHotkeyVkCode = 119	// vk code of F8 key
    _clickHotkeyCtrl = false
    _clickHotkeyShift = false
    _clickHotkeyAlt = false

    // picking hotkey
    _pickHotkeyVkCode = 27		// vk code of ESC key

    // recording hotkeys
    _recordHotkeyVkCode = 121	// vk code of F10 key
    _recordHotkeyCtrl = false
    _recordHotkeyShift = false
    _recordHotkeyAlt = false

    // replaying hotkeys
    _replayHotkeyVKCode = 121 	// vk code of F10 key
    _replayHotkeyCtrl = false
    _replayHotkeyShift = false
    _replayHotkeyAlt = false

    _clickInterval = 1
    _clickButton = ClickButton.Left

    _clickType = ClickType.OneClick
    _clickRepeatType = ClickRepeatType.RepeatLimitedTimes
    _clickRepeatTimes = 10

    _clickLocationType = ClickLocationType.CurrentLocation
    _clickPosX = 0
    _clickPosY = 0
    _cursorXBeforeClicking = 0
    _cursorYBeforeClicking = 0
    _clickTimer = 0

    _state = ActorState.Idle

    constructor() {
        this.init()
    }

    init() {
        var self = this

        o(`ClickActor init`)

        MC.installInputHook()
        document.on('beforeunload', this.onBeforeUnload)

        document.onGlobalEvent('BROADCAST_KEYDOWN', e => self.onKeyDown(e))
        document.onGlobalEvent('BROADCAST_MOUSEDOWN', e => self.onMouseDown(e))
        document.onGlobalEvent('BROADCAST_MOUSE_POS', e => self.onMousePos(e))
        document.onGlobalEvent('NATIVE_AUTOCLICK_STOPPED', e => self.onNativeAutoClickStopped(e))

        self.initHotkeys()
    }

    onBeforeUnload(e) {
        o('ClickActor on before unload')
        MC.unstallInputHook()
    }

    initHotkeys() {
        var self = this
        o(`ClickActor init hotkeys`)
        self.initClickHotkey()
        self.initRecordHotkey()
        self.initReplayHotkey()
    }

    initClickHotkey() {
        var self = this
        var ctrl = DB.get(GC.KeyName.ClickHotCtrl) || false
        var shift = DB.get(GC.KeyName.ClickHotShift) || false
        var alt = DB.get(GC.KeyName.ClickHotAlt) || false
        var code = DB.get(GC.KeyName.ClickHotKey) || GC.DefaultClickHotkey
        var m = K.getKeyMappingByVkKeycode(code)
        self.setClickHotkey(m.vkCode, ctrl, shift, alt)
    }

    initRecordHotkey() {
        var self = this
        var ctrl = DB.get(GC.KeyName.RecordHotCtrl) || false
        var shift = DB.get(GC.KeyName.RecordHotShift) || false
        var alt = DB.get(GC.KeyName.RecordHotAlt) || false
        var code = DB.get(GC.KeyName.RecordHotKey) || GC.DefaultRecordHotkey
        var m = K.getKeyMappingByVkKeycode(code)
        self.setRecordHotkey(m.vkCode, ctrl, shift, alt)
    }

    initReplayHotkey() {
        var self = this
        var ctrl = DB.get(GC.KeyName.RecordHotCtrl) || false
        var shift = DB.get(GC.KeyName.RecordHotShift) || false
        var alt = DB.get(GC.KeyName.RecordHotAlt) || false
        var code = DB.get(GC.KeyName.RecordHotKey) || GC.DefaultRecordHotkey
        var m = K.getKeyMappingByVkKeycode(code)
        self.setReplayHotkey(m.vkCode, ctrl, shift, alt)
    }

    saveClickHotkey(key, ctrl, shift, alt) {
        var self = this

        var m = K.getKeyMappingByVkKeycode(key)
        o(`save click hotkey start... name: ${m.name}. key: ${key}. ctrl=${ctrl}. shift=${shift}. alt=${alt}`)

        self._clickHotkeyVkCode = key
        self._clickHotkeyCtrl = ctrl
        self._clickHotkeyShift = shift
        self._clickHotkeyAlt = alt

        DB.set(GC.KeyName.ClickHotKey, key)
        DB.set(GC.KeyName.ClickHotCtrl, ctrl)
        DB.set(GC.KeyName.ClickHotShift, shift)
        DB.set(GC.KeyName.ClickHotAlt, alt)

        o(`save click hotkey done!`)
    }

    saveRecordHotkey(key, ctrl, shift, alt) {
        var self = this
        o(`save record hotkey start...`)

        self._recordHotkeyVkCode = key
        self._recordHotkeyCtrl = ctrl
        self._recordHotkeyShift = shift
        self._recordHotkeyAlt = alt

        DB.set(GC.KeyName.RecordHotKey, key)
        DB.set(GC.KeyName.RecordHotCtrl, ctrl)
        DB.set(GC.KeyName.RecordHotShift, shift)
        DB.set(GC.KeyName.RecordHotAlt, alt)

        o(`save record hotkey done!`)
    }

    saveReplayHotkey(key, ctrl, shift, alt) {
        var self = this
        o(`save replay hotkey start...`)

        self._replayHotkeyVkCode = key
        self._replayHotkeyCtrl = ctrl
        self._replayHotkeyShift = shift
        self._replayHotkeyAlt = alt

        DB.set(GC.KeyName.ReplayHotKey, key)
        DB.set(GC.KeyName.ReplayHotCtrl, ctrl)
        DB.set(GC.KeyName.ReplayHotShift, shift)
        DB.set(GC.KeyName.ReplayHotAlt, alt)

        o(`save replay hotkey done!`)
    }

    onKeyDown(e) {
        var self = this
        // o(`on key down. key: ${e.data.key}. curent state: ${self._state}`)
        switch (self._state) {
            case ActorState.Idle:
                self.handleIdleKeyDown(e);
                break;
            case ActorState.Clicking:
                self.handleClickingKeydown(e);
                break;
            case ActorState.Picking:
                self.handlePickingKeyDown(e);
                break;
            case ActorState.Recording:
                self.handleRecordingKeyDown(e);
                break;
            case ActorState.Replaying:
                self.handleReplayingKeyDown(e);
                break;
            default:
                self.handleUnknownStateKeyDown(e);
                break;
        }
    }

    onMouseDown(e) {
        var self = this
        // o(`on mouse down. msg: ${e.data.msg}. curent state: ${self._state}`)
        switch (self._state) {
            case ActorState.Picking:
                self.handlePickingMouseDown(e);
                break;
            default:
                break;
        }
    }

    onMousePos(e) {
        var self = this
        switch (self._state) {
            case ActorState.Picking:
                self.handlePickingMousePos(e);
                break;
            case ActorState.Recording:
                self.handleRecordingMousePos(e);
                break;
            case ActorState.Replaying:
                self.handleReplayingMousePos(e);
                break;
            default:
                break;
        }
    }

    isPressingClickHotkey(key) {
        var self = this
        var combinedKeysMatched = (MC.ctrlPressed == self._clickHotkeyCtrl && MC.shiftPressed == self._clickHotkeyShift && MC.altPressed == self._clickHotkeyAlt)
        var pressing = combinedKeysMatched && (key == self._clickHotkeyVkCode)
        return pressing
    }

    isPressingPickHotkey(key) {
        var self = this
        var pressing = (key == self._pickHotkeyVkCode)
        return pressing
    }

    isPressingRecordHotkey(key) {
        var self = this
        var combinedKeysMatched = (MC.ctrlPressed == self._recordHotkeyCtrl && MC.shiftPressed == self._recordHotkeyShift && MC.altPressed == self._recordHotkeyAlt)
        var pressing = combinedKeysMatched && (key == self._recordHotkeyVkCode)
        return pressing
    }

    handleIdleKeyDown(e) {
        var self = this

        // o(`on idle key down: ${e.data.key}`)

        switch (e.data.key) {
            case self._clickHotkeyVkCode:
                if (self.isPressingClickHotkey(e.data.key)) self.startClicking();
                break;
            case self._recordHotkeyVkCode:
                if (self.isPressingRecordHotkey(e.data.key)) self.startRecording();
                break;
            default:
                break;
        }
    }

    handleClickingKeydown(e) {
        var self = this
        if (self.isPressingClickHotkey(e.data.key)) {
            self.stopClicking()
        }
    }

    handlePickingKeyDown(e) {
        var self = this
        if (self.isPressingPickHotkey(e.data.key)) {
            self.stopPicking()
        }
    }

    handleRecordingKeyDown(e) {
        var self = this
        if (self.isPressingRecordHotkey(e.data.key)) {
            self.stopRecording()
        }
    }

    handleReplayingKeyDown(e) {
        var self = this
        var equals = (e.data.key == self._replayHotkeyVkCode)
        o(`replaying state on key down. key: ${e.data.key}. replay hotkey: ${self._replayHotkeyVkCode}. equals: ${equals}`)
        if (equals) {
            self.stopPlaying()
        }
    }

    handleUnknownStateKeyDown(e) {
        var self = this
        o(`unknown actor state: ${self._state}`)
    }

    handlePickingMouseDown(e) {
        var self = this
        var equals = (e.data.msg == MouseMsg.WM_LBUTTONDOWN)
        o(`picking state on mouse down. btn: ${e.data.msg}. stop picking btn: ${MouseMsg.WM_LBUTTONDOWN}. equals: ${equals}`)
        if (equals) {
            self.stopPicking()
        }
    }

    handlePickingMousePos(e) {
        var self = this
        Window.post(new Event('PICK_MOUSE_POS', {data: {x: e.data.x, y: e.data.y}}))
    }

    handleRecordingMousePos(e) {
        var self = this
        Window.post(new Event('RECORD_MOUSE_POS', {data: {x: e.data.x, y: e.data.y}}))
    }

    handleReplayingMousePos(e) {
        var self = this
        Window.post(new Event('REPLAY_MOUSE_POS', {data: {x: e.data.x, y: e.data.y}}))
    }

    setClickHotkey(vkCode, ctrl, shift, alt) {
        o(`set click hotkey. vkCode=${vkCode}. ctrl=${ctrl}. shift=${shift}. alt=${alt}`)
        this._clickHotkeyVkCode = vkCode
        this._clickHotkeyCtrl = ctrl
        this._clickHotkeyShift = shift
        this._clickHotkeyAlt = alt
    }

    setRecordHotkey(vkCode, ctrl, shift, alt) {
        o(`set record hotkey. vkCode=${vkCode}. ctrl=${ctrl}. shift=${shift}. alt=${alt}`)
        this._recordHotkeyVkCode = vkCode
        this._recordHotkeyCtrl = ctrl
        this._recordHotkeyShift = shift
        this._recordHotkeyAlt = alt
    }

    setReplayHotkey(vkCode, ctrl, shift, alt) {
        o(`set replay hotkey. vkCode=${vkCode}. ctrl=${ctrl}. shift=${shift}. alt=${alt}`)
        this._replayHotkeyVkCode = vkCode
        this._replayHotkeyCtrl = ctrl
        this._replayHotkeyShift = shift
        this._replayHotkeyAlt = alt
    }

    setClickInterval(mils) {
        if (mils <= 0) mils = 10
        this._clickInterval = mils
    }

    setClickButton(btn) {
        this._clickButton = btn
    }

    setClickType(t) {
        this._clickType = t
    }

    setClickRepeatType(t) {
        this._clickRepeatType = t
    }

    setRepeatTimes(t) {
        this._clickRepeatTimes = t
    }

    setClickLocationType(t) {
        this._clickLocationType = t
    }

    setClickPos(x, y) {
        this._clickPosX = x
        this._clickPosY = y
    }

    startClicking() {
        var self = this

        o(`start clicking. set actor state from ${this._state} to clicking state`)
        if (self._state == ActorState.Clicking) {
            o(`already in clicking state! stop clicking`)
            self.stopClicking()
            return
        }

        self._state = ActorState.Clicking

        NA.setClickInterval(self._clickInterval)
        NA.setClickButton(self._clickButton)
        NA.setClickType(self._clickType)
        NA.setClickRepeatType(self._clickRepeatType)
        NA.setClickRepeatTimes(self._clickRepeatTimes)
        NA.setClickLocationType(self._clickLocationType)
        NA.setClickLocationX(self._clickPosX)
        NA.setClickLocationY(self._clickPosY)
        NA.startClicking()
        self._cursorXBeforeClicking = N.getCursorX()
        self._cursorYBeforeClicking = N.getCursorY()

        Window.post(new Event('AUTO_CLICK_STARTED'))
    }

    onNativeAutoClickStopped(e) {
        o(`on native auto-click stopped`)
        this.stopClicking(false)
    }

    stopClicking(callNative = true) {
        var self = this
        o(`stop clicking. set actor state from clicking?=${this._state} to idle state`)

        if (callNative) NA.stopClicking()

        if (self._state == ActorState.Clicking) {
            o(`restore cusor pos to ${self._cursorXBeforeClicking}, ${self._cursorYBeforeClicking}`)
            MC.simulateMouseMove(self._cursorXBeforeClicking, self._cursorYBeforeClicking)
        }

        this._state = ActorState.Idle
        Window.post(new Event('AUTO_CLICK_STOPPED'))
    }

    startPicking() {
        o(`start picking. set actor state from ${this._state} to picking state`)
        this._state = ActorState.Picking
    }

    stopPicking() {
        o(`stop picking. set actor state from picking?=${this._state} to idle state`)
        this._state = ActorState.Idle
        Window.post(new Event('FINISH_PICKING'))
    }

    startRecording() {
        o(`start recording. set actor state from ${this._state} to recording state`)
        this._state = ActorState.Recording
        createToolWindow('recording.html')
        Window.post(new Event('RECORDING_STARTED'))
        MC.startRecording()
    }

    stopRecording() {
        o(`stop recording. set actor state from recording?=${this._state} to idle state`)
        this._state = ActorState.Idle
        Window.post(new Event('RECORDING_STOPPED'))
        MC.stopRecording()
    }

    startPlaying(macro) {
        o(`start playing macro ${macro.name}. set actor state from ${this._state} to replaying state`)
        var path = `${GC.MacrosDir}/${N.toBase64Str(macro.name)}${GC.MacroExtension}`
        this._state = ActorState.Replaying
        var success = MC.startPlaying(path)
        if (!success) {
            showTipsWindow(@'Error', @'Failed to play macro: {1}. Could not find corresponding macro file'.format(macro.name))
            return
        }

        createToolWindow('replaying.html', {macro: macro})
        Window.post(new Event('REPLAYING_STARTED'))
    }

    stopPlaying() {
        o(`stop playing. set actor state from replayuing?=${this._state} to idle state`)
        this._state = ActorState.Idle
        Window.post(new Event('REPLAYING_STOPPED'))
        MC.stopPlaying()
    }
}

if (Window.share.MyClickActor == undefined) {
    o('init global click actor')
    Window.share.MyClickActor = new MyClickActor()
}

export const ClickActor = Window.share.MyClickActor

