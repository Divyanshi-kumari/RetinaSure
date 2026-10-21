import {ReactNode} from 'react'
export const Section=({id,title,intro,children,tint}:{id:string;title:string;intro?:string;children?:ReactNode;tint?:boolean})=>(
<section id={id} className={tint?'bg-slate-50':''}><div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
<h2 className="font-display text-3xl md:text-4xl font-bold max-w-2xl">{title}</h2>
{intro&&<p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">{intro}</p>}{children&&<div className="mt-8">{children}</div>}</div></section>)
export const Card=({children,className=''}:{children:ReactNode;className?:string})=>
<div className={'rounded-2xl border border-slate-200 bg-white p-5 '+className}>{children}</div>
export const Metric=({label,value,note}:{label:string;value:string;note:string})=>(
<Card><div className="text-sm text-slate-500">{label}</div><div className="font-display text-3xl font-bold mt-1">{value}</div><div className="text-xs text-slate-500 mt-2">{note}</div></Card>)
export const Bar=({label,value,max=1,color='bg-teal'}:{label:string;value:number;max?:number;color?:string})=>(
<div className="flex items-center gap-3 text-sm"><span className="w-32 shrink-0">{label}</span>
<div className="h-3 flex-1 rounded-full bg-slate-100"><div className={'h-3 rounded-full '+color} style={{width:(value/max*100)+'%'}}/></div>
<span className="w-14 text-right tabular-nums">{(value*100).toFixed(1)}%</span></div>)
export const Tag=({children,tone='teal'}:{children:ReactNode;tone?:'teal'|'amber'|'slate'})=>
<span className={'inline-block rounded-full px-3 py-1 text-xs font-semibold '+({teal:'bg-teal-soft text-teal',amber:'bg-amber-100 text-amber-800',slate:'bg-slate-100 text-slate-600'})[tone]}>{children}</span>
