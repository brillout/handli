import{C as e,c as s}from"./utils-pEzthn16.js";import{h as o}from"./index-CfdRcoYS.js";const{slowServerSimulator:n,fetch:r}=s(),a=new e;async function c(){n.install(),o.timeoutServer=2e3;const t=await o(()=>r("data.json"));a.log("+++ Response +++",await t.text())}export{a as console,c as run};
