import log from '/common/js/Logger'
import * as B from '/common/js/BrandConfig'

var N = NativeUtil

export const hotkey_span_style = `
    color: #444444 !important;
    display: inline-block;
    border-radius: 4dip;
    padding: 8dip;
    background: #ffdd33dd !important;
    margin-left: 6dip !important;
    margin-right: 6dip !important;
`

// 安装器进程名
export const InstallerExeName = `${B.ProcessName}Installer.exe`

// 更新包自解压程序
export const SelfExtractUpdaterExeName = `${B.ProcessName}_Installer.exe`

// see sciter-x-def.h
export const WindowType = {
    SW_CHILD: (1 << 0),
    SW_TOOL: (1 << 3),
    SW_POPUP: (1 << 8)
}