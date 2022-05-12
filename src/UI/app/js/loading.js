import log from '/common/js/Logger'
import * as C from 'Constants'
import * as B from '/common/js/BrandConfig'
import {GlobalDef as G} from '/common/js/Global'
import * as env from '@env'
import {centerWindow} from '/common/js/WindowUtil'
import '/common/js/StringUtil'

var N = NativeUtil

class LoadingApp extends LoadingElement {
    componentDidMount() {
        var self = this
        var win = Window.this

        log('LoadingApp on mounted')

        G.DefaultLogFilter = 'LoadingApp'
        if (N.isDebug) win.isTopmost = true

        Window.this.state = Window.WINDOW_SHOWN
        self.setWindowAutoFit()

        N.setSharedMemoryValue('app_loading_window_shown', 'YES_APP_IS_STARTING')

        this.onGlobalEvent("main_window_shown", () => {
            log('LoadingApp on main window shown. close itself')
            Window.this.close()
        })

        log('LoadingApp crate main window')
        WindowUtil.createWindow(N.mainWindowPath, C.WindowType.SW_POPUP, true) // 创建主窗口
    }
}

document.body.patch(<LoadingApp/>)