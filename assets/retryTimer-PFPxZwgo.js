import{C as n,d as s}from"./utils-pEzthn16.js";import{h as e}from"./index-CfdRcoYS.js";const{serverDownSimulator:t,fetch:a}=s(),i=new n;async function c(){t.install(),setTimeout(t.remove,5e3),e.retryTimer=o=>o?o+1:1;const r=await e(()=>a("data.json"));i.log("+++ Response +++",await r.text())}export{i as console,c as run};
