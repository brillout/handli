import{h as e}from"./index-7yBawPm3.js";import{C as s,b as t}from"./utils-DHf2ZKMr.js";const a=new s,{serverErrorSimulator:n,fetch:i}=t();async function l(){n.install(),setTimeout(n.remove,2e3),e.messages.ERROR=`An unexpected error occured.

We have been notified and we are 
working on fixing the issue.
`,e.messages.RETRYING_IN=r=>"Reytring in: "+r;const o=await e(()=>i("data.json"));a.log("+++ Response +++",await o.text())}export{a as console,l as run};
