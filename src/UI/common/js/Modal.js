import log from '/common/js/Logger'
import {$, $$, on} from '@sciter'
import {centerWindow} from 'WindowUtil'
import {Database as DB} from '/common/js/Database'

class ModelApp extends ModalElement {
    componentDidMount() {
        var self = this
        log('ModelApp on mounted')
        self.configUI()
    }

    configUI() {
        var self = this
        var win = Window.this

        // win.state = Window.WINDOW_SHOWN
        win.isTopmost = true

        self.setWindowTitle()
        self.setWindowContent()
        self.setBtnsText()

        $('#close_btn').on('click', () => {
            DB.set('modal_result', false)
            Window.this.close();
            return false;
        })

        $('#ok_btn').on('click', () => {
            DB.set('modal_result', true)
            Window.this.close();
            return true;
        })

        $('#no_btn').on('click', () => {
            DB.set('modal_result', false)
            Window.this.close();
            return false;
        })

        self.setWindowAutoFit()
    }

    setWindowTitle() {
        var win = Window.this
        log(`modal title: ${win.parameters?.title}`, 'MODAL')
        var title = $('#title_label')
        log(`title label: ${title}. text: ${title.innerHTML}`)
        title.innerHTML = win.parameters?.title
    }

    setWindowContent() {
        var self = this
        $('#text').innerHTML = Window.this.parameters?.text
        self.setWindowAutoFit()
    }

    setBtnsText() {
        var self = this
        var win = Window.this
        var param = win.parameters

        var okBtn = $('#ok_btn')
        var noBtn = $('#no_btn')

        okBtn.innerHTML = param?.okText || @'Yes'
        noBtn.innerHTML = param?.noText || @'No'

        switch (param?.mode) {
            case 'tips':
                okBtn.style.display = 'block';
                noBtn.style.display = 'none';
                break;
            case 'ask':
                okBtn.style.display = 'block';
                noBtn.style.display = 'block';
                break;
            default:
                okBtn.style.display = 'none';
                noBtn.style.display = 'none';
                break;
        }
    }
}

document.body.patch(<ModelApp/>)