import * as B from '/common/js/BrandConfig'

var N = NativeUtil

export const KeyName = {
    ClickInterval: {
        HourValue: 'click_interval_hour_value',
        MinuteValue: 'click_interval_minute_value',
        SecondValue: 'click_interval_second_value',
        MillisecondValue: 'click_interval_millisecond_value'
    },

    ClickButton: 'click_mouse_button',

    ClickType: 'click_mouse_type',

    RepeatType: 'click_repeat_type',

    RepeatTimes: 'click_repeat_times',

    ClickLocationType: 'click_location_type',
    ClickLocationX: 'click_location_x',
    ClickLocationY: 'click_location_y',

    ClickHotKey: 'click_hot_key',
    ClickHotCtrl: 'click_hot_ctrl',
    ClickHotShift: 'click_hot_shift',
    ClickHotAlt: 'click_hot_alt',

    RecordHotkey: 'record_hot_key',
    RecordHotCtrl: 'record_hot_ctrl',
    RecordHotShift: 'record_hot_shift',
    RecordHotAlt: 'record_hot_alt',

    ReplayHotkey: 'replay_hot_key',
    ReplayHotCtrl: 'replay_hot_ctrl',
    ReplayHotShift: 'replay_hot_shift',
    ReplayHotAlt: 'replay_hot_alt'
}

export const DefaultClickIntervalHours = 0
export const DefaultClickIntervalMinutes = 0
export const DefaultClickIntervalSeconds = 0
export const DefaultClickIntervalMilliseconds = 100

export const DefaultClickRepeatTimes = 10

export const DefaultClickHotkey = 119 // vkCode of F8
export const DefaultRecordHotkey = 121 // vkCode of F10
export const DefaultReplayHotkey = 121 // vkCode of F10

export const Action = {
    InstallerOpen: 10001,
    InstallerHeartBeat: 10002,
    InstallerClose: 10003,
    InstallerClickSelectInstallDirBtn: 10004,
    InstallerClickInstallBtn: 10005,
    InstallerClickCloseBtn: 10006,

    UnstallerOpen: 30001,
    UnstallerHeartBeat: 30002,
    UnstallerClose: 30003,
    UnstallerClickUnstallBtn: 30005,
    UnstallerClickCloseBtn: 30006,
    UnstallerClickFinishBtn: 30007,

    AppOpen: 20001,
    AppHeartBeat: 20002,
    AppClose: 20003,
    AppSetClickInterval: 20004,
    AppSetClickButton: 20005,
    AppSetClickType: 20006,
    AppSetRepeatType: 20007,
    AppSetRepeatTimes: 20008,
    AppSetHotkey: 20009,
    AppPressHotkey: 20010,
    AppReleaseHotkey: 20011,
    AppSelectHotkey: 20012,
    AppClickBottomSearchLogo: 20013,
    AppClickBottomWebsite: 20014,
    AppClickTrayMenuShowWindow: 20015,
    AppClickTrayMenuExitApp: 20016,
    AppClickTrayIconToShowWindow: 20017,
    AppMainWindowClickMinBtn: 20018,
    AppMainWindowClickCloseBtn: 20019,
    AppClickTrayAboutMenu: 20020,
    AppClickHotkeySettingBtn: 20021,
    AppClickHotkeySettingCancelBtn: 20022,
    AppClickHotkeySettingOKBtn: 20023,
    AppClickRecordAndPlaybackBtn: 20024,
    AppClickCursorLocationTypeBtn: 20025,
    AppClickPickLocationBtn: 20026,
    AppSetPickLocation: 20027,
    AppClickBottomVersionLabel: 20028,
    AppClickBottomRightLogo: 20029,
    AppVersionsPanelShown: 20030,
    AppVersionsPanelClickClose: 20031,
}

export const HeartbeatMils = 30000

export const UninstallRegistry = 'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall'

var debugFlag = N.isDebug ? 'd' : ''

export const PowerKit = 'PowerKit.exe'
export const QT5CORE = `Qt5Core${debugFlag}.dll`
export const MSVCP = `msvcp140${debugFlag}.dll`
export const VCRUNTIME = `vcruntime140${debugFlag}.dll`

export const InstallationFiles = [`${B.ProcessName}.exe`, PowerKit, 'Uninst.exe', 'sciter.dll', QT5CORE, 'InputHook.dll', MSVCP, VCRUNTIME]

export const InstallType = {
    Install: 0, Update: 1
}

export const MacrosDir = 'macros'
export const MacroExtension = '.mac'