
self.addEventListener('fetch', function(event) {
	//let promise = fetch(event.request)
	let cacheLoader = caches.open('atombohrmodels3d')
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
})
