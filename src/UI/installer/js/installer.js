import log from '/common/js/Logger'
import {Database as DB} from '/common/js/Database'
import '/common/js/StringUtil'
import {$, $$, on} from "@sciter"
import * as sys from "@sys"; // '@' is mandatory
import * as env from '@env'
import {centerWindow, showTipsWindow} from '/common/js/WindowUtil'
import {GlobalDef as G} from '/common/js/Global'
import {e_call} from '/common/js/DebugUtil'
import * as B from '/common/js/BrandConfig'
import * as GC from '/common/js/Constants'
import '/common/js/TimerCenter'

var N = NativeUtil

function o(str) {
    log(str, 'Installer')
}

class InstallerApp extends InstallerElement {
    _installFullDir = ''
    _isUpdate = false

    componentDidMount() {
        this.init()
    }

    async init() {
        var self = this

        G.DefaultLogFilter = 'Installer'

        o('installer ui initializing....')
        o(`startup arguments: ${N.arguments()}`)

        self.initDocument()

        self.initTitle()

        self.initCaptionBar()

        self.initInstallationFolder()

        self.initInstallBtn()

        self.setWindowAutoFit()

        self.handleClose()

        self.heartBeat()

        self.setWindowVisibility()

        self.handleStartupParam()
    }

    handleStartupParam() {
        var self = this
        var ars = DB.get('installer_startup_param')
        DB.set('installer_startup_param', '') // 第一时间清除启动参数避免影响后续启动
        o(`installer startup param: ${ars}`)
        if (ars != null && ars != undefined) {
            if (ars.indexOf('isupdate=true') >= 0) {
                o(`startup param contains updating command. so start auto installing`)
                self._isUpdate = true
                self.startInstalling()
            }
        }
    }

    async heartBeat() {
        var self = this

        o('installer start heartbeat')
        var _lastHeartBeatTime = (new Date()).getTime()
        TimerCenter.setInterval(async () => {
            var time = (new Date()).getTime()
            var elapsedMils = time - _lastHeartBeatTime
            _lastHeartBeatTime = time
            o('installer hearbeating')
        }, GC.HeartbeatMils)
    }

    handleClose() {
        var self = this
        document.on('beforeunload', async () => {
            o('installer window on before unload.')
        })
    }

    initDocument() {
        o('init document')
    }

    initTitle() {
        Window.this.N.setTitle(@'{1} Installer'.format(B.TranslatedBrandName))
    }

    initCaptionBar() {
        var win = Window.this
        o('init caption bar')
        $('#close_btn').on('click', async () => {
            win.state = Window.WINDOW_HIDDEN
            Window.this.close()
        })
    }

    initInstallationFolder() {
        var self = this
        var win = Window.this
        var savedInstDir = DB.get('install_dir')
        o(`installer detected saved install dir: ${savedInstDir}`)
        if (savedInstDir) {
            var initialDir = savedInstDir
            this.setInstallDir(initialDir, false)
        } else {
            var initialDir = N.programsPath()
            this.setInstallDir(initialDir, true)
        }

        $('#install_dir_select_btn').on('click', async () => {
            win.isTopmost = false // 避免遮挡文件夹选择窗口

            var folder = N.selectFolder(@'Select Install Directory', initialDir)
            o(`selected install folder is ${folder}`)
            if (folder !== '') {
                this.setInstallDir(folder, true)
            }
            win.isTopmost = true // 恢复最高层级
        })
    }

    setInstallDir(dir, appendAppName) {
        if (appendAppName) {
            this._installFullDir = dir + (dir.endsWith('\\') ? '' : '\\') + B.TranslatedBrandName
        } else {
            this._installFullDir = dir
        }
        $('#install_dir_input').innerHTML = this._installFullDir
    }

    initInstallBtn() {
        var self = this
        $('#install_btn').on('click', async () => {
            this.startInstalling()
        })
    }

    async startInstalling() {
        var self = this
        o('installer start installing')

        self.setInstallTips(@'Start installing {1}...'.format(B.TranslatedBrandName))

        // hide folder select view, show install progress view
        self.setInstallState(true)

        if (await self.hasRunningApp()) return

        await self.installApp()

    }

    setInstallState(installing) {
        $('#install_dir_group').style.display = installing ? 'none' : 'block'
        $('#install_progress_group').style.display = installing ? 'block' : 'none'
    }

    async installApp() {
        var self = this
        o('try to install app')

        self.setInstallProgress(0)

        // create program dir if neccesary
        var exists = sys.fs.$stat(self._installFullDir) != null
        o(`install dir : ${self._installFullDir}. exists: ${exists}`)
        if (!exists) {
            var result = sys.fs.$mkdir(self._installFullDir)
            o(`create dir: ${self._installFullDir}. result: ${result}`)
        }

        // copy app files to installation directory
        self.setInstallTips(@'Copying files...')
        for (var f of GC.InstallationFiles) {
            N.copyFile(f, `${self._installFullDir}\\${f}`, true)
        }

        self.setInstallProgress(60)
        if (self._isUpdate) {
            self.setInstallTips(@'Updating app, please wait...')
        } else {

            self.setInstallTips(@'Creating desktop shortcut...')
        }
        N.createDesktopShortcut(B.TranslatedBrandName, `${self._installFullDir}\\${B.ProcessName}.exe`, '', `${self._installFullDir}\\logo.ico`)

        self.setInstallProgress(100)

        if (self._installType == GC.InstallType.Install) {
            self.setInstallTips(@'Install complete. Starting app...')
        } else if (self._installType == GC.InstallType.Update) {
            self.setInstallTips(@'Update complete. Starting app...')
        }

        DB.set('install_dir', self._installFullDir)

        self.registerUninstallProgram()

        self.openApp()

        await self.asureAppIsStarting()

        return true
    }

    openApp() {
        if (this._isUpdate) DB.set('app_startup_param', 'ShowVersionsList')
        N.launch(`${this._installFullDir}\\${B.ProcessName}.exe`, `${this._installFullDir}`, '')
    }

    async asureAppIsStarting() {
        var self = this

        o('installer asure app is starting')

        var timer = TimerCenter.setInterval(() => {
            var starting = ('YES_APP_IS_STARTING' == N.getSharedMemoryValue('app_loading_window_shown'))
            if (starting) {
                TimerCenter.clearInterval(timer)

                o('app is shown. close installer window')
                Window.this.close()
            }
        }, 1000)
    }

    async hasRunningApp() {
        var self = this
        var win = Window.this
        var appName = `${B.ProcessName}.exe`
        var running = N.isProcessRunning(appName)
        o(`installer check if there is running app. result: ${running}. pids: ${N.getProcessIDList(appName)}`)

        if (running) {
            showTipsWindow(@'tips', @'Detected {1} is running. Please quit the app before installtion continues'.format(B.TranslatedBrandName))
            self.setInstallState(false)
            return true
        } else {
            o('no app is running.')
            return false
        }
    }

    registerUninstallProgram() {
        o('register uninstall program')
        this.setUnintallRegistries(`${GC.UninstallRegistry}\\${B.ProcessName}`)
    }

    setUnintallRegistries(entry) {
        N.setRegistryString(entry, 'DisplayName', B.TranslatedBrandName)
        N.setRegistryString(entry, 'DisplayVersion', `${N.nativeVersion}.${B.UIVersion}`)
        N.setRegistryString(entry, 'Publisher', B.Company)
        N.setRegistryString(entry, 'Version', `${N.nativeVersion}.${B.UIVersion}`)
        N.setRegistryString(entry, 'InstallLocation', this._installFullDir)
        N.setRegistryString(entry, 'UninstallString', `${this._installFullDir}\\Uninst.exe`)
        N.setRegistryString(entry, 'DisplayIcon', `${this._installFullDir}\\Uninst.exe`)
        N.setRegistryIntValue(entry, 'EstimatedSize', 1024 * 13)
    }

    setInstallTips(str) {
        $('#install_progress_tip').innerHTML = str
    }

    setInstallProgress(value) {
        $('#install_progress').value = value
        $('#install_progress_percentage').innerHTML = `${value}%`
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
        o('installer window do show')
        if (!N.isAutoReload) centerWindow()
        win.state = Window.WINDOW_SHOWN

        o('installer window set to topmost')
        if (N.canMainWindowTopmost) win.isTopmost = true
    }
}

document.body.patch(<InstallerApp/>)