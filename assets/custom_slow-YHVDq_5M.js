import{h as t}from"./index-BuZARGsi.js";import{C as e,a as n}from"./utils-BhGoIF5K.js";const s=new e,{slowInternetSimulator:a,fetch:r}=n(1100);async function c(){a.install(),t.timeout=3e3,t.thresholdSlowInternet=1e3,t.thresholdNoInternet=2e3;const o=await t(()=>r("data.json"));s.log("+++ Response +++",await o.text())}export{s as console,c as run};