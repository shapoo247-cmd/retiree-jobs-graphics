// Verifies every cue sheet item is defined with the cue sheet duration, and lists the IDs. Usage: node src/check.mjs [--files]
import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const STY=process.env.STYLE||'';const code=fs.readFileSync(path.join(here,STY,'items.js'),'utf8');
const sandbox={clamp:(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),easeOut:x=>x,Image:class{},document:{createTextNode:()=>({})}};
vm.createContext(sandbox);vm.runInContext(code+';this.ITEMS=ITEMS;',sandbox);
const rows=fs.readFileSync(path.join(here,'..','docs','cue-sheet.csv'),'utf8').trim().split('\n').slice(1).map(l=>l.split(','));
let bad=0;for(const r of rows){const id=r[0],dur=parseFloat(r[5]);const it=sandbox.ITEMS[id];
  if(!it){console.log('MISSING',id);bad++;continue;}
  if(Math.abs(it.dur-dur)>0.005){console.log('DUR',id,it.dur,dur);bad++;}}
console.log(rows.length,'cue items,',bad,'problems');
if(process.argv.includes('--files'))console.log(rows.map(r=>r[0]).join(' '));
