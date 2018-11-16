**WIP AREA**

This readme is work-in-progress.

# Handli

Handli is a little JavaScript library to automatically handle failed requests such as when the network fails.

Using the network brings a lot of boilerplate burden:
 - What should be displayed to the user when he looses internet connection? When the server is down?
 - Should the request be periodically retried? What should happen with the UI while retrying?
 - ...

Handli aims to bring sensible defaults to all these questions.
So that you can ship a prototype without worrying about all that.

Usage is simple:

~~~diff
const url = 'http://example.org';
-const response = await fetch(url);
-if( !response.ok ) {
-  throw new Error(response.statusText);
-}
+const handli = require('handli');
+const response = await handli(() => fetch(url));
// Do something with sucessful response
console.log(await response.text());
~~~

That's it.
Upon an error, Handli will:
 - Perdiodically retry the request
 - Displaying a UI-blocking modal letting the user know what's going on.

# Example
# Live demos
# API

## Example

Let's do a request that will fail:

~~~js
const handli = require('handli');

const response = await handli(() => fetch('http://unreachable-server.example.org'));

// The request will never succedd,
// Handli will never resolve the promise, and
// the following line never executed
console.log('I will never make it to the console :-(');
~~~

Handli resolves the promise if and only if the request is successfull.
(That is, the server replied with a `2xx` status code.)

Handli never rejects the promise.
If a request fails,
Handli will periodically retry the request,
block the UI with an overlay,
and show a modal letting the user know of the problem and that another attempt will be tried in x seconds.

For example,
if the user looses internet connection and your website runs `await handli(() => fetch('http://example.org')`,
then the promise will never get resolved and the UI blocked forever forcing the user to leave/reload the page.
Instead it would be better to integrate such erroneous state into your application.
But this costs a lot of dev time.

But it is a better . Without any development cost.
This is the mantra of Handli:
We try to provide the best user experience with 0 developing cost.
but it certainly better than the website crashing.

For example, when the browser cannot connect to your server,
Handli will block the UI, regularly retry, and resolve the promise only once the retrying has succedded.
This is not the best user experience, but this means 0 effort for you
and this case is fully handled for you.

Handli is fully customizable.
You can progressively remove/customize Handli as your prototype grows into a serious application.

# API



