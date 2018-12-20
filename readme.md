<br/>
<p align="center">
<a href="/../../#readme">
<img src="https://github.com/brillout/handli/raw/master/logo.svg?sanitize=true" height="40" alt="Handli"/>
</a>
</p>
<br/>
<br/>

JavaScript library that handles network errors.

Handli aims to bring sensible defaults to questions like:
When the user goes offline, what should happen with the UI?

It is customizable and
progressively removable.
So that you can quickly ship a prototype wihtout worrying about network errors,
and later
progressively replace Handli with your own error handling.

[Live Demo](https://brillout.github.com/handli)

&nbps;

#### Contents

- [Usage](#usage)
- [How it Works](#how-it-works)
- [FAQ](#faq)

&nbps;

## Usage

~~~shell
$ npm install handli
~~~
~~~js
import handli from 'handli';
~~~

~~~diff
-const response = await fetch(url);
+const response = await handli(() => fetch(url));
~~~

That's it.
All network errors are now handled by Handli.

<br/>

## How it Works

The `handli` function never rejects and resolves only when it gets a successful response from the server.
That is:

~~~js
import handli from 'handli';

let response;
try {
  response = await handli(() => fetch('https://example.org'));
} catch(_) {
  // `handli` never rejects
  assert(false);
}
// `handli` only resolves successful responses
assert(200<=response.status && response.status<=299);
~~~

If the server doesn't reply a `2xx`,
then Handli blocks the UI,
shows a modal letting the user know what's going on,
and periodically retries the request.

You can write code as if network issues are non-existent
and rely upon Handli for handling errors.

You can also handle errors yourself
and Handli will skip these.

<br/>

## FAQ

### Can I customize the UI?

Yes.
See
[Live Demo - Custom Style](https://brillout.github.com/handli#custom-style)
and
[Live Demo - Custom UI](https://brillout.github.com/handli#custom-ui).

### Can I customize the texts?

Yes.
See [Live Demo - Custom Text](https://brillout.github.com/handli#custom-text).

### What if a non-2xx server reply is expected and I don't want Handli to treat it as error?

Then handle the error yourself,
see below.

### How do I handle errors myself?

Handle errors within your request function.

For example, if you want to handle an API rate limit:
~~~js
const RATE_LIMIT = Symbol();

const response = await fetch(async () => {
  const response = await (
    fetch('https://api.example.org/project/42')
  );
  if( response.status===429 ) {
    return RATE_LIMIT;
  } else {
    return response;
  }
});

if( response===RATE_LIMIT ) {
  // Code handling the case when API rate limit is reached
} else {
  assert(200<=response.status && response.status<=299);
}
~~~

See [Live Demo - Handled Error](https://brillout.github.com/handli#handled-error).

### When is the user's internet connection considered slow?

If a request isn't getting a response,
then Handli tests the user's internet connection.
To do so, Handli pings
Google,
Facebook,
Cloudflare, and
Amazon.

If the fastest ping is higher than `thresholdSlowInternet` then
Handli considers the connection as slow.

If none of the ping requests get a response after `thresholdNoInternet` then Handli
considers the user offline.

By default `thresholdSlowInternet` is `500` milliseconds and `thresholdNoInternet` is `900` milliseconds.
The [Live Demo - Custom Slow Threshold](https://brillout.github.com/handli#custom-slow-threshold) shows how to change these defaults.

Note that Handli handles slow connections only if you provide a `timeout`:

~~~js
// Handli will show a UI-blocking modal if there is no response after 2 seconds
handli.timeout = 2000;

const response = await handli(
  () => fetch(url),
);
~~~

If you don't provide a `timeout` then
Handli indefinitely waits for a response
without showing the UI-blocking modal.

Alternatively to `timeout`, you can provide `timeoutInternet` and/or `timeoutServer`:
 - If the user's internet connection **is slow** and
   if a request doesn't get a response after `timeoutInternet`,
   then Handli shows the UI-blocking modal.
 - If the user's internet connection **isn't slow** and
   if a request doesn't get a response after `timeoutServer`,
   then Handli shows the UI-blocking modal.

See
[Live Demo - Slow Internet](https://brillout.github.com/handli#slow-internet)
and
[Live Demo - Unresponsive Server](https://brillout.github.com/handli#unresponsive-server).

### Does it work only with `fetch`?

Handli works with any fetch-like library.
That is, Handli works as long as:
 - `response.status` holds the status code of the response.
   (With `response` we mean `let response = await aFetchLikeLibrary('https://example.org')`.)
 - `response.ok` holds `true` or `false` denoting whether the request was a success.
   (That is `assert(response.ok === 200<=response.status && response.status<=299)`.)
 - Throws an error if and only if the request didn't get a response.
   (That is if the user has internet connection problems or if the server is not responsive.)

### Does it handle errors on Node.js?

No.
Handli handles the network only in the browser.

### What about Universal/Isomorphic/SSR?

Handli supports code that are meant to be run in the browser as well as on Node.js.

When run in Node.js, `handli` is transparent:
It does nothing and returns what your request function returns.

On Node.js, the following

~~~js
const response = await handli(() => fetch(url));
~~~

is equivalent to

~~~js
const response = await fetch(url);
~~~


### Does it support simultaneous requests?

Yes.
Handli blocks the UI until
all requests get a successful response
(or an error that is handled by you.)
