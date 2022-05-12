import log from '/common/js/Logger'

function o(str) {
    log(str, 'FunctionLink')
}

export class FunctionLink {
    constructor() {
    }

    draw(ctx) {
        var self = this
        FunctionLink.drawCurve(ctx, self.startNode.getOutputPos(), self.stopNode.getInputPos(), self.color)
    }

    contains(point) {
        var self = this

        var start = self.startNode.getOutputPos()
        var stop = self.stopNode.getInputPos()

        var offsetX = FunctionLink.getOffsetX(start, stop)
        var offsetY = FunctionLink.getOffsetY(start, stop)

        var xs = [start.x, start.x + offsetX, stop.x - offsetX, stop.x]
        var ys = [start.y, start.y + offsetY, stop.y - offsetY, stop.y]

        var minX = FunctionLink.getMin(xs)
        var maxX = FunctionLink.getMax(xs)
        var minY = FunctionLink.getMin(ys)
        var maxY = FunctionLink.getMax(ys)
        return minX <= point.x && point.x <= maxX &&
            minY <= point.y && point.y <= maxY
    }

    setColor(c) {
        this.color = c
    }

    setStartNode(node) {
        this.startNode = node
    }

    setStopNode(node) {
        this.stopNode = node
    }

    getName() {
        return `LINK ${this.startNode.name}--->${this.stopNode.name}`
    }

    static getMin(nums) {
        var min = nums[0]
        for (var num of nums) {
            if (num < min) {
                min = num
            }
        }
        return min
    }

    static getMax(nums) {
        var max = nums[0]
        for (var num of nums) {
            if (num > max) {
                max = num
            }
        }
        return max
    }

    static getOffsetX(start, stop) {
        var heightDiff = Math.abs(stop?.y - start?.y)
        if (heightDiff > 200) {
            return 200
        } else {
            var width = Math.abs(stop?.x - start?.x)
            return Math.min(width, 200)
        }
    }

    static getOffsetY(start, stop) {
        return 0
    }

    static drawCurve(ctx, start, stop, color) {
        var self = this

        ctx.lineWidth = 2
        ctx.strokeStyle = color

        var offsetX = FunctionLink.getOffsetX(start, stop)
        var offsetY = FunctionLink.getOffsetY(start, stop)

        ctx.beginPath()
        ctx.moveTo(start?.x, start?.y)
        ctx.bezierCurveTo(start?.x + offsetX, start?.y + offsetY, stop?.x - offsetX, stop?.y - offsetY, stop?.x, stop?.y)
        ctx.stroke()
    }
}