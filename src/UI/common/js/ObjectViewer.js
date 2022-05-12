import log from '/common/js/Logger'

function o(str) {
	log(`ObjectViewer: ${str}`)
}

export class ObjectViewer {
	static view(obj, name) {
		if (obj == null || obj == undefined) {
			o(`empty object. skip`)
			return
		}

		for (var prop in obj) {
			o(`${name}[${prop}]: ${obj[prop]}`)
		}
	}
}