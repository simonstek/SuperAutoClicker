import {ErrorCode} from '/common/js/ErrorCode'

export class Result {
    constructor(code, message) {
        this.code = code
        this.message = message
    }

    static OK(message = 'success') {
        return new Result(ErrorCode.OK, message)
    }

    static Error(code, message = 'error') {
        return new Result(code, message)
    }
}