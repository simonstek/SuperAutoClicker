import log from '/common/js/Logger'
import * as C from 'Constants'
import * as B from '/common/js/BrandConfig'
import {GlobalDef as G} from '/common/js/Global'
import * as env from '@env'
import {centerWindow} from '/common/js/WindowUtil'
import '/common/js/StringUtil'
import {$, $$, on} from '@sciter'

var N = NativeUtil

function o(str) {
    log(str, 'AboutApp')
}

class AboutApp extends AboutElement {
    componentDidMount() {
        var self = this
        var win = Window.this

        o('AboutApp on mounted')

        G.DefaultLogFilter = 'AboutApp'

        self.setVersion()
        self.setCopyright()

        self.setWindowAutoFit()

        win.state = Window.WINDOW_SHOWN
        if (N.canMainWindowTopmost) win.isTopmost = true

        document.on('focusout', () => {
            o('on focus out')
            win.close()
        })
    }

    setVersion() {
        var ver = `${N.nativeVersion}.${B.UIVersion}`
        $('#version_label').innerHTML = @'Version: {1}'.format(ver)
    }

    setCopyright() {
        $('#copyright_label').innerHTML = @'Copyright© 2020-{1} {2}. All Rights Reserved.'.format((new Date()).getFullYear(), B.Company)
    }
}

document.body.patch(<AboutApp/>)