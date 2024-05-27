function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = []
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
import{h as n,_ as a}from"./index-BuZARGsi.js";import{C as l,g as i}from"./utils-BhGoIF5K.js";const c=new l,{offlineSimulator:o,fetch:m}=i(),s="custom_style",r=async()=>{const t=(await a(()=>import("./customStyle-B6X9ZOOV.js"),__vite__mapDeps([]))).default,e=window.document.createElement("style");Object.assign(e,{id:s,type:"text/css",innerHTML:t}),document.head.appendChild(e)},d=()=>{const t=document.getElementById(s);t.parentElement.removeChild(t)};async function y(){o.install(),setTimeout(o.remove,2e3),await r();let t;try{t=await n(()=>m("data.json"))}finally{d()}c.log(await t.text())}export{c as console,y as run};
