import log from '/common/js/Logger'
import {Database as DB} from '/common/js/Database'
import '/common/js/StringUtil'
import {$, $$, on} from '@sciter'
import * as C from 'Constants'
import * as GC from '/common/js/Constants'
import {GlobalDef as G} from '/common/js/Global'
import * as env from '@env'
import {centerWindow, createToolWindow} from '/common/js/WindowUtil'
import {e_call} from '/common/js/DebugUtil'
import '/common/js/TimerCenter'
import * as B from '/common/js/BrandConfig'
import {ClickActor} from '/common/js/ClickActor'

var N = NativeUtil
var M = ClickActor

function o(str) {
    log(str, 'TrayApp')
}

class TrayApp extends TrayElement {
    componentDidMount() {
        this.init()
    }

    async init() {
        G.DefaultLogFilter = 'Tray'

        o(`TrayWindow init. is auto reload: ${N.isAutoReload}`)

        this.initTrayIcon()

        this.listenToWindowCloseEvent()

        this.listenQuitAppSignal()

        this.listenToClickSignals()

        WindowUtil.createWindow(N.updateWindowPath, C.WindowType.SW_TOOL, true)

        this.startHeartBeat()
    }

    async startHeartBeat() {
        var self = this

        o('TrayApp start heartbeat')

        o('app start heartbeat')
        var _lastHeartBeatTime = (new Date()).getTime()
        TimerCenter.setInterval(async () => {
            var time = (new Date()).getTime()
            var elapsedMils = time - _lastHeartBeatTime
            _lastHeartBeatTime = time
            o('app hearbeating')
        }, GC.HeartbeatMils)
    }

    async setTrayIcon(path) {
        var icon = await Graphics.Image.load(path)
        o(`load tray icon: ${icon}`)
        var r = Window.this.trayIcon({
            image: icon,
            text: B.TranslatedBrandName
        })
        o(`loaded tray icon is: ${r}`)
    }

    async initTrayIcon() {
        var self = this
        var win = Window.this

        o('init tray icon')
        self.setTrayIcon(__DIR__ + '../../common/img/logo.svg')

        win.on('trayiconclick', async (e) => {
            o(`tray window on click tray icon`)
            if (e.data.buttons == 1) { // left click
                self.showMainWindow()
            } else if (e.data.buttons == 2) { // right click
                self.showTrayMenu(e)
            } else {
                o(`unknown tray icon click button: ${evt.data.buttons}`)
            }
        })

        document.on('click', 'menu#tray > li#reveal', async (e) => {
            self.showMainWindow()
        })

        document.on('click', 'menu#tray > li#about', async (e) => {
            createToolWindow('about.html')
        })

        document.on('click', 'menu#tray > li#exit', async (e) => {
            // 先关掉托盘图标和主窗口造成退出程序的假象
            self.removeTray()
            Window.post(new Event('fake_quit_app'))
            // 然后等待上报成功后再真正退出程序
            self.close()
        })
    }

    showTrayMenu(e) {
        var [sx, sy] = Window.this.box('position', 'client', 'screen', true)
        var menu = document.$('menu#tray')
        var {screenX, screenY} = e.data
        menu.popupAt(screenX - sx, screenY - sy - 12, 1)
    }

    showMainWindow() {
        o('tray window tell show main window')
        if (Window.share.mainWindow) {
            Window.share.mainWindow.state = Window.WINDOW_SHOWN
        }
    }

    listenToWindowCloseEvent() {
        var self = this
        o('listen to click signals')

        document.onGlobalEvent('SYSCOMMAND_WINDOW_CLOSE', e => {
            o(`tray window on receive window sys-menu close event. hwnd: 0x${e.data.hwnd.toString(16)}`)
            if (e.data.hwnd == Window.share.mainHwnd) {
                o('is closing main window! restore it silently')
                WindowUtil.createWindow(N.mainWindowPath, C.WindowType.SW_POPUP, false) // 偷偷重启创建主窗口
            }
        })

        document.onGlobalEvent('QUIT_APP', e => {
            o(`tray window on receive quit app signal.`)
            self.close()
        })
    }

    listenQuitAppSignal() {
        var win = Window.this
        o('app start listening quit app signal')
        var timer = setInterval(() => {
            var signal = N.getSharedMemoryValue('quit_app')
            if (signal == 'from_installer') {
                o('app get quit signal from installer')
                if (N.isProcessRunning(C.InstallerExeName)) {
                    o('installer is alive. so app decides to really quit itself')
                    win.close()
                } else {
                    o('installer is ALREADY dead. app NO NEED to quit itself')
                }
            }
        }, 3000)
    }

    listenToClickSignals() {
        o('listen to click signals')

        document.onGlobalEvent('AUTO_CLICK_STARTED', e => {
            this.onStartClick(e)
        })
        document.onGlobalEvent('AUTO_CLICK_STOPPED', e => {
            this.onStopClick(e)
        })
    }

    onStartClick(e) {
        o('tray on started click')
        this.setTrayIcon(__DIR__ + '../../common/img/logo_working.svg')
    }

    onStopClick(e) {
        o('tray on stopped click')
        this.setTrayIcon(__DIR__ + '../../common/img/logo.svg')
    }

    removeTray() {
        o('tray window remove tray icon')
        Window.this.trayIcon('remove')
    }

    close() {
        var self = this
        var win = Window.this
        o('tray window close')
        self.removeTray()
        win.close()
    }
}

document.body.patch(<TrayApp/>)