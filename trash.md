## Example

Let's make a failing request:

~~~js
const handli = require('handli');

const response = await handli(() => fetch('http://unreachable-server.example.org'));

// The request will never succeed,
// `handli` never resolves, and
// the following line will never execute.
console.log('I will never make it to the console :-(');
~~~

Handli periodically retries the request,
blocks the UI with an overlay,
and displays a modal letting the user know of the problem and that the request will be retried in `x` seconds.

Because our request permanently fails, `handli` never resolves.

In general, `handli` never rejects and resolves only if/once the request succeeds.
This means that you can write code as if all requests succeed
while relying on Handli for corner cases.

<br/>





~~~diff
const url = 'http://example.org';
const handli = require('handli');

-const response = await fetch(url);
+const response = await handli(() => fetch(url));

// Do something with successful response
console.log(await response.text());
~~~

That's it.
Upon error, Handli will:
 - Perdiodically retry the request.
 - Displaying a UI-blocking modal letting the user know what's going on.


