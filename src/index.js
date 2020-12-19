
function addFullscreenListener(elem) {
	//Toggle fullscreen on click.
	elem.addEventListener("click", function() {
		if (!document.fullscreenElement) {
			elem.requestFullscreen()
		}
		else {
			document.exitFullscreen();
		}
	})
}

let output = document.createElement("div")
output.style.backgroundColor = "#151515"
output.id = "output"
output.innerHTML = "<p>Images will appear here. </p>"
document.body.appendChild(output)

let fileInput = document.getElementById("fileinput")

fileInput.addEventListener("change", async function() {
	while (output.firstChild) {output.firstChild.remove()}
	let files = fileInput.files

	let maxThreads = (navigator?.hardwareConcurrency || 1) / 2 //Divide by two to try and mitigate against hyperthreading. Some browsers factor it in, others don't.
	let currentProcesses = []

	for (let i=0;i<files.length;i++) {
		if (currentProcesses.length >= maxThreads) {
			await Promise.race(currentProcesses) //Wait for at least one to finish.
		}

		let file = files[i]

		let fileOutputElem = document.createElement("div")
		output.appendChild(fileOutputElem)

		let info = document.createElement("p")
		info.innerHTML = `Processing ${file.name} (${file.size} bytes)... `
		fileOutputElem.appendChild(info)
		let start = Date.now()

		let promise = new Promise((resolve, reject) => {
			//We'll try HEIC decode. If HEIC fails, then we will try adding directly.
			let worker = new Worker("packages/worker.js")

			function endWorker() {
				worker.terminate()
				currentProcesses.splice(currentProcesses.indexOf(promise), 1)
				resolve()
			}

			worker.addEventListener("message", function(message) {
				let obj = message.data

				if (obj === "Done") {return endWorker()}
				else if (obj === "Crash") {
					//Hopefully it's another type of image, otherwise this won't work.
					let url = URL.createObjectURL(file)
					let img = document.createElement("img")
					img.src = url
					fileOutputElem.appendChild(img)
					elem = img
					addFullscreenListener(elem)

					info.innerHTML = `Not HEIC - Attempted to Render ${file.name} (${file.size} bytes) in ${Date.now() - start}ms `
					return endWorker()
				}

				let canvas = document.createElement("canvas")
				canvas.width = obj.width
				canvas.height = obj.height
				let ctx = canvas.getContext("2d")
				let imageData = new ImageData(new Uint8ClampedArray(obj.data), obj.width, obj.height);
				console.log(imageData)
				ctx.putImageData(imageData, 0, 0)
				//Put in paragraph tags so it's centered.
				let p = document.createElement("p")
				p.appendChild(canvas)
				fileOutputElem.appendChild(p)
				elem = canvas
				addFullscreenListener(elem)
				info.innerHTML = `Rendered ${file.name} (${file.size} bytes) in ${Date.now() - start}ms `
			})

			worker.postMessage(file)
		})
		currentProcesses.push(promise)
	}
})

//May be automatically added if the page is reloaded, etc.
if (fileInput.files.length > 0) {
	fileInput.dispatchEvent(new Event("change"))
}
