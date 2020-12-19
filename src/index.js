let output = document.createElement("div")
output.style.backgroundColor = "#151515"
output.id = "output"
output.innerHTML = "<p>Images will appear here. </p>"
document.body.appendChild(output)

let fileInput = document.getElementById("fileinput")

fileInput.addEventListener("change", async function() {
	while (output.firstChild) {output.firstChild.remove()}
	let files = fileInput.files
	for (let i=0;i<files.length;i++) {
		let file = files[i]

		let info = document.createElement("p")
		let str = `Render of ${file.name} (${file.size} bytes - ${file.type || ""}) below: `
		info.innerHTML = `Beginning ${str} `
		output.appendChild(info)
		let start = Date.now()

		let blob = file.slice(0)
		let buf = await blob.arrayBuffer()
		let arr = new Uint8Array(buf)

		let elem;

		//We'll try HEIC decode. If HEIC fails, then we will try adding directly.

		try {
			const images = await window.decode.all({ buffer: arr });
			for (let image of images) {
			  let obj = await image.decode();
			  console.log(obj)

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
			  output.appendChild(p)
			  elem = canvas
			}
		}
		catch (e) {
			console.log(e)

			//Hopefully it's another type of image, otherwise this won't work.
			let url = URL.createObjectURL(blob)
			let img = document.createElement("img")
			img.src = url
			output.appendChild(img)
			elem = img
		}

		info.innerHTML = `Completed (${Date.now() - start}ms) ${str} `

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
})

//May be automatically added if the page is reloaded, etc.
if (fileInput.files.length > 0) {
	fileInput.dispatchEvent(new Event("change"))
}
