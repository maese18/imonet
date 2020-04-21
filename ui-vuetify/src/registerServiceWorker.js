import runtime from 'serviceworker-webpack-plugin/lib/runtime';

if (process.env.NODE_ENV === 'production') {
  let newWorker;
  if ('serviceWorker' in navigator) {
    // It makes a global variable, called 'serviceWorkerOption', which contains all the file names for caching
    runtime.register();
    navigator.serviceWorker
      .register(`${process.env.BASE_URL}service-worker.js`)
      .then(serviceWorker => {
        serviceWorker.addEventListener('updatefound', () => {
          newWorker = serviceWorker.installing;

          newWorker.addEventListener('statechange', () => {
            switch (newWorker.state) {
              case 'installed':
                console.log('registerServiceWorker: installed. Display notification');
                if (navigator.serviceWorker.controller) {
                  // This is the point where we create a small alert, with simple plain javascript.
                  var elem = document.createElement('div');
                  var text = document.createElement('div');
                  var button = document.createElement('div');

                  elem.style.cssText = 'position:fixed;bottom:0;right:0;background-color:rgba(36, 38, 41, 0.9);margin:10px;border-radius:.5rem;font-weight:700;box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);min-width:320px;font-family:monospace;color:white;cursor:pointer;z-index:99999;text-align:center';

                  text.innerHTML = 'A new version is available!';
                  text.style.cssText = 'padding-top:10px;font-size:12px';

                  button.innerHTML = 'Click to refresh!';
                  button.style.cssText = 'padding:10px;background-color:transparent;border:0;color:white;font-size:10px';

                  document.body.appendChild(elem);
                  elem.appendChild(text);
                  elem.appendChild(button);
                  // Sends a message to the new service worker to skip waiting for the user to reload - see the next code snippet
                  elem.addEventListener('click', function() {
                    newWorker.postMessage({ action: 'skipWaiting' });
                  });
                }
                break;
            }
          });
        });
      })
      .catch(error => {
        console.log('Error registering the Service Worker: ' + error);
      });
  }
  // Section which allows if
  let refreshing;
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    console.log('registerServiceWorker: controllerchange, refreshing=', refreshing);
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });
}
