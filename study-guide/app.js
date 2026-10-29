'use strict';
const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pretty = value => typeof value === 'string' ? value : JSON.stringify(value);
let lesson='save', scenario='ok', stepIndex=0, questionIndex=0;
function highlight(line){return esc(line).replace(/(&quot;.*?&quot;|&#39;.*?&#39;)|\b(def|if|elif|else|for|in|not|or|and|try|except|with|as|return|raise|True|False|None)\b/g,(all,string)=>`<span class="${string?'syntax-string':'syntax-keyword'}">${all}</span>`);}
function chooseLesson(name){
  if(!StudyTraces.lessons[name])return;
  lesson=name; stepIndex=0;
  const settings=StudyTraces.lessons[lesson];
  $('#scenario').innerHTML=settings.scenarios.map(([id,text])=>`<option value="${id}">${esc(text)}</option>`).join('');
  scenario=settings.scenarios[0][0];
  document.querySelectorAll('[data-lesson]').forEach(b=>{b.classList.toggle('selected',b.dataset.lesson===lesson);b.setAttribute('aria-pressed',String(b.dataset.lesson===lesson));});
  $('#reflection').textContent=settings.reflection;
  renderTrace();
}
function renderTrace(){
  const trace=StudyTraces.getTrace(lesson,scenario);
  stepIndex=Math.max(0,Math.min(stepIndex,trace.length-1));
  const current=trace[stepIndex], settings=StudyTraces.lessons[lesson], source=PROJECT.functions[settings.fn];
  $('#code-title').textContent=settings.title;
  const selected=source.lines.findIndex(line=>line.includes(current.needle));
  $('#code').innerHTML=source.lines.map((line,i)=>`<div class="code-line${i===selected?' active':''}"${i===selected?' aria-current="step"':''}><span class="line-no">${source.start+i}</span><code>${highlight(line)||' '}</code></div>`).join('');
  $('#code').querySelector('.active')?.scrollIntoView({block:'nearest',inline:'nearest'});
  $('#step-dots').innerHTML=trace.map((_,i)=>`<button class="step-dot${i===stepIndex?' current':''}" data-step="${i}" aria-label="ไปขั้นที่ ${i+1}"${i===stepIndex?' aria-current="step"':''}>${i+1}</button>`).join('');
  $('#step-label').textContent=`ขั้นที่ ${stepIndex+1} / ${trace.length}`;
  $('#step-title').textContent=current.title;$('#step-detail').textContent=current.detail;
  $('#variables').innerHTML=Object.entries(current.variables).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(pretty(v))}</dd></div>`).join('');
  $('#file-state').textContent=current.file;$('#output').textContent=current.output;
  $('#prev').disabled=stepIndex===0;$('#next').disabled=stepIndex===trace.length-1;
}
$('#scenario').addEventListener('change',e=>{scenario=e.target.value;stepIndex=0;renderTrace();});
$('#prev').addEventListener('click',()=>{stepIndex--;renderTrace();});$('#next').addEventListener('click',()=>{stepIndex++;renderTrace();});
$('#reset').addEventListener('click',()=>{stepIndex=0;renderTrace();});
$('#step-dots').addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b){stepIndex=Number(b.dataset.step);renderTrace();}});
document.querySelectorAll('[data-lesson]').forEach(b=>b.addEventListener('click',()=>chooseLesson(b.dataset.lesson)));
function showPage(){
  const allowed=['overview','lab','glossary','evaluation','notes','reading'];
  let page=location.hash.slice(1);if(page.startsWith('reading-'))page='reading';if(!allowed.includes(page))page='lab';
  document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==page);
  document.querySelectorAll('[data-page]').forEach(a=>{a.classList.toggle('active',a.dataset.page===page);if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if(page==='lab')renderTrace();
  if(page==='reading' && location.hash.startsWith('#reading-')) selectReadingLine(Number(location.hash.slice(9)));
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',showPage);
const requirements=[
 ['เมนูและการรับข้อมูล','เมนูมีเล่น เพิ่ม ดู/ค้นหา ลบ และทำงานวนจนเลือกออก ใช้ input() และ print()'],
 ['list และ dictionary','words เก็บหลายรายการ แต่ละรายการมี word/hint เพิ่ม ดู และลบได้'],
 ['เงื่อนไขและกฎ','ห้ามคำซ้ำ ห้ามเริ่มจากคลังว่าง ทายซ้ำไม่เสียโอกาส และผิด 6 ครั้งแพ้'],
 ['for และ while','for วนคลัง/ตัวอักษร ส่วน while คุมเมนูและแต่ละตาของเกม'],
 ['ฟังก์ชัน','แบ่งหน้าที่ รับคลังคำผ่านพารามิเตอร์ word_length คืนความยาวเพื่อเรียงคำ'],
 ['ประมวลผลข้อมูล','ค้นหาแบบมีเงื่อนไขจากคำหรือคำใบ้ และเรียงคำตามความยาว'],
 ['ตรวจข้อมูลและข้อผิดพลาด','เมนูผิด ตัวอักษรผิด คลังว่าง ลบคำไม่พบ และไฟล์โบนัสผิดรูปแบบ'],
 ['ขั้นตอนใช้งานครบ','เพิ่ม → ค้นหา → เล่น → ลบ → ตรวจผล ทั้งสองคนอธิบายได้ทุกส่วน']
];
$('#requirements').innerHTML=requirements.map(([title,text],i)=>`<div class="requirement"><span>0${i+1}</span><strong>${esc(title)}</strong><p>${esc(text)}</p></div>`).join('');
const terms=[
 ['with open(...)','เปิดไฟล์และจัดการปิดไฟล์ให้เมื่อออกจากบล็อก แม้มีข้อผิดพลาดเกิดขึ้น','with open(path, encoding="utf-8") as file:\n    data = json.load(file)','with ไม่ได้ตรวจว่าเนื้อหาถูกต้อง และไม่ได้เซฟให้อัตโนมัติ'],
 ['json.dump() / json.load()','dump เขียนข้อมูล Python เป็น JSON ลงไฟล์ ส่วน load อ่านข้อความ JSON กลับมาเป็นข้อมูล Python','json.dump(words, file, indent=2)\ndata = json.load(file)','อ่าน JSON สำเร็จไม่ได้แปลว่าโครงสร้างตรงกับคลังคำ ต้องตรวจอีกชั้น'],
 ['try / except','ลองทำส่วนที่อาจผิดพลาด ถ้าเกิดข้อผิดพลาดชนิดที่ระบุไว้ จึงไปทำ except','try:\n    data = json.load(file)\nexcept ValueError:\n    print("อ่าน JSON ไม่ได้")','except ไม่ได้จับทุกข้อผิดพลาดโดยอัตโนมัติ ชนิดที่จับต้องตรงหรือเป็นชนิดแม่ของข้อผิดพลาด'],
 ['raise ValueError','เราตรวจพบข้อมูลไม่ตรงกฎเอง จึงส่งข้อผิดพลาดไปให้ except จัดการ','if not isinstance(data, list):\n    raise ValueError','ไม่จำเป็นต้องรอให้ Python พังเอง เรากำหนดว่าข้อมูลผิดกฎได้'],
 ['isinstance(value, type)','ตรวจชนิดของข้อมูล เช่น เป็น list หรือ dict เพื่อไม่ใช้คำสั่งกับข้อมูลผิดชนิด','isinstance([], list)       # True\nisinstance("cat", dict)   # False','ไม่ใช่การแปลงชนิดข้อมูล และตรวจชนิดอย่างเดียวยังไม่รู้ว่ารายการข้างในถูกต้องไหม'],
 ['os และ OSError','os มีเครื่องมือเกี่ยวกับระบบ เช่น แทนที่ไฟล์หรือเรียกคำสั่ง ส่วน OSError เป็นชื่อกลุ่มข้อผิดพลาดของ Python','os.replace(path + ".tmp", path)\nos.system("cls")','OSError ไม่ใช่ฟังก์ชันที่ต้องเรียกจาก os และการเขียนไฟล์อาจผิดพลาดเพราะสิทธิ์หรือพื้นที่เก็บข้อมูล'],
 ['sys.stdout.isatty() / TERM','isatty ตรวจว่าผลลัพธ์ออก Terminal หรือไม่ ส่วน TERM บน macOS/Linux บอกชนิด Terminal','if not sys.stdout.isatty():\n    return','Windows ใช้ cls ได้โดยไม่ต้องมี TERM ส่วนโค้ดของเราจะข้าม clear เมื่อ TERM ไม่มีค่า ว่าง หรือ dumb'],
 ['words[:] = loaded','เปลี่ยนสมาชิกของ list เดิม ทำให้ main() ที่ใช้ list เดียวกันเห็นข้อมูลใหม่ด้วย','words = [{"word": "cat"}]\n# โหลดและตรวจครบแล้ว\nwords[:] = loaded','ต่างจาก words = loaded ภายในฟังก์ชัน ซึ่งผูกชื่อตัวแปรในฟังก์ชันกับ list อีกอัน'],
 ['return True / False / "quit"','ส่งผลกลับให้ผู้เรียก True/False ใช้บอกผลเซฟโหลด ส่วน quit ใช้บอกให้กลับเมนู','if guess == "0":\n    return "quit"','print แสดงข้อความ แต่ return ส่งค่ากลับและออกจากฟังก์ชันทันที'],
 ['sorted(..., key=word_length)','สร้าง list ที่เรียงใหม่ โดยเรียก word_length กับแต่ละรายการเพื่อหาค่าที่ใช้เรียง','for item in sorted(words, key=word_length):\n    print(item["word"])','ส่งชื่อฟังก์ชันโดยไม่ใส่วงเล็บ และ sorted ไม่เปลี่ยนลำดับของ list ต้นฉบับ'],
 ['RAM กับไฟล์ JSON','RAM เป็นข้อมูลระหว่างโปรแกรมกำลังทำงาน ส่วนไฟล์ยังอยู่หลังปิดโปรแกรม','เพิ่มคำ → words ใน RAM เปลี่ยน\nเมนู 6 → words.json เปลี่ยน\nตอนเปิด / เมนู 7 → อ่านไฟล์มาแทน RAM','ไม่มีการเซฟอัตโนมัติ และ Load ไฟล์ที่ถูกต้องจะแทนคลังปัจจุบัน ควรเซฟก่อนหากมีคำที่อยากเก็บ'],
 ['.strip() / .lower() / .get()','strip ตัดช่องว่างหัวท้าย lower แปลงตัวพิมพ์เล็ก get อ่านค่า dictionary โดยไม่เกิด KeyError เมื่อไม่มี key','" CAT ".strip().lower()  # "cat"\nitem.get("hint")        # None ถ้าไม่มี','strip ไม่ลบช่องว่างกลางคำ และ get อาจคืน None จึงต้องเช็กชนิดก่อนใช้ strip']
];
function renderTerms(){const q=$('#term-search').value.trim().toLowerCase();const found=terms.filter(t=>t.join(' ').toLowerCase().includes(q));$('#terms').innerHTML=found.length?found.map(([term,text,code,pitfall])=>`<article class="term"><h3>${esc(term)}</h3><div><p>${esc(text)}</p><pre>${esc(code)}</pre><p class="pitfall">จำจุดนี้: ${esc(pitfall)}</p></div></article>`).join(''):'<p>ยังไม่พบคำนี้ ลองค้นด้วยชื่อคำสั่งหรือคำไทยสั้น ๆ</p>';}
$('#term-search').addEventListener('input',renderTerms);
const questions=[
 ['ข้อมูล','ทำไมคลังคำจึงใช้ list ของ dictionary?','list เก็บได้หลายคำและวนเพิ่ม/ลบได้ ส่วน dictionary จับคู่ข้อมูลของคำเดียวกันด้วย key word และ hint ทำให้อ่านความหมายชัดเจน'],
 ['เกม','ทำไมทาย a ครั้งเดียวใน banana แล้วเปิดได้ 3 ตำแหน่ง?','for วนทุกตัวอักษรใน word แล้วเช็ก letter in guesses ดังนั้น a ทุกตำแหน่งจึงผ่านเงื่อนไขเดียวกัน'],
 ['เกม','ทายตัวเดิมซ้ำแล้วจะเสียโอกาสไหม เพราะอะไร?','ไม่เสีย เพราะเช็ก guess in guesses ก่อน append หรือเพิ่ม mistakes จึงแค่ตั้งข้อความทายซ้ำ'],
 ['โบนัส Save','ทำไมต้องเขียน .tmp ก่อนใช้ os.replace()?','เพื่อไม่เปิดเขียนทับไฟล์เดิมตั้งแต่แรก เมื่อเขียนและปิดไฟล์ชั่วคราวสำเร็จจึงแทนที่ไฟล์จริง หากขั้นตอนนั้นล้มเหลวไฟล์เดิมยังอยู่ แต่ไฟล์ .tmp อาจเหลืออยู่'],
 ['โบนัส Load','ถ้า JSON อ่านได้ แต่ข้อมูลเป็น dictionary แทน list จะเกิดอะไร?','isinstance(data, list) ไม่ผ่าน จึง raise ValueError เข้า except แล้ว return False โดยยังไม่เปลี่ยน words'],
 ['โบนัส Load','ถ้าคำสุดท้ายในไฟล์ซ้ำกับคำแรก รายการแรกจะถูกโหลดไปก่อนหรือยัง?','ยัง loaded กับ seen เป็นพื้นที่ตรวจข้อมูลชั่วคราว ต้องตรวจครบทุกคำก่อนถึง words[:] = loaded เมื่อมีคำซ้ำจะออกทาง except คลังเดิมจึงยังอยู่'],
 ['ไฟล์','with ทำอะไร และต่างจาก try/except อย่างไร?','with จัดการทรัพยากร เช่น ปิดไฟล์เมื่อออกจากบล็อก ส่วน try/except กำหนดว่าจะรับมือกับข้อผิดพลาดชนิดใด ทั้งสองอย่างใช้ร่วมกันได้'],
 ['ชนิดข้อมูล','isinstance() ต่างจากการแปลงชนิดข้อมูลอย่างไร?','isinstance ตรวจแล้วคืน True หรือ False ไม่ได้แปลงค่า เช่น isinstance("5", int) เป็น False ข้อมูลยังเป็น string'],
 ['ระบบ','ทำไม Windows ไม่ต้องเช็ก TERM แต่ macOS/Linux ในโค้ดนี้เช็ก?','โค้ดเลือก cls บน Windows ส่วน clear บน macOS/Linux ต้องใช้ข้อมูลชนิด Terminal โปรแกรมจึงข้ามเมื่อ TERM ไม่มีค่า ว่าง หรือ dumb เพื่อลดข้อความเตือน'],
 ['ฟังก์ชัน','ทำไมใช้ words[:] = loaded แทน words = loaded ภายใน load_words()?','slice assignment เปลี่ยนสมาชิกใน list ที่ main ส่งเข้ามาโดยตรง ส่วนการกำหนด words = loaded เปลี่ยนแค่การผูกชื่อตัวแปรภายในฟังก์ชัน'],
 ['การนำเสนอ','ส่วนบังคับมีการประมวลผลข้อมูลสองอย่างอะไรบ้าง?','ค้นหาแบบมีเงื่อนไขจาก word หรือ hint และเรียงรายการตามความยาวด้วย sorted(..., key=word_length) ควรสาธิตทั้งสองอย่างให้เห็นจริง'],
 ['การออกจากเกม','เมื่อพิมพ์ 0 จะกลับเมนูโดยไม่ถาม Enter ซ้ำได้อย่างไร?','play_game ตรวจ 0 ก่อนตรวจตัวอักษร แล้ว return "quit" main ตรวจผลนี้และข้ามการรอ Enter หลังจบเกม จากนั้นล้างแล้วแสดงเมนู']
];
function renderQuestion(){const [topic,q,a]=questions[questionIndex];$('#quiz-count').textContent=`คำถาม ${questionIndex+1} / ${questions.length}`;$('#question-topic').textContent=topic;$('#question-text').textContent=q;$('#answer').textContent=a;$('#answer').hidden=true;$('#reveal').textContent='เปิดแนวคำตอบ';$('#reveal').setAttribute('aria-expanded','false');$('#question-prev').disabled=questionIndex===0;$('#question-next').disabled=questionIndex===questions.length-1;}
$('#reveal').addEventListener('click',()=>{const open=$('#answer').hidden;$('#answer').hidden=!open;$('#reveal').textContent=open?'ซ่อนแนวคำตอบ':'เปิดแนวคำตอบ';$('#reveal').setAttribute('aria-expanded',String(open));});
$('#question-prev').addEventListener('click',()=>{questionIndex--;renderQuestion();});$('#question-next').addEventListener('click',()=>{questionIndex++;renderQuestion();});$('#shuffle').addEventListener('click',()=>{questionIndex=(questionIndex+1+Math.floor(Math.random()*(questions.length-1)))%questions.length;renderQuestion();});
function readStorage(key,fallback){try{return localStorage.getItem(key)??fallback;}catch{return fallback;}}
function writeStorage(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}
let checked=[];try{const parsed=JSON.parse(readStorage('hangman-study-checks','[]'));if(Array.isArray(parsed))checked=parsed.filter(n=>Number.isInteger(n)&&n>=0&&n<8);}catch{}
const checkLabels=['อธิบาย list กับ dictionary และการส่ง words เข้าฟังก์ชันได้','เดินเงื่อนไขทายถูก ผิด ซ้ำ และออกกลางเกมได้','ชี้ for / while และอธิบายจุดจบของแต่ละลูปได้','สาธิตการค้นหาและการเรียงคำตามความยาวได้','อธิบาย with open, dump และ load ได้','แยกหน้าที่ try/except, isinstance และ raise ได้','สาธิตเซฟ–เปิดใหม่โหลดอัตโนมัติ และไฟล์ผิดได้','สลับกับเพื่อนแล้วอธิบายโค้ดได้ครบทั้งโปรแกรม'];
$('#checklist').innerHTML=checkLabels.map((label,i)=>`<label class="check-item"><input type="checkbox" value="${i}"${checked.includes(i)?' checked':''}><span>${esc(label)}</span></label>`).join('');
function updateProgress(){const inputs=[...$('#checklist').querySelectorAll('input:checked')];$('#progress').textContent=`${inputs.length} / 8`;$('#study-progress').value=inputs.length;}
$('#checklist').addEventListener('change',()=>{const values=[...$('#checklist').querySelectorAll('input:checked')].map(i=>Number(i.value));if(!writeStorage('hangman-study-checks',JSON.stringify(values)))$('#progress').title='เบราว์เซอร์ไม่อนุญาตให้เก็บข้อมูลถาวร';updateProgress();});
$('#note-text').value=readStorage('hangman-study-note','');
$('#save-note').addEventListener('click',()=>{$('#note-status').textContent=writeStorage('hangman-study-note',$('#note-text').value)?'บันทึกในเบราว์เซอร์นี้แล้ว':'บันทึกไม่ได้ กรุณาดาวน์โหลดสำรองแทน';});
$('#note-text').addEventListener('input',()=>{$('#note-status').textContent='มีการแก้ไขที่ยังไม่ได้บันทึก';});
$('#export-note').addEventListener('click',()=>{const blob=new Blob(['Hangman Study Room\n\n'+$('#note-text').value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='hangman-study-notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
chooseLesson('save');renderTerms();renderQuestion();updateProgress();

let readingNumber=1;
const readingSelect=$('#reading-function');
readingSelect.innerHTML=READING.groups.map((g,i)=>`<option value="${i}">${esc(g.title)} · บรรทัด ${g.start}–${g.end}</option>`).join('');
function selectReadingLine(number){
 if(!Number.isInteger(number)||number<1||number>READING.lines.length)return;
 readingNumber=number;
 const index=READING.groups.findIndex(g=>number>=g.start&&number<=g.end), group=READING.groups[index], line=READING.lines[number-1];
 readingSelect.value=String(index);
 $('#reading-title').textContent=group.title;
 $('#reading-code').innerHTML=READING.lines.slice(group.start-1,group.end).map(l=>`<button type="button" class="code-line reading-code-line${l.number===number?' active':''}" data-reading-line="${l.number}" aria-pressed="${l.number===number}" aria-label="บรรทัด ${l.number}: ${esc(l.code.trim()||'บรรทัดว่าง')}"><span class="line-no">${l.number}</span><code>${highlight(l.code)||' '}</code></button>`).join('');
 $('#reading-line-title').textContent=`บรรทัด ${number} · ${group.title}`;
 $('#reading-selected').textContent=line.code||'(บรรทัดว่าง)';
 $('#reading-note').textContent=line.note;
 $('#reading-indent').textContent=line.indent;
 $('#reading-prev').disabled=number===1;
 $('#reading-next').disabled=number===READING.lines.length;
}
readingSelect.addEventListener('change',()=>selectReadingLine(READING.groups[Number(readingSelect.value)].start));
$('#reading-code').addEventListener('click',e=>{const b=e.target.closest('[data-reading-line]');if(b){selectReadingLine(Number(b.dataset.readingLine));$('#reading-code').querySelector('.active').focus({preventScroll:true});}});
$('#reading-prev').addEventListener('click',()=>selectReadingLine(readingNumber-1));
$('#reading-next').addEventListener('click',()=>selectReadingLine(readingNumber+1));
selectReadingLine(Number(location.hash.slice(9))||1);
showPage();
