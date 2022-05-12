const GKeys = [
    {name: "ESC", sciterCode: "Escape", sciterKeyCode: 256, vkCode: 27},
    {name: "F1", sciterCode: "F1", sciterKeyCode: 290, vkCode: 112},
    {name: "F2", sciterCode: "F2", sciterKeyCode: 291, vkCode: 113},
    {name: "F3", sciterCode: "F3", sciterKeyCode: 292, vkCode: 114},
    {name: "F4", sciterCode: "F4", sciterKeyCode: 293, vkCode: 115},
    {name: "F5", sciterCode: "F5", sciterKeyCode: 294, vkCode: 116},
    {name: "F6", sciterCode: "F6", sciterKeyCode: 295, vkCode: 117},
    {name: "F7", sciterCode: "F7", sciterKeyCode: 296, vkCode: 118},
    {name: "F8", sciterCode: "F8", sciterKeyCode: 297, vkCode: 119},
    {name: "F9", sciterCode: "F9", sciterKeyCode: 298, vkCode: 120},
    {name: "F10", sciterCode: "F10", sciterKeyCode: 299, vkCode: 121},
    {name: "F11", sciterCode: "F11", sciterKeyCode: 300, vkCode: 122},
    {name: "F12", sciterCode: "F12", sciterKeyCode: 301, vkCode: 123},
    {name: "1", sciterCode: "Digit1", sciterKeyCode: 49, vkCode: 49},
    {name: "2", sciterCode: "Digit2", sciterKeyCode: 50, vkCode: 50},
    {name: "3", sciterCode: "Digit3", sciterKeyCode: 51, vkCode: 51},
    {name: "4", sciterCode: "Digit4", sciterKeyCode: 52, vkCode: 52},
    {name: "5", sciterCode: "Digit5", sciterKeyCode: 53, vkCode: 53},
    {name: "6", sciterCode: "Digit6", sciterKeyCode: 54, vkCode: 54},
    {name: "7", sciterCode: "Digit7", sciterKeyCode: 55, vkCode: 55},
    {name: "8", sciterCode: "Digit8", sciterKeyCode: 56, vkCode: 56},
    {name: "9", sciterCode: "Digit9", sciterKeyCode: 57, vkCode: 57},
    {name: "0", sciterCode: "Digit0", sciterKeyCode: 48, vkCode: 48},
    {name: "A", sciterCode: "KeyA", sciterKeyCode: 65, vkCode: 65},
    {name: "B", sciterCode: "KeyB", sciterKeyCode: 66, vkCode: 66},
    {name: "C", sciterCode: "KeyC", sciterKeyCode: 67, vkCode: 67},
    {name: "D", sciterCode: "KeyD", sciterKeyCode: 68, vkCode: 68},
    {name: "E", sciterCode: "KeyE", sciterKeyCode: 69, vkCode: 69},
    {name: "F", sciterCode: "KeyF", sciterKeyCode: 70, vkCode: 70},
    {name: "G", sciterCode: "KeyG", sciterKeyCode: 71, vkCode: 71},
    {name: "H", sciterCode: "KeyH", sciterKeyCode: 72, vkCode: 72},
    {name: "I", sciterCode: "KeyI", sciterKeyCode: 73, vkCode: 73},
    {name: "J", sciterCode: "KeyJ", sciterKeyCode: 74, vkCode: 74},
    {name: "K", sciterCode: "KeyK", sciterKeyCode: 75, vkCode: 75},
    {name: "L", sciterCode: "KeyL", sciterKeyCode: 76, vkCode: 76},
    {name: "M", sciterCode: "KeyM", sciterKeyCode: 77, vkCode: 77},
    {name: "N", sciterCode: "KeyN", sciterKeyCode: 78, vkCode: 78},
    {name: "O", sciterCode: "KeyO", sciterKeyCode: 79, vkCode: 79},
    {name: "P", sciterCode: "KeyP", sciterKeyCode: 80, vkCode: 80},
    {name: "Q", sciterCode: "KeyQ", sciterKeyCode: 81, vkCode: 81},
    {name: "R", sciterCode: "KeyR", sciterKeyCode: 82, vkCode: 82},
    {name: "S", sciterCode: "KeyS", sciterKeyCode: 83, vkCode: 83},
    {name: "T", sciterCode: "KeyT", sciterKeyCode: 84, vkCode: 84},
    {name: "U", sciterCode: "KeyU", sciterKeyCode: 85, vkCode: 85},
    {name: "V", sciterCode: "KeyV", sciterKeyCode: 86, vkCode: 86},
    {name: "W", sciterCode: "KeyW", sciterKeyCode: 87, vkCode: 87},
    {name: "X", sciterCode: "KeyX", sciterKeyCode: 88, vkCode: 88},
    {name: "Y", sciterCode: "KeyY", sciterKeyCode: 89, vkCode: 89},
    {name: "Z", sciterCode: "KeyZ", sciterKeyCode: 90, vkCode: 90},
    {name: "`", sciterCode: "Backquote", sciterKeyCode: 96, vkCode: 192},
    {name: "-", sciterCode: "", sciterKeyCode: 45, vkCode: 189},
    {name: "=", sciterCode: "", sciterKeyCode: 61, vkCode: 187},
    {name: "Backspace", sciterCode: "Backspace", sciterKeyCode: 259, vkCode: 8},
    {name: "Tab", sciterCode: "Tab", sciterKeyCode: 258, vkCode: 9},
    {name: "Caps Lock", sciterCode: "CapsLock", sciterKeyCode: 280, vkCode: 20},
    {name: "Shift", sciterCode: "ShiftLeft", sciterKeyCode: 340, vkCode: 16},
    {name: "Ctrl", sciterCode: "ControlLeft", sciterKeyCode: 341, vkCode: 17},
    {name: "Win", sciterCode: "MetaLeft", sciterKeyCode: 343, vkCode: 91},
    {name: "Ctrl", sciterCode: "ControlRight", sciterKeyCode: 345, vkCode: 17},
    {name: "Context", sciterCode: "", sciterKeyCode: 348, vkCode: 93},
    {name: "Alt", sciterCode: "AltRight", sciterKeyCode: 346, vkCode: 18},
    {name: "Space", sciterCode: "Space", sciterKeyCode: 32, vkCode: 32},
    {name: "Scroll Lock", sciterCode: "ScrollLock", sciterKeyCode: 281, vkCode: 145},
    {name: "Pause", sciterCode: "Pause", sciterKeyCode: 284, vkCode: 179},
    {name: "Insert", sciterCode: "Insert", sciterKeyCode: 260, vkCode: 45},
    {name: "Home", sciterCode: "Home", sciterKeyCode: 268, vkCode: 36},
    {name: "Page Up", sciterCode: "PageUp", sciterKeyCode: 266, vkCode: 33},
    {name: "Delete", sciterCode: "Delete", sciterKeyCode: 261, vkCode: 46},
    {name: "End", sciterCode: "End", sciterKeyCode: 269, vkCode: 35},
    {name: "Page Down", sciterCode: "PageDown", sciterKeyCode: 267, vkCode: 34},
    {name: "Left", sciterCode: "ArrowLeft", sciterKeyCode: 263, vkCode: 37},
    {name: "Right", sciterCode: "ArrowRight", sciterKeyCode: 262, vkCode: 39},
    {name: "Up", sciterCode: "ArrowUp", sciterKeyCode: 265, vkCode: 38},
    {name: "Down", sciterCode: "ArrowDown", sciterKeyCode: 264, vkCode: 40},
    {name: "Num Lock", sciterCode: "NumLock", sciterKeyCode: 282, vkCode: 144},
    {name: "/", sciterCode: "NumpadDivide", sciterKeyCode: 331, vkCode: 111},
    {name: "Num *", sciterCode: "NumpadMultiply", sciterKeyCode: 332, vkCode: 106},
    {name: "Num -", sciterCode: "NumpadSubtract", sciterKeyCode: 333, vkCode: 109},
    {name: "Num +", sciterCode: "NumpadAdd", sciterKeyCode: 334, vkCode: 107},
    {name: "Enter", sciterCode: "", sciterKeyCode: 257, vkCode: 13},
    {name: "Enter", sciterCode: "", sciterKeyCode: 335, vkCode: 13},
    {name: "Num Del", sciterCode: "NumpadDecimal", sciterKeyCode: 330, vkCode: 46},
    {name: "Num 0", sciterCode: "Numpad0", sciterKeyCode: 320, vkCode: 96},
    {name: "Num 1", sciterCode: "Numpad1", sciterKeyCode: 321, vkCode: 97},
    {name: "Num 2", sciterCode: "Numpad2", sciterKeyCode: 322, vkCode: 98},
    {name: "Num 3", sciterCode: "Numpad3", sciterKeyCode: 323, vkCode: 99},
    {name: "Num 4", sciterCode: "Numpad4", sciterKeyCode: 324, vkCode: 100},
    {name: "Num 5", sciterCode: "Numpad5", sciterKeyCode: 325, vkCode: 101},
    {name: "Num 6", sciterCode: "Numpad6", sciterKeyCode: 326, vkCode: 102},
    {name: "Num 7", sciterCode: "Numpad7", sciterKeyCode: 327, vkCode: 103},
    {name: "Num 8", sciterCode: "Numpad8", sciterKeyCode: 328, vkCode: 104},
    {name: "Num 9", sciterCode: "Numpad9", sciterKeyCode: 329, vkCode: 105},
    {name: "[", sciterCode: "[", sciterKeyCode: 91, vkCode: 219},
    {name: "]", sciterCode: "]", sciterKeyCode: 93, vkCode: 221},
    {name: "\\", sciterCode: "\\", sciterKeyCode: 92, vkCode: 220},
    {name: ",", sciterCode: ",", sciterKeyCode: 44, vkCode: 188},
    {name: ";", sciterCode: ";", sciterKeyCode: 59, vkCode: 186},
    {name: "'", sciterCode: "'", sciterKeyCode: 39, vkCode: 222},
    {name: ".", sciterCode: ".", sciterKeyCode: 46, vkCode: 190},
    {name: "/", sciterCode: "/", sciterKeyCode: 47, vkCode: 191},
    {name: "Win", sciterCode: "Win", sciterKeyCode: 347, vkCode: 92}
]

export function getKeyNameByVkCode(code) {
    for (var k of GKeys) {
        if (k.vkCode == code) {
            return k.name
        }
    }

    return `unknown_vk_code_${code}`
}

export function getVkCodeBySciterKeycode(sc) {
    for (var k of GKeys) {
        if (k.sciterKeyCode == sc) {
            return k.vkCode
        }
    }

    return -1
}

export function getKeyMappingBySciterKeycode(sc) {
    for (var k of GKeys) {
        if (k.sciterKeyCode == sc) {
            return k
        }
    }

    return {name: `unknown_sciter_keycode_${sc}`, vkCode: 0}
}

export function getKeyMappingByVkKeycode(sc) {
    for (var k of GKeys) {
        if (k.vkCode == sc) {
            return k
        }
    }

    return {name: `unknown_sciter_keycode_${sc}`, vkCode: 0}
}