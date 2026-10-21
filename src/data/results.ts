import m from './best_val_metrics.json'
export const CLASSES=['No DR','Mild','Moderate','Severe','Proliferative DR']
// Rows = true, cols = predicted. Transcribed from public/results/confusion_matrix.png (validation set).
export const CM=[[347,12,1,0,1],[5,51,18,0,0],[0,22,163,6,9],[1,1,15,15,7],[0,5,13,10,31]]
export const metrics=m
export const pct=(x:number,d=1)=>(x*100).toFixed(d)+'%'
export const support=CM.map(r=>r.reduce((a,b)=>a+b,0))
export const perClass=CLASSES.map((c,i)=>{const tp=CM[i][i],col=CM.reduce((a,r)=>a+r[i],0)
 const p=tp/col,r=tp/support[i];return{name:c,precision:p,recall:r,f1:2*p*r/(p+r),n:support[i]}})
export const SPLIT_NOTE='Validation set (n='+support.reduce((a,b)=>a+b,0)+'), best checkpoint at epoch '+m.epoch+'.'
