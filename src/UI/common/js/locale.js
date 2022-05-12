import log from 'Logger'
import * as env from '@env'
import * as sys from '@sys'
import DefaultLangs from 'DefaultLangs'

var N = NativeUtil

log('locale initializing....')

// translation table
var translation = {};

// these tags will be automatically put into translation table
JSX_translateTags = {
    caption: true,
    p: true,
    label: true,
    button: true,
    li: true,
    img: true,
    menu: true
}

JSX_translateText = function (text) {
    var result = translation[text] || text
    // log(`JSX_translateText [${text}] to [${result}]`)
    return result
}

JSX_translateNode = function (node, translationId) {
    const handler = translation[translationId]
    if (typeof handler != "function") return node // as it is
    let translatedText = handler(...node[2]) // pass list of kids as arguments
    if (!translatedText) return node;
    var result = JSX(node[0], node[1], [translatedText]) // synthesize new node

    // log(`JSX_translateNode [${translationId}] to [${result}]`)
    return result
}

function loadTranslation(lang) {
    log(`try to load translation: ${lang}`, 'LANG')
    let table = fetch(`/common/langs/${lang}.js`, {sync: true}).text()
    translation = eval(`(${table})`)
    // for (var prop in translation) {
    //   log(`translation[${prop}]=${translation[prop]}`, 'translation')
    // }
}

var location = N.language()
// location = 'en-US'
try {
    loadTranslation(location)
} catch (e) {
    var found = false
    var def_lang = DefaultLangs[0]
    var lang = location.split('-')[0]
    for (var o of DefaultLangs) {
        if (lang.toLowerCase() == o.lang.toLowerCase()) {
            def_lang = o
            found = true
            break
        }
    }
    if (found) {
        log(`failed to load translation file for language: ${location}. fallback to ${def_lang.default}`, 'LANG')
        try {
            loadTranslation(def_lang.default)
        } catch (e) {
            log(`failed to load translation ${lang}. fallback to english`, 'LANG')
            loadTranslation('en-US')
        }
    } else {
        log(`cannot find default lang for ${lang}. fallback to english`, 'LANG')
        loadTranslation('en-US')
    }
}