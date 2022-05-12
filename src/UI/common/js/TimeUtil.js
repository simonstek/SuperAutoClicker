export function getTimeString(timestamp) {
    var dd = new Date(timestamp)
    var year = dd.getFullYear()
    var month = (dd.getMonth() > 9 ? dd.getMonth() : '0' + dd.getMonth())
    var day = (dd.getDate() > 9 ? dd.getDate() : '0' + dd.getDate())
    var hour = (dd.getHours() > 9 ? dd.getHours() : '0' + dd.getHours())
    var min = (dd.getMinutes() > 9 ? dd.getMinutes() : '0' + dd.getMinutes())
    var sec = (dd.getSeconds() > 9 ? dd.getSeconds() : '0' + dd.getSeconds())
    var time = `${year}-${month}-${day} ${hour}:${min}:${sec}`
    return time
}

export function getSecsString(milliseconds) {
    var secs = `${(milliseconds / 1000.0).toFixed(1)}s`
    return secs
}

export function toMS(secs) {
    var mins = Math.floor((secs) / 60).toFixed(0)
    var sss = secs - mins * 60
    var str = @'{1}:{2}'.format(mins < 10 ? `0${mins}` : mins, sss < 10 ? `0${sss}` : sss)
    return str
}

export function toHMS(secs) {
    var hours = Math.floor(secs / 3600).toFixed(0)
    var mins = Math.floor((secs - hours * 3600) / 60).toFixed(0)
    var sss = secs - hours * 3600 - mins * 60
    var str = @'{1}:{2}:{3}'.format(hours < 10 ? `0${hours}` : hours, mins < 10 ? `0${mins}` : mins, sss < 10 ? `0${sss}` : sss)
    return str
}