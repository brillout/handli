<br/>
<p align="center">
<a href="/../../#readme">
<img src="https://github.com/brillout/handli/raw/master/logo.svg?sanitize=true" height="34" alt="Handli"/>
</a>
</p>
<br/>
<br/>

Handli is a small JavaScript library that **handles network corner cases** for you.

For example:
When the user goes offline,
what should happen with the UI?
Handli aims to bring sensible defaults to such question.

To use it, simply wrap your requests with `handli`:
~~~diff
+import handli from 'handli'; // npm install handli
// ...
-const response = await fetch(url);
+const response = await handli(() => fetch(url));
~~~

`await handli` never rejects and resolves only until it got a successful response from the server.
If the server doesn't reply a `2xx` and your code doesn't handle the error,
then Handli blocks the UI,
shows a modal letting the user know what's going on,
and periodically retries the request.

You can **write code as if network issues are non-existent**
and rely upon Handli for handling errors.

Handli is designed to be fully customizable
and progressively removable.
Allowing you to
**quickly ship a prototype without worrying about network corner cases**
and, as your prototype grows into a large application,
to **progressively replace Handli with your own network handling implementation**.

[Live demo & usage manual](https://brillout.github.com/handli).
