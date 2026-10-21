export type Prediction={label:number;probabilities:number[];uncertainty?:{entropy:number}|null;gradcam?:string|null;source:'model'|'demo'}
const URL_=import.meta.env.VITE_API_URL as string|undefined
export const isConnected=!!URL_
export async function predict(file:File):Promise<Prediction>{
 if(!URL_){await new Promise(r=>setTimeout(r,900))
  // DEMO MODE: fixed sample numbers. NOT produced by the trained model.
  return{label:2,probabilities:[0.04,0.12,0.58,0.16,0.10],source:'demo'}}
 const f=new FormData();f.append('file',file)
 const r=await fetch(URL_+'/predict',{method:'POST',body:f})
 if(!r.ok)throw new Error((await r.json().catch(()=>({detail:r.statusText}))).detail)
 return{...(await r.json()),source:'model'}}
