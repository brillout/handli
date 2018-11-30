<br/>
<p align="center">
<a href="/../../#readme">
<img src="https://github.com/brillout/handli/raw/master/logo.svg?sanitize=true" height="34" alt="Handli"/>
</a>
</p>
<br/>
<br/>

Handli is a small JavaScript library that **handles network corner cases** for you.

It aims to bring sensible defaults to questions like:
When the user goes offline, what should happen with the UI?

~~~js
// Usage is simple
const response = await handli(() => fetch(url));
~~~

Handli is designed to be fully customizable
and progressively removable.
Allowing you to
**quickly ship a prototype without worrying about network corner cases**
and, as your prototype grows into a large application,
to **progressively replace Handli with your own network handling implementation**.

[Live Demo](https://brillout.github.com/handli).

#### Contents

- [Usage](#usage)
- [How it Works](#how-it-works)
- [FAQ](#faq)

<br/>

### Usage

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

### How it Works

The `handli` function never rejects and resolves only until it got a successful response from the server.

In other words:

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

If the server doesn't reply a `2xx` and your code doesn't handle the error,
then Handli blocks the UI,
shows a modal letting the user know what's going on,
and periodically retries the request.

You can **write code as if network issues are non-existent**
and rely upon Handli for handling errors.

The [live demo](https://brillout.github.com/handli)
shows how Handli handles
network corner cases.

<br/>

### FAQ

#### Can I customize the UI?

Yes.
See [Live Demo - Options](https://brillout.github.com/handli#options).

<br/>

#### Can I customize the texts?

Yes.
See [Live Demo - Options](https://brillout.github.com/handli#options).

<br/>

#### What if a non-2xx server reply is expected and I don't want Handli to treat it as error?

Then handle the error yourself,
see below.

<br/>

#### How do I handle errors myself?

Handle errors within your request function.

E.g., if you want to handle an API rate limit:
~~~js
const response = await fetch(async () => {
  const response = await fetch(url);
  if( response.status===429 ) {
    return RATE_LIMIT;
  } else {
    return response;
  }
});
~~~

See [Live Demo - Expected - Handled Error](https://brillout.github.com/handli#handled-error).

<br/>

#### When is the internet connection considered "slow"?

If your server isn't replying,
then Handli tests the user's internet connection.
To do so, Handli pings serveral
partitioned, high available, and low latency servers
(Google,
Facebook,
Cloudflare, and
Amazon.)

If the fastest ping is higher than `thresholdSlowInternet` then
Handli will consider the connection as "slow".

If none of the server is replying after `thresholdNoInternet` then Handli
will abort and consider the user offline.

By default `thresholdSlowInternet` is `500ms` and `thresholdNoInternet` is `900m`.

You can configure `thresholdSlowInternet` and `thresholdNoInternet`,
see [Live Demo - Options](https://brillout.github.com/handli#options).

<br/>

#### Does it work with `fetch` only?

Yes & no: It works with any fetch-like library.

More precisely, Handli works as long as:
 - `response.status` hold the status code of the response.
   (Where `response` comes from `let response = await aFetchLikeLibrary('https://example.org')`.)
 - `response.ok` holds `true` or `false` denoting whether the request was a success.
   (I.e. `assert(response.ok === 200<=response.status && response.status<=299)`.)
 - Throws if and only if a the HTTP request didn't get a HTTP response.
   (I.e. if there are connection problems or if the server is down(-ish).)

<br/>

#### Does it work on Node.js?

No. Handli only works in the browser.

<br/>

#### What about Universal / Isomorphic / SSR?

Handli supports code that runs in the browser as well as on Node.js:
When run in Node.js `handli` is transparent.

That is, on Node.js, the following

~~~js
const response = await handli(() => fetch(url));
~~~

is equivalent to

~~~js
const response = await fetch(url);
~~~

Handli does nothing and returns what your request function returns.

<br/>

#### Does it support simultaneous requests?

Yes.
Handli blocks the UI until
all requests get a successful response
(or an error handled by your code).
