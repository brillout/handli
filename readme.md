<br/>
<p align="center">
<a href="/../../#readme">
<img src="https://github.com/brillout/handli/raw/main/logo.svg?sanitize=true" height="45" alt="Handli"/>
</a>
</p>
<br/>

JavaScript library to automatically handle connection issues.

Handli brings sensible defaults to questions like:
- What should happen when the user has a flaky internet connection?
- What should happen when the user is offline?
- What should happen when the server is overloaded and not responsive?
- What should happen when the server replies `500 - Internal Server Error`?
- ...

With Handli, you can forget about connection issues and let Handli gracefully take care of these situations.

> [!NOTE]  
> The main idea of Handli is that, if there is a connection issue, the UI is made read-only (by displaying a temporary overlay that blocks user clicks, and thus blocks the user from interacting with the UI). The user can still read/scroll the page (see [#6](https://github.com/brillout/handli/issues/6)). When the connection issue resolves, then the UI returns to its normal state.

If you have specific needs, you can (progressively) customize and override Handli's behavior.

Handli covers all (edge) cases using sensible defaults, all you have to do is wrap your fetch requests:

~~~js
// ❌ TODO: handle connection issues.
const response = await fetch(url)
~~~
~~~js
// ✅ Connection issues are hanlded by Handli.
const response = await handli(() => fetch(url))
~~~


That's it: all connection issues are now gracefully handled.

> [!NOTE]  
> The promise `await handli(...)` never rejects. (Although it may never resolve if the connection isssue never resolves.)
>
> Thus you can skip the usual `try...catch` for handling connection issues: instead you assume the promise to always resolve.
>
> In other words: you can develop your app as if connection issues are non-existent.

Handli is [fully customizable](#usage-faq) and [progressively removable](#how-do-i-progressively-remove-handli).

[**Live Demo**](https://brillout.github.io/handli)

> [!NOTE]  
> 🚧 This project is work-in-progress and I'm looking for [contributions](https://github.com/brillout/handli/issues) and/or a lead maintainer. This project has the potential to have a significant impact.

<br/><br/>



#### Contents

- [Usage](#usage)
- [How it Works](#how-it-works)
- [Usage FAQ](#usage-faq)

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
Connection issues are now automatically handled by Handli.

<br/>

## How it Works

The `handli` function never rejects.

~~~js
import handli from 'handli';

let response;
try {
  response = await handli(() => fetch('https://example.org/api/getData'));
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
The `handli` function "hangs"
until the server returns a `2xx`.
(That is, the promise returned by `handli` hangs: it doesn't resolve nor reject.)

The `handli` function resolves only once it gets a `2xx`.

If the server never replies a `2xx` then `handli` hangs indefinitely.
~~~js
import handli from 'handli';

// Trying to retrieve a resource that doesn't exist.
await handli(() => fetch('https://example.org/api/i-do-not-exist'));

// The server never replies a `2xx` and `handli` never
// resolves. Nothing here will ever be executed.
console.log("You will never see me");
~~~

You can handle errors yourself in your request function.
For example, you may want to handle validation errors:
~~~js
import handli from 'handli';

const response = await handli(async () => {
  const response = await fetch('https://example.org/api/createTodo');
  if( response.status===400 ){
    const {validationError} = await response.json();
    return {validationError};
  }
  return response;
});

if( response.validationError ){
  // Handle validation error
  // ...
} else {
  assert(200<=response.status && response.status<=299);
  // ...
}
~~~


<br/>

## Usage FAQ

- [Can I customize the UI?](#can-i-customize-the-ui)
- [Can I customize the texts?](#can-i-customize-the-texts)
- [What if a non-2xx server reply is expected and I don't want Handli to treat it as error?](#what-if-a-non-2xx-server-reply-is-expected-and-i-dont-want-handli-to-treat-it-as-error)
- [How do I handle errors myself?](#how-do-i-handle-errors-myself)
- [When is the user's internet connection considered slow?](#when-is-the-users-internet-connection-considered-slow)
- [Does it work only with `fetch`?](#does-it-work-only-with-fetch)
- [Does it handle errors on Node.js?](#does-it-handle-errors-on-nodejs)
- [What about Universal/Isomorphic/SSR?](#what-about-universalisomorphicssr)
- [Does it support simultaneous requests?](#does-it-support-simultaneous-requests)
- [How do I progressively remove Handli?](#how-do-i-progressively-remove-handli)

### Can I customize the UI?

Yes.
See
[Live Demo - Custom Style](https://brillout.github.io/handli#custom-style)
and
[Live Demo - Custom UI](https://brillout.github.io/handli#custom-ui).

### Can I customize the texts?

Yes.
See [Live Demo - Custom Text](https://brillout.github.io/handli#custom-text).

### What if a non-2xx server reply is expected and I don't want Handli to treat it as error?

Then handle the error yourself,
see below.

### How do I handle errors myself?

You can handle errors yourself in your request function.

Examples.

~~~js
import handli from 'handli';

const RATE_LIMIT = Symbol();

// We handle the API rate limit.

const response = await handli(async () => {
  const response = await fetch('https://example.org/api/project/42');
  if( response.status===429 ) {
    return RATE_LIMIT;
  }
  return response;
});

if( response===RATE_LIMIT ) {
  // Code handling the case when API rate limit is reached
  // ...
} else {
  assert(200<=response.status && response.status<=299);
  // ...
}
~~~

~~~js
import handli from 'handli';

// We handle validation errors.

const response = await handli(async () => {
  const response = await fetch('https://example.org/api/createTodo');
  if( response.status===400 ){
    const {validationError} = await response.json();
    return {validationError};
  }
  return response;
});

if( response.validationError ){
  // Handle validation error
  // ...
} else {
  assert(200<=response.status && response.status<=299);
  // ...
}
~~~

See [Live Demo - Handled Error](https://brillout.github.io/handli#handled-error).

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
The [Live Demo - Custom Slow Threshold](https://brillout.github.io/handli#custom-slow-threshold) shows how to change these defaults.

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
[Live Demo - Slow Internet](https://brillout.github.io/handli#slow-internet)
and
[Live Demo - Unresponsive Server](https://brillout.github.io/handli#unresponsive-server).

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
Handli handles connection issues only in the browser.

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
(or an error that is handled by you).


### How do I progressively remove Handli?

[Handle errors yourself](#how-do-i-handle-errors-myself)
at more and more places
until you can remove your dependency on the `handli` package.

This can be useful strategy
to quickly ship a prototype wihtout worrying about connection issues at first,
and later,
as your prototype grows into a large application,
progressively replace Handli with your own error handling.
