<br/>
<p align="center">
<a href="/../../#readme">
<img src="https://github.com/brillout/handli/raw/master/logo.svg?sanitize=true" height="40" alt="Handli"/>
</a>
</p>
<br/>
<br/>

JavaScript library that **handles network corner cases**.

Handli aims to bring sensible defaults to questions like:
When the user goes offline, what should happen with the UI?

~~~js
// Usage is simple
const response = await handli(() => fetch(url));
~~~

It is fully customizable
and progressively removable.
This allows you to
**quickly ship a prototype without worrying about network corner cases**
and, as your prototype grows into a large application,
to **progressively replace Handli with your own network handling implementation**.

[Live Demo](https://brillout.github.com/handli).

#### Contents

- [Usage](#usage)
- [How it Works](#how-it-works)
- [FAQ](#faq)

<br/>

## Usage

~~~shell
$ npm install handli
~~~
~~~js
import handli from 'handli';
~~~

Then simply wrap your requests with `handli`:

~~~diff
-const response = await fetch(url);
+const response = await handli(() => fetch(url));
~~~

That's it.
All network corner cases are now handled by Handli.

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

So, you can write code as if network issues are non-existent
and rely upon Handli for handling errors.

You can also handle errors yourself
and Handli will skip these handled errors.

<br/>

## FAQ

### Can I customize the UI?

Yes.
See
[Live Demo - Custom Style](https://brillout.github.com/handli#custom-style)
and
[Live Demo - Custom UI](https://brillout.github.com/handli#custom-ui)
.

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
  // Code that handles reached API rate limit
} else {
  assert(200<=response.status && response.status<=299);
}
~~~

See [Live Demo - Handled Error](https://brillout.github.com/handli#handled-error).

### When is the internet connection considered "slow"?

If your server isn't replying,
then Handli tests the user's internet connection.
To do so, Handli pings
Google,
Facebook,
Cloudflare, and
Amazon.

If the fastest ping is higher than `thresholdSlowInternet` then
Handli will consider the connection as "slow".

If none of the server is replying after `thresholdNoInternet` then Handli
will consider the user offline.

By default `thresholdSlowInternet` is `500` milliseconds and `thresholdNoInternet` is `900` milliseconds.
The [Live Demo - Custom Slow Threshold](https://brillout.github.com/handli#custom-slow-threshold) shows how to change these defaults.

Note that Handli handles slow connections only if you provide a `timeout` to your requests:

~~~js
// Handli will show a UI-blocking modal if there is no response after 2 seconds
handli.timeout = 2000;

const response = await handli(
  () => fetch(url),
);
~~~

If you don't provide a `timeout` then
Handli will indefinitely wait for a response
without showing the UI-blocking modal.

Alternatively to `timeout`, you can provide `timeoutInternet` and/or `timeoutServer`:
Handli will show the UI-blocking modal if the server doesn't reply after `timeoutServer` milliseconds, and
Handli will show the modal if the user as a slow internet connection and a request didn't get a response after `timeoutInternet` milliseconds.

### Does it work with `fetch` only?

Handli works with any fetch-like library.

More precisely, Handli works as long as:
 - `response.status` holds the status code of the response.
   (With `response` we mean `let response = await aFetchLikeLibrary('https://example.org')`.)
 - `response.ok` holds `true` or `false` denoting whether the request was a success.
   (That is `assert(response.ok === 200<=response.status && response.status<=299)`.)
 - Throws if and only if the request didn't get a response.
   (That is if the user has internet connection problems or if the server is not responsive.)

### Does it handle errors on Node.js?

No.
Handli only handles the network when run in the browser.

### What about Universal/Isomorphic/SSR?

Handli supports code that are run in the browser and on Node.js.

When run in Node.js, `handli` is transparent:
It does nothing and returns what your request function returns.

That is, on Node.js, the following

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
(or a handled error.)
