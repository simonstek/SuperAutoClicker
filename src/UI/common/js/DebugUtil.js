import log from '/common/js/Logger'

export function e_call(target, fn, ...args) {
    try {
        fn.apply(target, args)
    } catch (e) {
        log(`exception: ${e}`)
        log(`stack: ${e.stack}`)
    }
}