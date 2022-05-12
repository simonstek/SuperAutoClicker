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
import * as P from '/common/js/PowerKit'

var N = NativeUtil

function o(str) {
    log(str, 'Unstaller')
}

class UnstallerApp extends UnstallerElement {
    _unstallFinished = false

    componentDidMount() {
        this.init()
    }

    async init() {
        var self = this

        G.DefaultLogFilter = 'Unstaller'

        o('unstaller ui initializing....')

        self.initDocument()

        self.initTitle()

        self.initCaptionBar()

        self.initUnstallBtn()

        self.setWindowAutoFit()

        self.handleClose()

        self.setWindowVisibility()

        self.heartBeat()
    }

    async heartBeat() {
        var self = this

        o('unstaller start heartbeat')
        var _lastHeartBeatTime = (new Date()).getTime()
        TimerCenter.setInterval(async () => {
            var time = (new Date()).getTime()
            var elapsedMils = time - _lastHeartBeatTime
            _lastHeartBeatTime = time
            o('unstaller hearbeating')
        }, GC.HeartbeatMils)
    }

    handleClose() {
        var self = this
        document.on('beforeunload', async () => {
            o('unstaller window on before unload.')

            if (self._unstallFinished) {
                self.cleanUpFiles()
            }
        })
    }

    cleanUpFiles() {
        var self = this

        var inst = DB.get('install_dir')

        o(`tell PowerKit to remove ${inst}`)
        P.run('remove_dir', inst)
    }

    initDocument() {
        o('init document')
    }

    initTitle() {
        Window.this.N.setTitle(@'{1} Ununstaller'.format(B.TranslatedBrandName))
    }

    initCaptionBar() {
        var win = Window.this
        o('init caption bar')
        $('#close_btn').on('click', async () => {
            win.state = Window.WINDOW_HIDDEN
            Window.this.close()
        })
    }

    initUnstallBtn() {
        var self = this
        var win = Window.this
        $('#uninstall_btn').on('click', async () => {
            if (self._unstallFinished) {
                win.state = Window.WINDOW_HIDDEN
                Window.this.close()
            } else {
                this.startUnstalling()
            }
        })
    }

    async startUnstalling() {
        var self = this
        o('unstaller start unstalling')

        self.setUnstallTips(@'Start unstalling {1}...'.format(B.TranslatedBrandName))

        if (await self.hasRunningApp()) return

        await self.unstallApp()

    }

    async unstallApp() {
        var self = this
        o('try to unstall app')

        self.showUnstallProgressGroup(true)
        self.showUnstallBtn(false)

        // remove registry
        N.removeRegistry(GC.UninstallRegistry, B.ProcessName)

        // remove lnk file
        var lnk = `${env.path('desktop')}/${B.TranslatedBrandName}.lnk`
        N.removeFile(lnk)

        var progress = 0
        var tid = TimerCenter.setInterval(() => {
            progress = progress + 30
            if (progress > 100) progress = 100
            self.setUnstallProgress(progress)
            if (progress >= 100) {
                self.setUnstallTips(@'Uninstall complete!')
                TimerCenter.clearInterval(tid)

                TimerCenter.setTimeout(() => {
                    self.showUnstallProgressGroup(true)
                    self.showUnstallBtn(true)
                    $('#uninstall_btn').innerHTML = @'Finish'
                    self._unstallFinished = true
                })
            }
        }, 10)


        return true
    }

    showUnstallProgressGroup(show) {
        $('#unstall_progress_group').style.display = show ? 'block' : 'none'
    }

    showUnstallBtn(show) {
        $('#uninstall_btn').style.display = show ? 'block' : 'none'
    }

    async hasRunningApp() {
        var self = this
        var win = Window.this
        var appName = `${B.ProcessName}.exe`
        var running = N.isProcessRunning(appName)
        o(`unstaller check if there is running app. result: ${running}. pids: ${N.getProcessIDList(appName)}`)

        if (running) {
            win.modal({
                url: '/common/modal.html',
                x: -10000,
                parameters: {
                    title: @'tips',
                    text: @'Detected {1} is running. Please quit the app before uninstalltion continues'.format(B.TranslatedBrandName)
                }
            })
            return true
        } else {
            o('no app is running.')
            return false
        }
    }

    setUnstallTips(str) {
        $('#unstall_progress_tip').innerHTML = str
    }

    setUnstallProgress(value) {
        $('#unstall_progress').value = value
        $('#unstall_progress_percentage').innerHTML = `${value}%`
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
        o('unstaller window do show')
        if (!N.isAutoReload) centerWindow()
        win.state = Window.WINDOW_SHOWN

        o('unstaller window set to topmost')
        if (N.canMainWindowTopmost) win.isTopmost = true
    }
}

document.body.patch(<UnstallerApp/>)