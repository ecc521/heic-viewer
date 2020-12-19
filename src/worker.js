self.onmessage = async function(parameters) {
	try {
		console.log(parameters)
		self.importScripts("decode.js")
		let file = parameters.data
		let buf = await file.arrayBuffer()
		let arr = new Uint8Array(buf)
		const images = await self.decode.all({ buffer: arr });
		for (let image of images) {
			let obj = await image.decode();
			postMessage(obj)
		}
		postMessage("Done")
	}
	catch (e) {
		console.error(e)
		postMessage("Crash")
	}
}
