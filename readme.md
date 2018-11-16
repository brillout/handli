**WIP AREA**

This readme is work-in-progress.

# Handli

Handli is a little JavaScript library to automatically handle fetch errors such as network failures.

Using the network brings a lot of boilerplate burden:
 - What should be displayed to the user when there is no internet connection? When the server is unreachable?
 - Should the request be periodically retried? What should happen in the UI while retrying?
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

~~~js
const handli = require('handli'); 

const response = await handli(() => fetch('http://unreachable-server.example.org'));
// Because we are making a request 
//  - 

// We will never get to this poin
console.log('I will never be printed to the console :-(');
~~~

For example, when the browser cannot connect to your server,
Handli will block the UI, regularly retry, and resolve the promise only once the retrying has succedded.
This is not the best user experience, but this means 0 effort for you
and this case is fully handled for you.

Handli is fully customizable.
You can progressively remove/customize Handli as your prototype grows into a serious application.

# API



