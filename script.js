const $=s=>document.querySelector(s);
document.querySelector(".menu").addEventListener("click",()=>document.querySelector(".nav nav").classList.toggle("open"));

const chat=$('#chatMessages'), options=$('#chatOptions');
const steps=[
 {q:"Hi! Before we recommend anything, tell me a little about your business.", opts:["I'm ready"]},
 {q:"What does your business sell?", opts:["Products","Services","Both"]},
 {q:"How are you currently getting customers?", opts:["WhatsApp","Google","Facebook/Instagram","TikTok","Referrals","Other"]},
 {q:"What's your biggest goal right now?", opts:["More WhatsApp customers","More leads","More sales","Build a customer list","Improve my online presence"]}
];
let step=0, answers=[];
function add(text,type="ai"){const d=document.createElement("div");d.className="msg "+type;d.textContent=text;chat.appendChild(d);chat.scrollTop=chat.scrollHeight}
function render(){
 options.innerHTML="";
 if(step>=steps.length){summary();return}
 add(steps[step].q);
 steps[step].opts.forEach(x=>{const b=document.createElement("button");b.className="option";b.textContent=x;b.onclick=()=>choose(x);options.appendChild(b)})
}
function choose(x){add(x,"user");answers.push(x);step++;setTimeout(render,350)}
function summary(){
 const business=answers[1]||"your business", source=answers[2]||"your current channels", goal=answers[3]||"growth";
 add(`Thanks. You sell ${business.toLowerCase()}, you're currently using ${source.toLowerCase()}, and your main goal is ${goal.toLowerCase()}.`);
 setTimeout(()=>add("The Sales System 7-day free trial lets you experience the system before choosing Starter, Growth, or Premium. You do not need to pay or select a plan to begin."),400);
 options.innerHTML='<a class="btn primary" href="#trial" style="width:100%">Start My 7-Day Free Trial →</a>';
}
function restart(){chat.innerHTML="";options.innerHTML="";step=0;answers=[];render()}
$('#restartChat').onclick=restart; render();

$('#trialForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.currentTarget, err = $('#formError'), submit = form.querySelector('button[type=submit]');
  if (!form.checkValidity()) { err.textContent = 'Please complete all required fields before starting your trial.'; form.reportValidity(); return; }
  err.textContent = ''; submit.disabled = true; submit.textContent = 'Starting your free trial…';
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch('/.netlify/functions/trial', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    const raw = await response.text(); let result = {};
    try { result = raw ? JSON.parse(raw) : {}; } catch {}
    if (!response.ok || !result.ok) throw new Error(result.error || `Submission failed (${response.status}).`);
    form.classList.add('hidden'); $('.trial-left').classList.add('hidden'); $('#successMessage').classList.remove('hidden');
    window.scrollTo({ top: document.querySelector('#successMessage').offsetTop - 100, behavior: 'smooth' });
  } catch (error) {
    console.error('Trial submission error:', error);
    err.textContent = error.message || 'We could not submit your trial request. Please try again.';
    submit.disabled = false; submit.textContent = 'Start My 7-Day Free Trial →';
  }
});

$('#copyAccount').addEventListener('click',async()=>{
 const num="7066842385";
 try{await navigator.clipboard.writeText(num)}catch(e){const t=document.createElement("textarea");t.value=num;document.body.appendChild(t);t.select();document.execCommand("copy");t.remove()}
 $('#copyStatus').textContent="Account number copied.";
 setTimeout(()=>$('#copyStatus').textContent="",2200);
});
