const decode = require('heic-decode');

let output = document.createElement("div")
output.style.backgroundColor = "#222222"
document.body.appendChild(output)

let fileInput = document.getElementById("fileinput")

fileInput.addEventListener("change", async function() {
	while (output.firstChild) {output.firstChild.remove()}
	fileInput.files.forEach(async(file) => {
		let blob = file.slice(0)
		let buf = await blob.arrayBuffer()
		let arr = new Uint8Array(buf)

		let elem;

		//We'll try HEIF decode. If HEIF fails, then we will try adding directly.

		try {
			const images = await decode.all({ buffer: arr });
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
			  document.body.appendChild(p)
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

		elem.addEventListener("click", function() {
			if (!document.fullscreenElement) {
				elem.requestFullscreen()
			}
			else {
				document.exitFullscreen();
			}
		})
	})
})


window.decode = decode
