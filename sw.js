self.addEventListener('fetch', function(event) {
	let cacheLoader = caches.open('heic-viewer')
	event.respondWith((async function() {
		let response, cache;
		try {
			response = await fetch(event.request)
			let clone = response.clone()
			cache = await cacheLoader
			cache.put(event.request, clone);
			console.log("From network: " + event.request.url)
			return await response
		}
		catch (e) {
			//Return from cache.
			cache = await cacheLoader
			console.log("From cache: " + event.request.url)
			return await cache.match(event.request)
		}
	})())
});

self.addEventListener("install", function() {
    self.skipWaiting()
	caches.open("heic-viewer").then((cache) => {
		cache.addAll([
			"./",
			"./packages/decode.js",
			"./packages/index.js",
			"./packages/worker.js",
		])
	})
})
