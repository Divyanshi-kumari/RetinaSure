import {useEffect,useRef,useState} from 'react'
import {CLASSES} from '../data/results'

const API=((import.meta as any).env?.VITE_API_URL as string|undefined)?.replace(/\/$/,'')||'http://localhost:8000'
const desc=['No visible signs of retinopathy.','Microaneurysms only.','More than microaneurysms but less than severe.','Extensive hemorrhages or venous changes.','Abnormal new vessel growth; sight-threatening.']
type Result={label:number;probabilities:number[];uncertainty:{confidence:number;margin:number;normalized_entropy:number}|null;gradcam:string|null}
type Status='checking'|'ready'|'no-model'|'offline'
const pc=(v:number)=>(v*100).toFixed(1)+'%'

export default function Demo(){
const [status,setStatus]=useState<Status>('checking')
const [file,setFile]=useState<File|null>(null)
const [preview,setPreview]=useState<string|null>(null)
const [busy,setBusy]=useState(false)
const [err,setErr]=useState<string|null>(null)
const [res,setRes]=useState<Result|null>(null)
const input=useRef<HTMLInputElement>(null)

useEffect(()=>{let live=true
fetch(API+'/health').then(r=>r.json()).then(j=>live&&setStatus(j.model_loaded?'ready':'no-model')).catch(()=>live&&setStatus('offline'))
return()=>{live=false}},[])
useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview])

const pick=(f?:File|null)=>{if(!f)return
if(!f.type.startsWith('image/')){setErr('Please choose an image file (JPG or PNG).');return}
setFile(f);setPreview(URL.createObjectURL(f));setRes(null);setErr(null)}

const analyse=async()=>{if(!file)return
setBusy(true);setErr(null);setRes(null)
try{const fd=new FormData();fd.append('file',file)
const r=await fetch(API+'/predict',{method:'POST',body:fd})
if(!r.ok){const j=await r.json().catch(()=>null);throw new Error(j?.detail||'Request failed ('+r.status+')')}
setRes(await r.json())}
catch(e:any){setErr(e instanceof TypeError?'Cannot reach the backend at '+API+'. Is it running?':e.message);setStatus(s=>e instanceof TypeError?'offline':s)}
finally{setBusy(false)}}

const badge={checking:['bg-slate-100 text-slate-600','Checking backend…'],ready:['bg-emerald-100 text-emerald-800','Model backend connected'],
'no-model':['bg-amber-100 text-amber-800','Backend running, checkpoint not loaded'],offline:['bg-red-100 text-red-800','Backend not reachable']}[status]

return(<div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
<div className="flex flex-wrap items-center justify-between gap-2"><span className={'rounded-full px-3 py-1 text-xs font-semibold '+badge[0]}>{badge[1]}</span>
<span className="text-xs text-slate-500">Research prototype. Not for diagnosis.</span></div>
{status==='offline'&&<p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Start the API with <code>uvicorn main:app --port 8000</code> in the backend folder, then reload this page.</p>}
{status==='no-model'&&<p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Open <code>{API}/health</code> to see why the checkpoint failed to load.</p>}

<div className="mt-5 grid gap-6 md:grid-cols-2">
<div>
<div onClick={()=>input.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();pick(e.dataTransfer.files[0])}}
 className="flex min-h-[260px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-teal" role="button" tabIndex={0}
 onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')input.current?.click()}} aria-label="Upload fundus image">
{preview?<img src={preview} alt="Uploaded fundus" className="max-h-[360px] w-full object-contain"/>:<p className="px-6 text-center text-sm text-slate-500">Drop a retinal fundus image here, or click to browse</p>}</div>
<input ref={input} type="file" accept="image/*" className="hidden" onChange={e=>pick(e.target.files?.[0])}/>
<button onClick={analyse} disabled={!file||busy||status==='no-model'} className="mt-4 w-full rounded-full bg-teal px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy?'Analysing…':'Analyse image'}</button>
{err&&<p role="alert" className="mt-3 text-sm text-red-700">{err}</p>}</div>

<div>{!res&&!busy&&<p className="text-sm text-slate-500">Results from the model appear here after you upload and analyse an image.</p>}
{busy&&<p className="text-sm text-slate-500">Running the model…</p>}
{res&&<div className="space-y-4">
<div><div className="text-xs uppercase tracking-wide text-slate-500">Predicted grade</div>
<div className="text-2xl font-bold text-navy-900">{res.label}. {CLASSES[res.label]}</div><p className="text-sm text-slate-600">{desc[res.label]}</p></div>
<div className="space-y-1.5">{res.probabilities.map((p,i)=><div key={i} className="flex items-center gap-2 text-sm">
<span className="w-28 shrink-0 truncate">{CLASSES[i]}</span><div className="h-2.5 flex-1 rounded-full bg-slate-100"><div className={'h-2.5 rounded-full '+(i===res.label?'bg-teal':'bg-slate-300')} style={{width:pc(p)}}/></div><span className="w-14 text-right tabular-nums">{pc(p)}</span></div>)}</div>
{res.uncertainty&&<dl className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
<div className="rounded-lg bg-slate-50 p-2"><dt>Confidence</dt><dd className="text-base font-semibold text-navy-900">{pc(res.uncertainty.confidence)}</dd></div>
<div className="rounded-lg bg-slate-50 p-2"><dt>Top-2 margin</dt><dd className="text-base font-semibold text-navy-900">{pc(res.uncertainty.margin)}</dd></div>
<div className="rounded-lg bg-slate-50 p-2"><dt>Entropy (0–1)</dt><dd className="text-base font-semibold text-navy-900">{res.uncertainty.normalized_entropy.toFixed(2)}</dd></div></dl>}
<p className="text-xs text-slate-500">Confidence measures are taken from the softmax output. They are not Monte Carlo dropout estimates.</p>
{res.gradcam&&<div><div className="mb-1 text-xs uppercase tracking-wide text-slate-500">Grad-CAM (model attention, not clinical findings)</div><img src={res.gradcam} alt="Grad-CAM overlay" className="w-full rounded-lg border"/></div>}
</div>}</div></div></div>)}
