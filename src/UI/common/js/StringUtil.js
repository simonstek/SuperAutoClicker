String.prototype.format = function (...values) {
    return this.replace(/{([0-9]+)}/g, (match, index) => values[index - 1] ?? match);
}

String.prototype.contains = function (search, start) {
    if (search instanceof RegExp) {
        throw TypeError('first argument must not be a RegExp')
    }
    if (start === undefined) {
        start = 0;
    }

    return this.indexOf(search, start) !== -1
}
