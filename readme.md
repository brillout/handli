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
When the user looses his internet connection,
what should happen and what should be shown to the user?
Handli aims to bring sensible defaults to such question.

To use Handli, simply wrap your requests with `handli`:
~~~diff
+import handli from 'handli'; // npm install handli
// ...
-const response = await fetch(url);
+const response = await handli(() => fetch(url));
~~~

Handli never rejects and guarantees that `response` hold a successful server reply
(that is `assert(200<=response.status && response.status<=299);`).
This means that you can **write code as if network issues are non-existent**
and rely upon Handli for handling errors.

Handli is designed to be easily and fully customizable
and to be progressively removable.
Allowing you to
**quickly ship a prototype without worrying about network corner cases**
and, as your prototype grows into a large application,
**progressively replace Handli with a custom network handling implementation**.

Live demo / usage manual:
[**brillout.github.com/handli**](https://brillout.github.com/handli).
