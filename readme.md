**WIP AREA** - This package and this readme are work-in-progress.

# Handli

Handli is a little JavaScript library that automatically handles network corner cases.

When the user looses his internet connection,
what should happen and what should be shown to the user?

Handli aims to bring sensible defaults to such questions.

###### Why Handli

Handli doesn't know your app and can provide a good user experience only to a certain extent.
A customized network handling tailored to your app is prefered.

That said, Handli handles *all* network corner cases.
So, you can quickly ship a prototype without worrying about network corner cases at first.
You can later progressively replace Handli with a custom network handling implementation.

The live demo shows how Handli handles all network corner cases.

###### Usage

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

#### Contents

 - [Example](#example)
 - [Live Demo](#live-demo)
 - [API](#API)


<br/>

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

## Live Demo

[WIP]

<br/>

## API

### `handli`

Usage:
~~~js
  const handli = require('handli');
  const response = await handli(
    () => someFetchLikeLibrary('http://example.org'),
    {displayError}
  );
  assert(200 <= response.status && response.status <= 299);
~~~

Where:
 - `someFetchLikeLibrary`
    is a request library with a
    [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)-like interface.
 - `const {close, update} = displayError(errorMessage);`
    is a function to customize how error messages are shown to the user.
    It is optional and, if missing, Handli will show a UI-blocking modal displaying the error message.
    Handli expects `displayError` to return `close` and `update` functions.
    Handli calls `close` when the error resolves and calls `update` when the error message changes.
    The argument `errorMessage` is the error message to be shown to the user.

###### Notes

 - `handli` resolves if and only if the server replies with a `2xx` status code.

    Any other status code is treated as error.

    Thus, the common `response.ok` handling is superfluous with Handli:
    ~~~diff
    -const response = await fetch(url);
    -if( !response.ok ) {
    -  throw new Error(response.statusText);
    -}
    +const response = await handli(() => fetch(url));

    // This assertion holds before and after our change
    assert(200 <= response.status && response.status <= 299);
    ~~~

 - `handli` never rejects.

    That is:
    ~~~js
    try {
      const response = await handli(() => fetch(url));
    } catch(err) {
      // This will never happen
      assert(false);
    }
    ~~~
