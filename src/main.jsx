import React, {useEffect, useMemo, useState} from 'react'
import {createRoot} from 'react-dom/client'
import './styles.css'

const TEMPLATES=[
['Steam Capsule Review',['Thumbnail readability','Game genre communication','Visual hierarchy','Title readability','Professionalism','Click appeal','Memorability']],
['Game Screenshot Review',['Visual clarity','Composition','Lighting','Art direction','Readability','Polish','Player appeal']],
['UI / UX Review',['Clarity','Navigation','Information hierarchy','Visual consistency','Accessibility','Discoverability','Ease of use']],
['Game Character Review',['Silhouette','Readability','Visual appeal','Art style consistency','Personality','Clothing / material quality','Animation compatibility']],
['Trailer Review',['First 5-second hook','Pacing','Clarity','Feature communication','Visual quality','Audio','Desire to continue watching','Desire to play / buy']],
['Logo Review',['Readability','Memorability','Uniqueness','Scalability','Brand fit','Professionalism']],
['Feature Idea Validation',['Usefulness','Clarity','Novelty','Expected frequency of use','Complexity perception','Value']],
['Game Mechanic Validation',['Understandability','Fun potential','Depth','Originality','Friction','Replay value']],
['Pricing Feedback',['Expected price','Perceived value','Purchase intent','Price sensitivity']],
['Landing Page Review',['First impression','Product understanding','Value proposition','Visual hierarchy','Trust','CTA clarity','Purchase / signup intent']]
]
const types=['Idea','Image','Video','UI/UX','Game Art','3D Asset','Animation','Trailer','Branding','Marketing','Copy/Text','Website','App','Gameplay','Audio','Other']
const roles=['Developer','Game Developer','Designer','Artist','Player','Product Designer','Programmer','Animator','Marketer','Other']

const seed={
 id:'storefront-capsule',title:'Which Storefront capsule works best?',description:"I'm preparing the Steam page for a supermarket simulator. It needs to read clearly even at small thumbnail sizes.",kind:'Image',status:'active',visibility:'public',duration:'24 hours',createdAt:Date.now()-1000*60*60*6,endsAt:Date.now()+1000*60*60*18,
 assets:[
  {title:'Option A',url:'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2670630/header.jpg',description:'Current direction'},
  {title:'Option B',url:'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2670630/capsule_616x353.jpg',description:'Alternate crop'},
  {title:'Option C',url:'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2670630/capsule_467x181.jpg',description:'Compact variation'}
 ],
 criteria:[
  {title:'First Impression',prompt:'Which version immediately grabs your attention?',type:'choice',options:['Option A','Option B','Option C']},
  {title:'Readability',prompt:'How easy is the title to read?',type:'rating',max:5},
  {title:'Genre Communication',prompt:'How clearly does this communicate supermarket simulator?',type:'rating',max:5},
  {title:'Professionalism',prompt:'How close does this feel to commercial Steam capsule artwork?',type:'rating',max:5},
  {title:'Click Appeal',prompt:'If you saw this while browsing Steam, how likely would you be to inspect the game?',type:'rating',max:5}
 ],
 responses:[
  {name:'Mira',role:'Designer',answers:['Option B',5,4,5,5],note:'B has the strongest hierarchy. I would increase the title size slightly.'},
  {name:'Anonymous',role:'Player',answers:['Option B',4,5,4,4],note:'I instantly understand the genre from B.'},
  {name:'Kai',role:'Game Developer',answers:['Option A',4,4,4,4],note:'A reads well, but B feels more premium.'}
 ]
}

function load(){
 try{const v=JSON.parse(localStorage.getItem('critdock:sprints')||'null');return v?.length?v:[seed]}catch{return [seed]}
}
function useRoute(){
 const parse=()=>location.hash.replace(/^#\/?/,'')||'home'
 const [route,setRoute]=useState(parse)
 useEffect(()=>{const f=()=>setRoute(parse());addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[])
 return route
}
const go=p=>location.hash='#/'+p
const icon=(name)=>({plus:'＋',arrow:'→',copy:'⧉',moon:'◐',check:'✓',x:'×',link:'↗',menu:'☰'}[name]||'')

const durationMs=d=>({'1 hour':3600000,'6 hours':21600000,'12 hours':43200000,'24 hours':86400000,'3 days':259200000,'7 days':604800000}[d]||null)
const timeLeft=s=>{if(!s.endsAt)return 'No deadline';const ms=s.endsAt-Date.now();if(ms<=0)return 'Ended';const h=Math.ceil(ms/3600000);return h<24?`${h}h left`:`${Math.ceil(h/24)}d left`}
const stableNoise=id=>{let h=2166136261;for(const c of String(id))h=Math.imul(h^c.charCodeAt(0),16777619);return ((h>>>0)%1000)/1000}
const exposureScore=s=>{
 const now=Date.now(),responses=s.responses?.length||0,ageH=Math.max(0,(now-(s.createdAt||now))/3600000)
 const hours=s.endsAt?Math.max(0,(s.endsAt-now)/3600000):168
 const urgency=s.endsAt?1-Math.min(1,hours/168):.15
 const need=1-Math.min(1,responses/20)
 const freshness=1-Math.min(1,ageH/168)
 const rotation=stableNoise(s.id+Math.floor(now/(1000*60*60*6)))
 return urgency*.38+need*.34+freshness*.18+rotation*.10
}

function App(){
 const route=useRoute()
 const [sprints,setSprints]=useState(load)
 const [theme,setTheme]=useState(localStorage.getItem('critdock:theme')||'dark')
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('critdock:theme',theme)},[theme])
 useEffect(()=>localStorage.setItem('critdock:sprints',JSON.stringify(sprints)),[sprints])
 const save=s=>setSprints(x=>[s,...x.filter(v=>v.id!==s.id)])
 const path=route.split('/')
 if(route==='home') return <Shell theme={theme} setTheme={setTheme}><Home sprints={sprints}/></Shell>
 if(route==='create') return <Shell theme={theme} setTheme={setTheme} minimal><Create onSave={s=>{save(s);go('dashboard')}}/></Shell>
 if(route==='templates') return <Shell theme={theme} setTheme={setTheme}><Templates/></Shell>
 if(route==='dashboard') return <Shell theme={theme} setTheme={setTheme}><Dashboard sprints={sprints} setSprints={setSprints}/></Shell>
 if(path[0]==='s'&&path[1]) return <Review sprint={sprints.find(s=>s.id===path[1])||seed} onSubmit={(id,r)=>setSprints(xs=>xs.map(s=>s.id===id?{...s,responses:[...(s.responses||[]),r]}:s))}/>
 if(path[0]==='results'&&path[1]) return <Shell theme={theme} setTheme={setTheme}><Results sprint={sprints.find(s=>s.id===path[1])||seed}/></Shell>
 return <Shell theme={theme} setTheme={setTheme}><Home/></Shell>
}

function Logo(){return <button className="logo" onClick={()=>go('home')} aria-label="CritDock home"><span className="mark"><i></i></span><b>CritDock</b></button>}
function Shell({children,theme,setTheme,minimal=false}){
 return <div className="app">
  <header><Logo/><nav className="desktopNav">{!minimal&&<><button onClick={()=>go('templates')}>Templates</button><button onClick={()=>go('dashboard')}>Dashboard</button></>}</nav>
  <div className="headerActions"><button className="iconBtn" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label="Toggle theme">{icon('moon')}</button>{!minimal&&<button className="primary sm" onClick={()=>go('create')}>{icon('plus')} Create a Crit Sprint</button>}</div></header>
  {children}
  {!minimal&&<footer><div><Logo/><p>Short feedback sprints for people who build things.</p></div><div className="footerLinks"><button onClick={()=>go('templates')}>Templates</button><button onClick={()=>go('dashboard')}>Dashboard</button><a href="https://www.buymeacoffee.com/redstoneinvente" target="_blank" rel="noreferrer">Support CritDock ↗</a></div><small>CritDock stores text and metadata. Linked media stays with its original host.</small></footer>}
 </div>
}

function Home({sprints}){
 const [query,setQuery]=useState('')
 const publicSprints=useMemo(()=>sprints.filter(s=>s.status==='active'&&(s.visibility||'public')==='public'&&(!s.endsAt||s.endsAt>Date.now())).sort((a,b)=>exposureScore(b)-exposureScore(a)),[sprints])
 const filtered=publicSprints.filter(s=>[s.title,s.description,s.kind,...(s.criteria||[]).map(c=>c.title)].join(' ').toLowerCase().includes(query.toLowerCase()))
 return <main>
  <section className="hero discoveryHero">
   <div className="eyebrow"><span></span>Fast validation for people who build things</div>
   <h1>Get useful feedback<br/>before you ship.</h1>
   <p className="heroCopy">Run quick, structured feedback sprints for your ideas, designs, assets, and prototypes. Create one in minutes, or help another builder by reviewing a live Sprint.</p>
   <div className="actions"><button className="primary" onClick={()=>go('create')}>Create a Crit Sprint {icon('arrow')}</button><a href="#discover" className="secondary">Review live Sprints</a></div>
   <div className="heroProof"><span><b>Public</b> Sprints can be discovered and searched</span><span><b>Unlisted</b> stays link-only</span><span><b>Private</b> requires an access code</span></div>
  </section>
  <section className="discovery" id="discover">
   <div className="discoverHead"><div><div className="sectionLabel">LIVE CRIT SPRINTS</div><h2>Give useful feedback. Get useful feedback.</h2><p>Public Sprints are ranked to spread attention toward work that still needs responses, with a measured boost as deadlines approach.</p></div><label className="searchBox"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Sprints, topics, criteria…"/></label></div>
   <div className="discoverMeta"><span>{filtered.length} active public Sprint{filtered.length!==1?'s':''}</span><span>Balanced by response need · freshness · time remaining</span></div>
   {filtered.length?<div className="sprintGrid">{filtered.map((s,i)=><SprintCard key={s.id} sprint={s} featured={i===0}/>)}</div>:<div className="discoverEmpty"><h3>No matching public Sprints.</h3><p>Try another search, or create the first one in this category.</p><button className="secondary" onClick={()=>go('create')}>Create a Crit Sprint</button></div>}
  </section>
  <section className="productShot" aria-label="CritDock example">
   <div className="shotTop"><div><span className="tiny">CRIT SPRINT</span><h3>Steam Capsule Review</h3></div><span className="status"><i></i>18h remaining</span></div>
   <div className="shotGrid">
    <div className="mockAsset"><div className="mockArt"><span>THE STOREFRONT</span><small>SUPERMARKET SIMULATOR</small></div><div className="mockTabs"><b>Option B</b><span>A</span><span>C</span></div></div>
    <div className="feedbackMock"><span className="step">03 / 07</span><div><small>GENRE COMMUNICATION</small><h3>Does this look like a supermarket simulation game?</h3><p>Judge what you understand at a glance.</p></div><div className="ratings">{[1,2,3,4,5].map(n=><span key={n} className={n===4?'selected':''}>{n}</span>)}</div><button>Continue {icon('arrow')}</button></div>
   </div>
   <div className="statsRow"><div><b>32</b><span>responses</span></div><div><b>87%</b><span>completion</span></div><div><b>4.6</b><span>avg. readability</span></div><div><b>62%</b><span>prefer Option B</span></div></div>
  </section>
  <section className="section" id="how"><div className="sectionLabel">HOW IT WORKS</div><h2>From question to signal in minutes.</h2><div className="threeCols">
   {[['01','Add your work','Paste text or link externally hosted images, videos, prototypes, or assets.'],['02','Choose what matters','Start from a proven template or create focused criteria from scratch.'],['03','Share and validate','Send one link. Reviewers answer quickly, with no account required.']].map(x=><div className="stepCard" key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></div>)}
  </div></section>
  <section className="section split"><div><div className="sectionLabel">BETTER QUESTIONS</div><h2>Don't ask<br/>“What do you think?”</h2><p>Unstructured feedback creates unstructured answers. CritDock gives reviewers a clear lens for each decision.</p></div><div className="questionList">
   {['Is it readable?','Does it communicate the genre?','Which variation works better?','Would you click this?','What feels unfinished?'].map((q,i)=><div key={q}><span>0{i+1}</span><b>{q}</b></div>)}
  </div></section>
  <section className="section"><div className="rowHead"><div><div className="sectionLabel">TEMPLATES</div><h2>Start with a proven structure.</h2></div><button className="secondary" onClick={()=>go('templates')}>Browse templates {icon('arrow')}</button></div><div className="templateGrid">{TEMPLATES.slice(0,8).map(([name,c],i)=><button className="template" key={name} onClick={()=>go('create')}><span>{String(i+1).padStart(2,'0')}</span><b>{name}</b><small>{c.length} criteria</small></button>)}</div></section>
  <section className="section mediaStrip"><div><div className="sectionLabel">LINK, DON'T UPLOAD</div><h2>Your media stays where it already lives.</h2><p>CritDock stores text and metadata only. Paste public links from the tools you already use.</p></div><div className="domains">{['YouTube','Vimeo','Figma','GitHub','Google Drive','Imgur','Steam','itch.io','Direct links'].map(x=><span key={x}>{x}</span>)}</div></section>
  <section className="free"><div><span className="sectionLabel">FREE FOR DEVELOPERS</span><h2>Keep the storage.<br/>Keep the useful feedback.</h2></div><div><p>CritDock stays lightweight by leaving large media with its original host. No complicated pricing page. No artificial limits designed to force an upgrade.</p><button className="primary" onClick={()=>go('create')}>Create a Crit Sprint {icon('arrow')}</button></div></section>
 </main>
}

function SprintCard({sprint,featured}){
 const asset=sprint.assets?.[0]
 const preview=asset?.url&&(/\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(asset.url)||asset.url.includes('steamstatic.com'))
 return <button className={'sprintCard'+(featured?' featured':'')} onClick={()=>go('s/'+sprint.id)}>
  <div className="sprintPreview">{preview?<img src={asset.url} alt=""/>:<div className="sprintFallback"><span className="mark"><i/></span><b>{sprint.kind}</b></div>}<span className="visibilityBadge">Public</span></div>
  <div className="sprintCardBody"><div className="sprintCardMeta"><span>{sprint.kind}</span><span>{timeLeft(sprint)}</span></div><h3>{sprint.title}</h3><p>{sprint.description||'A focused Crit Sprint looking for feedback.'}</p><div className="sprintCardFoot"><span><b>{sprint.responses?.length||0}</b> responses</span><span>{sprint.criteria?.length||0} criteria</span><strong>Review {icon('arrow')}</strong></div></div>
 </button>
}

function Templates(){
 return <main className="page narrow"><div className="pageIntro"><div className="sectionLabel">TEMPLATES</div><h1>Start focused, not from zero.</h1><p>Each template gives you a practical set of criteria. Change, remove, or add anything before sharing.</p></div>
 <div className="templateList">{TEMPLATES.map(([name,criteria],i)=><button key={name} onClick={()=>go('create')}><div><span>{String(i+1).padStart(2,'0')}</span><h3>{name}</h3></div><p>{criteria.slice(0,4).join(' · ')}{criteria.length>4?' · …':''}</p><b>{criteria.length} criteria {icon('arrow')}</b></button>)}</div></main>
}

function Create({onSave}){
 const [step,setStep]=useState(0),[template,setTemplate]=useState(null)
 const [data,setData]=useState({title:'',description:'',kind:'Image',duration:'24 hours',visibility:'public',privateCode:'',assets:[{title:'Option A',description:'',url:'',text:''}],criteria:[]})
 const applyTemplate=t=>{setTemplate(t);setData(d=>({...d,criteria:TEMPLATES.find(x=>x[0]===t)[1].map(c=>({title:c,prompt:'',type:'rating',max:5}))}));setStep(1)}
 const addAsset=()=>setData(d=>({...d,assets:[...d.assets,{title:'Option '+String.fromCharCode(65+d.assets.length),description:'',url:'',text:''}]}))
 const addCriterion=()=>setData(d=>({...d,criteria:[...d.criteria,{title:'New criterion',prompt:'',type:'rating',max:5}]}))
 const publish=()=>{const slug=(data.title||'crit-sprint').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,34)+'-'+Math.random().toString(36).slice(2,6);const createdAt=Date.now(),ms=durationMs(data.duration),privateCode=data.visibility==='private'?(data.privateCode.trim()||Math.random().toString(36).slice(2,8).toUpperCase()):'';onSave({...data,id:slug,status:'active',createdAt,endsAt:ms?createdAt+ms:null,privateCode,responses:[]})}
 return <main className="creator">
  <div className="creatorTop"><div><button className="backLink" onClick={()=>step?setStep(step-1):go('home')}>← Back</button><span className="muted">Create a Crit Sprint</span></div><div className="progressTiny"><span>{step+1}/4</span><i><b style={{width:(step+1)*25+'%'}}/></i></div></div>
  {step===0&&<div className="createPanel"><div className="createHead"><div className="sectionLabel">STARTING POINT</div><h1>What are you reviewing?</h1><p>Use a template for a fast start, or build your own Sprint from scratch.</p></div><div className="choiceGrid"><button className="startBlank" onClick={()=>{setTemplate('Custom');setStep(1)}}><span>{icon('plus')}</span><b>Start from scratch</b><small>Build your own criteria</small></button>{TEMPLATES.map(([name,c])=><button key={name} onClick={()=>applyTemplate(name)}><b>{name}</b><small>{c.length} ready-to-edit criteria</small><span>{icon('arrow')}</span></button>)}</div></div>}
  {step===1&&<div className="createPanel compact"><div className="createHead"><div className="sectionLabel">01 · BASICS</div><h1>Set the context.</h1><p>Give reviewers just enough information to judge the work properly.</p></div><Field label="Sprint title" hint="Be specific about the decision you need help with."><input value={data.title} onChange={e=>setData({...data,title:e.target.value})} placeholder="Which capsule communicates supermarket simulation best?"/></Field><Field label="Context" optional><textarea value={data.description} onChange={e=>setData({...data,description:e.target.value})} placeholder="What should reviewers know before they start?"/></Field><div className="fieldRow"><Field label="What are you validating?"><select value={data.kind} onChange={e=>setData({...data,kind:e.target.value})}>{types.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Sprint duration"><select value={data.duration} onChange={e=>setData({...data,duration:e.target.value})}>{['No deadline','1 hour','6 hours','12 hours','24 hours','3 days','7 days'].map(x=><option key={x}>{x}</option>)}</select></Field></div><Field label="Who can access this Sprint?"><div className="visibilityChoices">{[['public','Public','Searchable and eligible for homepage discovery.'],['unlisted','Unlisted','Only people with the link can find it.'],['private','Private','Hidden from discovery and protected by an access code.']].map(([v,n,d])=><button type="button" key={v} className={data.visibility===v?'active':''} onClick={()=>setData({...data,visibility:v})}><span>{data.visibility===v?'●':'○'}</span><div><b>{n}</b><small>{d}</small></div></button>)}</div></Field>{data.visibility==='private'&&<Field label="Private access code" hint="Leave blank and CritDock will generate one for you."><input value={data.privateCode} onChange={e=>setData({...data,privateCode:e.target.value.toUpperCase()})} placeholder="e.g. BUILD42"/></Field>}<div className="nextBar"><span>Template: <b>{template}</b></span><button className="primary" disabled={!data.title.trim()} onClick={()=>setStep(2)}>Add your work {icon('arrow')}</button></div></div>}
  {step===2&&<div className="createPanel compact"><div className="createHead"><div className="sectionLabel">02 · CONTENT</div><h1>Add what you're validating.</h1><p>CritDock does not host your media. Paste a public link to your image, video, prototype, or asset.</p></div>{data.assets.map((a,i)=><div className="assetEditor" key={i}><div className="assetNum">{String(i+1).padStart(2,'0')}</div><div><Field label="Label"><input value={a.title} onChange={e=>{const assets=[...data.assets];assets[i]={...a,title:e.target.value};setData({...data,assets})}}/></Field>{data.kind==='Copy/Text'?<Field label="Text"><textarea value={a.text} onChange={e=>{const assets=[...data.assets];assets[i]={...a,text:e.target.value};setData({...data,assets})}} placeholder="Paste the text to review…"/></Field>:<Field label="Public URL"><input type="url" value={a.url} onChange={e=>{const assets=[...data.assets];assets[i]={...a,url:e.target.value};setData({...data,assets})}} placeholder="https://…"/></Field>}<Field label="Description" optional><input value={a.description} onChange={e=>{const assets=[...data.assets];assets[i]={...a,description:e.target.value};setData({...data,assets})}} placeholder="What makes this option different?"/></Field></div>{data.assets.length>1&&<button className="remove" onClick={()=>setData({...data,assets:data.assets.filter((_,j)=>j!==i)})}>Remove</button>}</div>)}<button className="addRow" onClick={addAsset}>{icon('plus')} Add another option</button><div className="nextBar"><span>{data.assets.length} option{data.assets.length!==1?'s':''}</span><button className="primary" onClick={()=>setStep(3)}>Define feedback {icon('arrow')}</button></div></div>}
  {step===3&&<div className="createPanel compact"><div className="createHead"><div className="sectionLabel">03 · CRITERIA</div><h1>Ask what actually matters.</h1><p>Keep each section focused. Reviewers will move through these one at a time.</p></div>{data.criteria.map((c,i)=><div className="criterionEditor" key={i}><div className="criterionNo">{String(i+1).padStart(2,'0')}</div><div><input className="criterionTitle" value={c.title} onChange={e=>{const criteria=[...data.criteria];criteria[i]={...c,title:e.target.value};setData({...data,criteria})}}/><input value={c.prompt} onChange={e=>{const criteria=[...data.criteria];criteria[i]={...c,prompt:e.target.value};setData({...data,criteria})}} placeholder="Optional question or instruction"/><select value={c.type} onChange={e=>{const criteria=[...data.criteria];criteria[i]={...c,type:e.target.value};setData({...data,criteria})}}><option value="rating">Rating 1–5</option><option value="choice">Single choice</option><option value="yesno">Yes / No</option><option value="short">Short text</option></select></div><button className="remove" onClick={()=>setData({...data,criteria:data.criteria.filter((_,j)=>j!==i)})}>Remove</button></div>)}<button className="addRow" onClick={addCriterion}>{icon('plus')} Add criterion</button><div className="finalFeedback"><b>Anything else?</b><span>Always included · optional free-form feedback</span><p>Have something the questions didn't cover? Leave any additional thoughts here.</p></div><div className="nextBar"><span>{data.criteria.length} criteria + final thoughts</span><button className="primary" onClick={publish} disabled={!data.criteria.length}>Publish Crit Sprint {icon('arrow')}</button></div></div>}
 </main>
}
function Field({label,hint,optional,children}){return <label className="field"><span>{label}{optional&&<em>Optional</em>}</span>{hint&&<small>{hint}</small>}{children}</label>}

function Media({asset}){
 const u=asset?.url||''
 if(asset?.text)return <div className="textAsset">{asset.text}</div>
 const yt=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/)
 if(yt)return <iframe className="embed" src={'https://www.youtube-nocookie.com/embed/'+yt[1]} title={asset.title} loading="lazy" allowFullScreen/>
 if(/\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(u)||u.includes('steamstatic.com'))return <img src={u} alt={asset.title} loading="lazy"/>
 if(u)return <a className="externalPreview" href={u} target="_blank" rel="noopener noreferrer"><span>{new URL(u).hostname}</span><b>Open {asset.title||'linked asset'} ↗</b><small>External content opens in a new tab.</small></a>
 return <div className="emptyMedia">No preview URL provided</div>
}
function Review({sprint,onSubmit}){
 const [idx,setIdx]=useState(-1),[answers,setAnswers]=useState([]),[asset,setAsset]=useState(0),[note,setNote]=useState(''),[done,setDone]=useState(false),[info,setInfo]=useState({name:'',role:''}),[code,setCode]=useState(''),[unlocked,setUnlocked]=useState(sprint.visibility!=='private')
 const criteria=sprint.criteria||[]
 const total=criteria.length+1
 if(!unlocked)return <div className="privateGate"><Logo/><main><div className="sectionLabel">PRIVATE CRIT SPRINT</div><h1>Access required.</h1><p>This Sprint is private. Enter the access code from its creator to continue.</p><input autoFocus value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Access code"/><button className="primary wide" onClick={()=>setUnlocked(code.trim()===sprint.privateCode)}>Open Crit Sprint {icon('arrow')}</button>{code&&code.trim()!==sprint.privateCode&&<small>Code does not match.</small>}</main></div>
 const current=criteria[idx]
 const answer=(v)=>{const a=[...answers];a[idx]=v;setAnswers(a)}
 const submit=()=>{onSubmit(sprint.id,{...info,name:info.name||'Anonymous',answers,note,createdAt:Date.now()});setDone(true)}
 if(done)return <div className="reviewDone"><Logo/><div><span className="checkCircle">{icon('check')}</span><h1>Feedback sent.</h1><p>Thanks. Your response has been added to this Crit Sprint.</p><button className="secondary" onClick={()=>go('home')}>What is CritDock?</button></div></div>
 if(idx===-1)return <div className="reviewIntro"><div className="reviewHeader"><Logo/><span>Feedback Sprint · {sprint.duration||'No deadline'}</span></div><main><div className="introMeta"><span>{sprint.kind}</span><span>·</span><span>{criteria.length} criteria</span><span>·</span><span>~{Math.max(1,Math.ceil(criteria.length*.35))} min</span></div><h1>{sprint.title}</h1><p>{sprint.description}</p><div className="introPreview"><Media asset={sprint.assets?.[0]}/></div><div className="identity"><div><h3>Before you start</h3><p>You can stay anonymous, or add a little context to your feedback.</p></div><input placeholder="Name or alias (optional)" value={info.name} onChange={e=>setInfo({...info,name:e.target.value})}/><select value={info.role} onChange={e=>setInfo({...info,role:e.target.value})}><option value="">Role (optional)</option>{roles.map(r=><option key={r}>{r}</option>)}</select></div><button className="primary wide" onClick={()=>setIdx(0)}>Start feedback {icon('arrow')}</button></main></div>
 const isFinal=idx===criteria.length
 return <div className="reviewPage"><div className="reviewTop"><Logo/><div className="reviewProgress"><span>{Math.min(idx+1,total)} / {total}</span><i><b style={{width:(Math.min(idx+1,total)/total*100)+'%'}}/></i></div><span className="quiet">{sprint.duration}</span></div><div className="reviewGrid"><section className="assetPane"><div className="assetStage"><Media asset={sprint.assets?.[asset]}/></div>{(sprint.assets?.length||0)>1&&<div className="assetTabs">{sprint.assets.map((a,i)=><button key={i} className={asset===i?'active':''} onClick={()=>setAsset(i)}>{a.title}</button>)}</div>}</section><aside className="questionPane">{!isFinal?<><div><span className="sectionLabel">{current.title}</span><h2>{current.prompt||current.title}</h2><p>Answer based on your immediate impression. There are no right answers here.</p></div><Question q={current} value={answers[idx]} onChange={answer}/><div className="reviewNav"><button className="secondary" onClick={()=>setIdx(Math.max(0,idx-1))} disabled={idx===0}>Back</button><button className="primary" onClick={()=>setIdx(idx+1)} disabled={answers[idx]===undefined||answers[idx]===''}>Continue {icon('arrow')}</button></div></>:<><div><span className="sectionLabel">FINAL THOUGHTS</span><h2>Anything else?</h2><p>Have something the questions didn't cover? Leave any additional thoughts here.</p></div><textarea className="bigNote" value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional feedback…"/><div className="reviewNav"><button className="secondary" onClick={()=>setIdx(idx-1)}>Back</button><button className="primary" onClick={submit}>Submit feedback {icon('arrow')}</button></div></>}</aside></div></div>
}
function Question({q,value,onChange}){
 if(q.type==='choice')return <div className="optionStack">{(q.options||['Option A','Option B','Option C']).map(o=><button key={o} className={value===o?'active':''} onClick={()=>onChange(o)}><span>{value===o?'●':'○'}</span>{o}</button>)}</div>
 if(q.type==='yesno')return <div className="optionStack">{['Yes','No'].map(o=><button key={o} className={value===o?'active':''} onClick={()=>onChange(o)}>{o}</button>)}</div>
 if(q.type==='short')return <textarea className="shortAnswer" value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Your answer…"/>
 return <div className="ratingBlock"><div className="ratingRow">{[1,2,3,4,5].map(n=><button key={n} className={value===n?'active':''} onClick={()=>onChange(n)}>{n}</button>)}</div><div className="ratingLabels"><span>Low</span><span>High</span></div></div>
}

function Dashboard({sprints,setSprints}){
 const [tab,setTab]=useState('Active')
 const filtered=sprints.filter(s=>tab==='Active'?s.status==='active':tab==='Completed'?s.status==='closed':s.status==='draft')
 const remove=id=>setSprints(x=>x.filter(s=>s.id!==id))
 return <main className="page dashboard"><div className="dashHead"><div><div className="sectionLabel">WORKSPACE</div><h1>Your Crit Sprints</h1></div><button className="primary" onClick={()=>go('create')}>{icon('plus')} Create a Crit Sprint</button></div><div className="tabs">{['Active','Completed','Drafts','Templates'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>t==='Templates'?go('templates'):setTab(t)}>{t}</button>)}</div>{filtered.length?<div className="sprintTable">{filtered.map(s=><div className="sprintRow" key={s.id}><div><span className={'state '+s.status}><i></i>{s.status}</span><button className="titleBtn" onClick={()=>go('results/'+s.id)}>{s.title}</button><small>{s.kind} · {s.criteria.length} criteria · {(s.visibility||'public')}</small></div><div className="metric"><b>{s.responses?.length||0}</b><span>responses</span></div><div className="metric"><b>{s.duration}</b><span>duration</span></div><div className="rowActions"><button onClick={()=>navigator.clipboard?.writeText(location.href.split('#')[0]+'#/s/'+s.id)}>Copy link</button><button onClick={()=>setSprints(xs=>xs.map(x=>x.id===s.id?{...x,status:x.status==='active'?'closed':'active'}:x))}>{s.status==='active'?'Close':'Reopen'}</button><button className="danger" onClick={()=>remove(s.id)}>Delete</button></div></div>)}</div>:<div className="emptyState"><span className="mark big"><i></i></span><h3>No {tab.toLowerCase()} Sprints.</h3><p>Create a quick feedback Sprint and send it to a few people.</p><button className="primary" onClick={()=>go('create')}>Create Crit Sprint</button></div>}</main>
}

function Results({sprint}){
 const responses=sprint.responses||[]
 const ratingStats=sprint.criteria.map((c,i)=>{const nums=responses.map(r=>r.answers?.[i]).filter(v=>typeof v==='number');return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:null})
 const choice=sprint.criteria.map((c,i)=>{const vals=responses.map(r=>r.answers?.[i]).filter(v=>typeof v==='string');return vals.reduce((o,v)=>(o[v]=(o[v]||0)+1,o),{})})
 const exportJson=()=>download(JSON.stringify(sprint,null,2),'critdock-'+sprint.id+'.json','application/json')
 const exportCsv=()=>{const rows=[['Name','Role',...sprint.criteria.map(c=>c.title),'Additional feedback'],...responses.map(r=>[r.name,r.role,...(r.answers||[]),r.note])];download(rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n'),'critdock-'+sprint.id+'.csv','text/csv')}
 return <main className="page results"><div className="resultsHead"><div><button className="backLink" onClick={()=>go('dashboard')}>← Dashboard</button><div className="sectionLabel">RESULTS</div><h1>{sprint.title}</h1><p>{sprint.description}</p></div><div className="resultActions"><button className="secondary" onClick={()=>navigator.clipboard?.writeText(location.href.split('#')[0]+'#/s/'+sprint.id)}>Copy share link</button><button className="secondary" onClick={exportCsv}>CSV</button><button className="secondary" onClick={exportJson}>JSON</button></div></div><div className="summaryStats"><div><b>{responses.length}</b><span>Responses</span></div><div><b>{responses.length?'100%':'0%'}</b><span>Completion rate</span></div><div><b>{ratingStats.filter(Boolean).length?(ratingStats.filter(Boolean).reduce((a,b)=>a+b,0)/ratingStats.filter(Boolean).length).toFixed(1):'—'}</b><span>Average rating</span></div></div><section className="resultsSection"><div className="sectionLabel">CRITERIA</div><h2>Signal by question</h2><div className="criteriaResults">{sprint.criteria.map((c,i)=><div className="resultCard" key={i}><div><span>{String(i+1).padStart(2,'0')}</span><div><h3>{c.title}</h3><p>{c.prompt}</p></div></div>{ratingStats[i]!=null?<><b className="score">{ratingStats[i].toFixed(1)}<small>/ 5</small></b><div className="bar"><i style={{width:ratingStats[i]/5*100+'%'}}/></div></>:<div className="choiceBars">{Object.entries(choice[i]).sort((a,b)=>b[1]-a[1]).map(([k,v])=><div key={k}><span>{k}</span><i><b style={{width:(v/Math.max(1,responses.length))*100+'%'}}/></i><strong>{Math.round(v/Math.max(1,responses.length)*100)}%</strong></div>)}</div>}</div>)}</div></section><section className="resultsSection"><div className="sectionLabel">WRITTEN FEEDBACK</div><h2>Additional thoughts</h2><div className="feedbackList">{responses.filter(r=>r.note).length?responses.filter(r=>r.note).map((r,i)=><article key={i}><p>“{r.note}”</p><div><b>{r.name||'Anonymous'}</b><span>{r.role||'No role provided'}</span></div></article>):<div className="noFeedback">No written feedback yet.</div>}</div></section></main>
}
function download(content,name,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}

createRoot(document.getElementById('root')).render(<App/>)
