import {useState} from 'react'; import {Eye,Menu,X} from 'lucide-react'
import {Section,Card,Metric,Bar,Tag} from './components/ui'; import Demo from './components/Demo'
import {CLASSES,metrics as M,pct,perClass,support,SPLIT_NOTE} from './data/results'
const nav=['about','grading','framework','demo','explainability','results','dataset','limitations']
const label=(s:string)=>s[0].toUpperCase()+s.slice(1)
const desc=['No visible signs of retinopathy.','Microaneurysms only.','More than microaneurysms but less than severe.','Extensive hemorrhages or venous changes.','Abnormal new vessel growth; sight-threatening.']
const shade=['bg-teal/20','bg-teal/40','bg-amber-300','bg-orange-400','bg-red-500']
const steps=[['Fundus image','Input'],['Preprocessing','Implemented (confirm details in notebook)'],['MobileViT-S backbone','Implemented · mobilevit_s.cvnets_in1k, 384×384'],['Five-class prediction','Implemented'],['Grad-CAM','Implemented, qualitative examples only'],['Uncertainty estimation','Confidence-based risk–coverage shown; MC dropout not shown as evaluated'],['Confidence & reliability','ECE, Brier, risk–coverage on validation']]
const NE='Not yet evaluated'
const T=({t,d}:{t:string;d:string})=><div><dt className="inline font-semibold text-navy-900">{t}: </dt><dd className="inline">{d}</dd></div>
export default function App(){const [open,setOpen]=useState(false)
return(<div>
<header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
<a href="#top" className="flex items-center gap-2 font-display text-xl font-bold"><Eye className="text-teal"/>RetinaSure</a>
<nav className="hidden lg:flex gap-5 text-sm">{nav.map(n=><a key={n} href={'#'+n} className="hover:text-teal">{label(n)}</a>)}</nav>
<button className="lg:hidden" aria-label="Toggle menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div>
{open&&<nav className="lg:hidden grid gap-2 border-t px-5 py-3">{nav.map(n=><a key={n} href={'#'+n} onClick={()=>setOpen(false)}>{label(n)}</a>)}</nav>}</header>
<main id="top">
<section className="bg-gradient-to-br from-navy-900 to-navy-700 text-white"><div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2">
<div><Tag tone="amber">Research prototype — not a clinically validated diagnostic device</Tag>
<h1 className="mt-5 font-display text-4xl md:text-5xl font-bold leading-tight">Towards Trustworthy AI for Diabetic Retinopathy</h1>
<p className="mt-4 text-slate-200 max-w-lg">Explainable, uncertainty-aware diabetic retinopathy grading from retinal fundus images.</p>
<div className="mt-8 flex flex-wrap gap-3"><a href="#framework" className="rounded-full bg-teal px-6 py-3 font-semibold">Explore the Framework</a>
<a href="#demo" className="rounded-full border border-white/40 px-6 py-3 font-semibold">Try Image Demo</a></div></div>
<figure><img src="/results/gradcam_examples.png" alt="Fundus images with Grad-CAM overlays from validation examples" className="rounded-2xl max-h-[480px] w-full object-cover object-top shadow-2xl"/>
<figcaption className="mt-2 text-xs text-slate-300">Real Grad-CAM outputs from the trained model. Highlighted regions are not clinically validated.</figcaption></figure></div></section>
<Section id="about" title="About RetinaSure" intro="Automated screening can assist clinicians, but accuracy alone is not enough. A reliable system should also show what influenced a prediction, quantify uncertainty, and communicate its confidence honestly. RetinaSure studies these needs together on five-class DR grading."/>
<Section id="grading" tint title="Five-class DR grading" intro="The standard APTOS severity scale. Website outputs never replace professional diagnosis.">
<div className="grid gap-3 md:grid-cols-5">{CLASSES.map((c,i)=><Card key={c}><div className={'h-2 rounded-full '+shade[i]}/><div className="mt-3 font-semibold">{i}. {c}</div><p className="mt-1 text-sm text-slate-600">{desc[i]}</p></Card>)}</div></Section>
<Section id="framework" title="AI framework" intro="Pipeline stages and their status. Verify each against your notebook; statuses are conservative defaults.">
<ol className="grid gap-3 md:grid-cols-2">{steps.map(([a,b],i)=><li key={a}><Card className="flex justify-between gap-3"><span className="font-semibold">{i+1}. {a}</span><span className="text-sm text-slate-500 text-right">{b}</span></Card></li>)}</ol></Section>
<Section id="demo" tint title="Interactive image demo" intro="Upload a fundus image to run the trained MobileViT-S model through the API. Outputs are research results, not a diagnosis."><Demo/></Section>
<Section id="explainability" title="Explainable AI with Grad-CAM" intro="Grad-CAM uses gradients flowing into a late convolutional layer to highlight regions that most influenced a prediction. Heatmaps show model attention, not clinical findings.">
<img src="/results/gradcam_examples.png" alt="Grad-CAM examples for each true class" className="mx-auto max-h-[720px] rounded-2xl border"/>
<p className="mt-3 text-sm text-slate-600 max-w-2xl">In these samples, the No DR case is predicted at 99.59% confidence with no highlighted region. Three others are predicted at 52–56% confidence and are misclassified as Moderate (Mild and Proliferative) or correct (Moderate). The Proliferative example highlights only a corner of the image. These are qualitative samples, not a validated evaluation.</p></Section>
<Section id="results" tint title="Research results" intro={SPLIT_NOTE+' Source: best_val_metrics.json. Single MobileViT-S run; no external test set.'}>
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
<Metric label="Accuracy" value={pct(M.val_accuracy)} note="validation"/><Metric label="Macro F1" value={M.val_macro_f1.toFixed(3)} note="validation"/>
<Metric label="QWK" value={M.val_qwk.toFixed(3)} note="validation"/><Metric label="ECE" value={M.val_ece.toFixed(3)} note="validation, best checkpoint"/>
<Metric label="Brier score" value={M.val_brier.toFixed(3)} note="validation"/></div>
<div className="mt-8 grid gap-6 lg:grid-cols-2"><Card><h3 className="font-semibold mb-3">Per-class recall (from confusion matrix)</h3><div className="space-y-2">{perClass.map(p=><Bar key={p.name} label={p.name} value={p.recall}/>)}</div>
<table className="mt-4 w-full text-sm"><thead><tr className="text-left text-slate-500"><th>Class</th><th>Precision</th><th>F1</th><th>n</th></tr></thead><tbody>{perClass.map(p=><tr key={p.name}><td>{p.name}</td><td>{pct(p.precision)}</td><td>{pct(p.f1)}</td><td>{p.n}</td></tr>)}</tbody></table></Card>
<Card><h3 className="font-semibold mb-3">Validation confusion matrix</h3><img src="/results/confusion_matrix.png" alt="Validation confusion matrix" className="rounded-lg"/></Card></div>
<div className="mt-6 grid gap-6 lg:grid-cols-2"><Card><h3 className="font-semibold">Confidence-based risk–coverage</h3><img src="/results/risk_coverage_curve.png" alt="Risk–coverage curve" className="mt-3 rounded-lg"/>
<p className="mt-2 text-sm text-slate-600">Error stays near zero up to about 40% coverage and rises to roughly 17% at full coverage.</p></Card>
<Card><h3 className="font-semibold">Uncertainty and calibration terms</h3><dl className="mt-3 space-y-2 text-sm text-slate-600">
<T t="Monte Carlo dropout" d={'repeat predictions with dropout on to see how much they vary. '+NE+'.'}/>
<T t="Predictive entropy / variance" d={'how spread out the probabilities or repeated predictions are. '+NE+'.'}/>
<T t="Temperature scaling" d={'one learned value that softens overconfident probabilities. '+NE+'.'}/>
<T t="ECE" d={'gap between stated confidence and actual accuracy. Validation: '+M.val_ece.toFixed(3)+'.'}/>
<T t="Brier score" d={'mean squared error of the probabilities. Validation: '+M.val_brier.toFixed(3)+'.'}/>
<T t="Risk–coverage" d="error rate if only the most confident predictions are kept (chart at left)."/></dl></Card></div></Section>
<Section id="dataset" title="Dataset and methodology" intro="APTOS 2019 Blindness Detection, five-class grading.">
<div className="grid gap-6 lg:grid-cols-2"><Card><h3 className="font-semibold mb-3">Validation class distribution (from confusion matrix)</h3>
<div className="space-y-2">{CLASSES.map((c,i)=><Bar key={c} label={c} value={support[i]/733}/>)}</div>
<p className="mt-3 text-sm text-slate-600">{support.join(' / ')} images (733 total). Strong skew toward No DR helps explain the gap between accuracy ({pct(M.val_accuracy)}) and macro F1 ({M.val_macro_f1.toFixed(3)}).</p></Card>
<Card><ul className="space-y-2 text-sm text-slate-600"><li><b className="text-navy-900">Backbone:</b> mobilevit_s.cvnets_in1k, pretrained, 384×384 input.</li>
<li><b className="text-navy-900">Full-dataset counts and train/val split:</b> {NE} here. Copy from your notebook into <code>src/data/results.ts</code>.</li>
<li><b className="text-navy-900">Preprocessing:</b> {NE} here. Add details from your notebook.</li>
<li><b className="text-navy-900">Limits:</b> single dataset, no external validation, no clinical deployment.</li></ul></Card></div></Section>
<Section id="limitations" title="Limitations and future work">
<div className="grid gap-6 md:grid-cols-2"><Card><h3 className="font-semibold">Limitations of completed experiments</h3><ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1"><li>One public dataset, one validation split, no external validation.</li><li>Class imbalance: Severe recall {pct(perClass[3].recall)}, Proliferative recall {pct(perClass[4].recall)}.</li><li>Calibration measured on the same set used to pick the checkpoint.</li><li>Grad-CAM shown qualitatively, not validated against clinician annotations.</li></ul></Card>
<Card><h3 className="font-semibold">Proposed future work</h3><ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1"><li>External datasets and held-out test evaluation.</li><li>MC dropout and temperature scaling experiments.</li><li>Clinician review of explanations.</li><li>Prospective clinical evaluation.</li></ul></Card></div></Section>
</main>
<footer className="bg-navy-900 py-8 text-center text-sm text-slate-300 px-5">RetinaSure is a research prototype. It is not a medical device and must not be used for diagnosis.</footer></div>)}
