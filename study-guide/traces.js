/* Teaching models of the Python branches; no Python interpreter runs here. */
globalThis.StudyTraces = (() => {
  const cat = {word:'cat',hint:'A pet'};
  const kiwi = {word:'kiwi',hint:'Green fruit'};
  const bank = [cat, kiwi];
  const show = value => JSON.stringify(value, null, 2);
  const step = (needle,title,detail,variables,file,output='—') => ({needle,title,detail,variables,file,output});
  const lessons = {
    main:{fn:'main',title:'main()',reflection:'ทำไม words จึงถูกสร้างก่อน while และใช้คลังเดิมได้ตลอด?',scenarios:[['startup-missing','เปิดเกม: ไฟล์หาย'],['startup-broken','เปิดเกม: JSON เสีย'],['2','เมนู 2 เพิ่มคำ'],['3','เมนู 3 ดู / ค้นหา'],['4','เมนู 4 ลบคำ'],['6','เมนู 6 เซฟ'],['7','เมนู 7 โหลด'],['quit','เล่นแล้วพิมพ์ 0'],['end','เล่นจนจบรอบ'],['5','ออกจากโปรแกรม'],['invalid','เลือกเมนูผิด']]},
    show:{fn:'show_words',title:'show_words(words)',reflection:'sorted เปลี่ยนคลังเดิมไหม และทำไม keyword ว่างจึงแสดงทุกคำ?',scenarios:[['all','ดูทุกคำ'],['word','ค้นจากคำ'],['hint','ค้นจากคำใบ้'],['missing','ค้นไม่เจอ'],['empty','คลังว่าง']]},
    length:{fn:'word_length',title:'word_length(item)',reflection:'ทำไม key=word_length จึงไม่ใส่วงเล็บเรียกฟังก์ชัน?',scenarios:[['cat','cat → 3'],['banana','banana → 6']]},
    delete:{fn:'delete_word',title:'delete_word(words)',reflection:'ทำไมลบแล้วต้อง return ทันที และไฟล์ JSON เปลี่ยนด้วยไหม?',scenarios:[['ok','ลบคำที่มี'],['missing','ไม่พบคำ'],['empty','คลังว่าง']]},
    draw:{fn:'draw_hangman',title:'draw_hangman(mistakes)',reflection:'ทำไมใช้ >= แทน == และทำไมทุกภาพจึงสูงเท่ากัน?',scenarios:Array.from({length:7},(_,n)=>[String(n),`ผิด ${n} ครั้ง`])},
    save:{fn:'save_words',title:'save_words(words, path)',reflection:'ทำไมไม่เขียนทับ words.json ตั้งแต่บรรทัดแรก?',scenarios:[['ok','เซฟสำเร็จ'],['fail','แทนที่ไฟล์ไม่สำเร็จ']]},
    load:{fn:'load_words',title:'load_words(words, path)',reflection:'ถ้ารายการสุดท้ายผิด ข้อมูลก่อนหน้าจะเข้าไปทับคลังเดิมหรือยัง?',scenarios:[['ok','ไฟล์ปกติ'],['broken','JSON เสีย'],['duplicate','คำซ้ำในไฟล์'],['schema','รูปแบบข้อมูลผิด'],['missing','ไม่มีไฟล์']]},
    game:{fn:'play_game',title:'play_game(words)',reflection:'ทำไมทาย a ครั้งเดียว จึงเปิด a ได้ทั้งสามตำแหน่งใน banana?',scenarios:[['correct','ทายถูก'],['wrong','ทายผิด'],['repeat','ทายตัวเดิมซ้ำ'],['quit','พิมพ์ 0 กลับเมนู']]},
    add:{fn:'add_word',title:'add_word(words)',reflection:'เราเช็กคำซ้ำก่อนถามคำใบ้ เพราะอะไร?',scenarios:[['ok','เพิ่มคำใหม่'],['duplicate','คำที่มีแล้ว'],['invalid','คำมีตัวเลข']]},
    clear:{fn:'clear_screen',title:'clear_screen()',reflection:'isatty() กับ TERM ตรวจคนละเรื่องกันอย่างไร?',scenarios:[['windows','Windows Terminal'],['linux','macOS / Linux พร้อมใช้งาน'],['dumb','TERM เป็น dumb'],['pipe','ส่งผลลัพธ์เข้าไฟล์']]}
  };
  function getTrace(lesson, scenario) {
    if(lesson === 'length') return [
      step('def word_length','รับ dictionary หนึ่งรายการ','sorted จะส่งแต่ละ item เข้ามาให้ฟังก์ชันนี้เอง',{item:{word:scenario,hint:'Example'}},'ไฟล์ไม่เปลี่ยน'),
      step('return len','คืนความยาวของคำ','อ่าน item["word"] แล้วนับตัวอักษร ได้จำนวนเต็มสำหรับใช้เรียงจากน้อยไปมาก',{word:scenario,length:scenario.length},'ไฟล์ไม่เปลี่ยน',`return ${scenario.length}`)
    ];
    if(lesson === 'draw') {
      const mistakes=Number(scenario), parts={}, names=['head','body','left_arm','right_arm','left_leg','right_leg'], marks=['O','|','/','\\','/','\\'];
      const trace=names.map((name,i)=>{parts[name]=mistakes>=i+1?marks[i]:' ';return step(name+' =','กำหนด '+name,`ถ้าผิดตั้งแต่ ${i+1} ครั้ง ใช้ ${marks[i]} ไม่อย่างนั้นใช้ช่องว่าง ส่วนที่วาดก่อนหน้ายังคงอยู่`,{mistakes,...parts},'ไฟล์ไม่เกี่ยวข้อง');});
      return [...trace,step('print("  +---+")','พิมพ์ภาพทั้งเฟรม','f-string แทรกแต่ละส่วนลงตำแหน่งเดิม ฟังก์ชันนี้วาดอย่างเดียว ไม่เพิ่ม mistakes และไม่ตัดสินแพ้',{mistakes,...parts},'ไฟล์ไม่เกี่ยวข้อง',`  +---+\n  |   |\n  ${parts.head}   |\n ${parts.left_arm}${parts.body}${parts.right_arm}  |\n ${parts.left_leg} ${parts.right_leg}  |\n      |\n=========`)];
    }
    if(lesson === 'delete') {
      const words=scenario==='empty'?[]:bank, word=scenario==='ok'?'cat':'dog';
      const trace=[step('word = input','รับคำที่จะลบ','" CAT " ถูก strip และ lower เป็น cat ก่อนค้นหา',{words,word},'ยังไม่เซฟ'),step('for item in words','วนตรวจทีละรายการ',words.length?'เทียบ item["word"] กับคำที่รับมา':'list ว่าง จึงไม่เข้าบล็อก for แม้แต่ครั้งเดียว',{words,word},'ไฟล์ไม่เปลี่ยน')];
      if(scenario!=='ok')return [...trace,step('print("Word not found.")','วนครบโดยไม่พบคำ','ไม่มีรายการถูกลบ และฟังก์ชันจบโดยคืน None โดยปริยาย',{words,word},'ไฟล์ไม่เปลี่ยน','Word not found.')];
      return [...trace,step('words.remove(item)','ลบ dictionary ที่พบ','remove แก้ list เดิมที่ main ส่งมา จึงเห็นผลทันทีใน RAM',{words:[kiwi],word},'ไฟล์เดิมยังมี cat จนกว่าจะ Save','Word deleted.'),step('return','จบฟังก์ชันหลังลบ','ไม่วนต่อบน list ที่เพิ่งเปลี่ยน และไม่พิมพ์ Word not found.',{words:[kiwi]},'ยังไม่เซฟ','return None → main')];
    }
    if(lesson === 'show') {
      const words=scenario==='empty'?[]:[kiwi,cat], keyword={all:'',word:'ca',hint:'green',missing:'zzz',empty:''}[scenario];
      if(!words.length)return [step('if not words','เช็กคลังว่าง','list ว่างเป็น falsy จึงแจ้งข้อความและ return ก่อนถามคำค้น',{words},'ไฟล์ไม่เปลี่ยน','No words available.')];
      let found=false;const trace=[step('keyword = input','รับคำค้น','strip และ lower ก่อนค้น; Enter อย่างเดียวได้ string ว่าง',{words,keyword},'ไฟล์ไม่เปลี่ยน'),step('found = False','เริ่มว่ายังไม่พบ','ใช้ธง found จดจำว่ามีรายการผ่านเงื่อนไขหรือไม่',{words,keyword,found},'ไฟล์ไม่เปลี่ยน'),step('for item in sorted','เรียงสำเนาเพื่อแสดง','word_length(cat)=3 และ word_length(kiwi)=4 จึงดู cat ก่อน โดย words เดิมยังเป็น kiwi, cat',{words,sorted:bank,keyword,found},'ไฟล์ไม่เปลี่ยน')];
      for(const item of bank){const match=item.word.includes(keyword)||item.hint.toLowerCase().includes(keyword);trace.push(step('if keyword in','ตรวจ '+item.word,'ค้นแบบเป็นส่วนหนึ่งของ word หรือ hint; string ว่างอยู่ในทุก string',{words,item,keyword,found,match},'ไฟล์ไม่เปลี่ยน'));if(match){found=true;trace.push(step('found = True','พบแล้วและแสดงรายการ','พิมพ์คำ ความยาว และคำใบ้ จากนั้นจำว่าพบแล้ว',{words,item,keyword,found},'ไฟล์ไม่เปลี่ยน',`${item.word} (${item.word.length} letters) - ${item.hint}`));}}
      return [...trace,step('if not found','ตรวจหลังวนครบ',found?'เคยพบแล้ว จึงไม่พิมพ์ข้อความไม่พบ':'ไม่เคยมีรายการผ่านเงื่อนไข จึงพิมพ์ข้อความไม่พบ',{words,keyword,found},'ไฟล์ไม่เปลี่ยน',found?'จบ → main':'No matching words.')];
    }
    if(lesson === 'main') {
      if(scenario.startsWith('startup-')) {
        const file=scenario==='startup-missing'?'ไม่มี words.json':'words.json เป็นข้อความ JSON ที่เสีย';
        return [step('words = []','เริ่มด้วยคลังว่าง','เตรียม list ให้ load_words เติมข้อมูล',{words:[]},file),step('if not load_words(words, path)','โหลดไม่สำเร็จ','load_words จัดการข้อผิดพลาดแล้วคืน False โดยไม่เปลี่ยน list; not False เป็น True จึงเข้าบล็อกแจ้งเตือน',{words:[],result:false},file,'Could not load a valid file. Current vocabulary is unchanged.'),step('print("Starting with','แจ้งว่าใช้คลังว่าง','ไม่สร้างหรือเขียนทับไฟล์เอง ผู้ใช้ยังเพิ่มคำแล้วเลือก Save ได้',{words:[]},file,'Starting with an empty vocabulary. Add words, then choose 6 to save.'),step('while True:','เข้าเมนูได้ตามปกติ','ยังเล่นไม่ได้จนมีคำอย่างน้อยหนึ่งคำ เพิ่มคำแล้วกด 6 จะสร้างหรือแทนที่ words.json',{words:[]},file,'รอ Choose:')];
      }
      const words=[{word:'cat',hint:'A small pet that says meow'},{word:'apple',hint:'A red or green fruit'},{word:'python',hint:'A popular programming language'},{word:'banana',hint:'A long yellow fruit'},{word:'school',hint:'A place where students learn'}];
      const choice=['quit','end'].includes(scenario)?'1':scenario==='invalid'?'9':scenario, state={words,path:'<โฟลเดอร์ main.py>/words.json',choice};
      const trace=[step('path = os.path.join','กำหนดที่อยู่ไฟล์','คำนวณจากตำแหน่ง main.py จึงไม่ขึ้นกับโฟลเดอร์ที่เปิด Terminal',{path:state.path},'words.json\n'+show(words)),step('words = []','เริ่มด้วย list ว่าง','คำศัพท์อยู่ใน JSON แยกจากโค้ด สร้าง list นี้ครั้งเดียวแล้วโหลดก่อนเข้า while',{words:[],path:state.path},'words.json\n'+show(words)),step('if not load_words(words, path)','โหลดไฟล์อัตโนมัติ','load_words ตรวจข้อมูลครบแล้วเปลี่ยน list เดิม ตัวอย่างนี้โหลดห้าคำจากไฟล์สำเร็จและคืน True จึงข้ามข้อความคลังว่าง',{words,path:state.path,result:true},'อ่านอย่างเดียว ไม่แก้ไฟล์','Vocabulary loaded. It replaces the current bank.'),step('choice = input','แสดงเมนูและรับตัวเลือก','while True วนต่อจนเลือก 5; strip ตัดช่องว่างและ choice ยังเป็น string',state,'ยังไม่เปลี่ยนไฟล์')];
      if(choice==='5')return [...trace,step('break','ออกจากลูปเมนู','พิมพ์ Goodbye! แล้ว break ออกจาก while จากนั้น main จบ ไม่ได้เซฟอัตโนมัติ',state,'ไม่มีการเซฟอัตโนมัติ','Goodbye!')];
      if(choice==='9')trace.push(step('print("Invalid menu choice.")','ตัวเลือกไม่ตรงเงื่อนไข','เข้า else แล้ววนกลับแสดงเมนู โดยคลังยังอยู่',state,'ไฟล์ไม่เปลี่ยน','Invalid menu choice.'));
      else if(choice==='1'){
        trace.push(step('if play_game(words) !=','เรียกเกมและตรวจค่าที่คืน',scenario==='quit'?'เกมคืน "quit" จึงข้าม input รอ Enter':'เกมจบปกติคืน None ซึ่งไม่เท่ากับ "quit" จึงเข้าบล็อกรอ Enter',{...state,result:scenario==='quit'?'quit':null},'เกมไม่แก้ไฟล์'));
        if(scenario==='end')trace.push(step('input("Press Enter','รอผู้เล่นอ่านผล','กด Enter ก่อนกลับเมนู',{...state,result:null},'ไฟล์ไม่เปลี่ยน','Press Enter to return to menu:'));
        trace.push(step('clear_screen()','ล้างก่อนกลับเมนู','เรียก clear_screen หลังเกมคืนค่าแล้ว',state,'ไฟล์ไม่เปลี่ยน'));
      }else{
        const fn={'2':'add_word','3':'show_words','4':'delete_word','6':'save_words','7':'load_words'}[choice];
        trace.push(step(fn+'(words','ส่งงานให้ '+fn,'ส่ง list เดิมให้ฟังก์ชันทำงานจนคืนกลับมา เลือกบทของฟังก์ชันนี้เพื่อดูรายละเอียดภายใน; Save/Load รับ path ด้วย',state,choice==='6'?'ถ้าเซฟสำเร็จ ไฟล์ถูกแทนที่':choice==='7'?'อ่านไฟล์และตรวจครบก่อนแทนคลัง':'ไฟล์ไม่เปลี่ยน','เรียก '+fn));
      }
      return [...trace,step('while True:','วนกลับเมนู','ไม่สร้าง words ใหม่ งานเพิ่ม/ลบ/โหลดที่สำเร็จจึงคงอยู่ในคลังเดิม; ขั้นนี้แสดงเฉพาะตัวควบคุมเมนู',{choice,next:'แสดงเมนูด้วยคลังหลังฟังก์ชันทำงาน'},'สถานะตามผลฟังก์ชันที่เรียก','รอ Choose: ครั้งถัดไป')];
    }
    if (lesson === 'save') {
      const initial = {words:bank,path:'words.json'};
      return [
        step('def save_words','รับข้อมูลที่ต้องการเซฟ','words เป็น list ของ dictionary และ path เป็นชื่อไฟล์ที่จะใช้ ไม่มีการลบคำใน RAM',initial,'words.json (เดิม)\n'+show([cat])),
        step('with open','เปิดไฟล์ชั่วคราว','โหมด w เขียนไฟล์ words.json.tmp ก่อน ไฟล์ words.json เดิมยังไม่ถูกแทนที่',initial,'words.json → '+show([cat])+'\n\nwords.json.tmp → ไฟล์เปิดรอเขียน'),
        step('json.dump','เขียนข้อมูลเป็น JSON','json.dump แปลงข้อมูล Python ลงไฟล์ UTF-8; indent=2 จัดย่อหน้า ส่วน ensure_ascii=False ให้อ่านภาษาไทยได้',initial,'words.json (เดิม)\n'+show([cat])+'\n\nwords.json.tmp\n'+show(bank)),
        ...(scenario === 'fail' ? [
          step('except OSError','เกิดข้อผิดพลาดตอนแทนที่ไฟล์','สมมติว่า os.replace ทำไม่ได้เพราะสิทธิ์ไม่พอ จึงเข้า except ไฟล์เดิมยังอยู่ ไฟล์ .tmp อาจยังเหลือ',initial,'words.json ไม่เปลี่ยน\n'+show([cat])+'\n\nwords.json.tmp อาจยังอยู่','Could not save. Your previous file has not been replaced.'),
          step('return False','คืนค่า False','แจ้งว่าการเซฟไม่สำเร็จ ผู้ใช้ควรแก้ปัญหาแล้วลองใหม่ ข้อมูลใน RAM ยังอยู่',initial,'words.json\n'+show([cat]),'return False')
        ] : [
          step('os.replace','แทนที่ไฟล์จริง','ออกจาก with แล้วไฟล์ชั่วคราวปิดเรียบร้อย จึงย้ายไฟล์ .tmp มาแทน words.json',initial,'words.json\n'+show(bank)+'\n\nwords.json.tmp → ถูกย้ายแล้ว','ไฟล์ใหม่พร้อมใช้งาน'),
          step('return True','เซฟสำเร็จ','ค่าที่คืนเป็น True บอกผลการทำงาน คลังคำใน RAM ไม่เปลี่ยน เปิดโปรแกรมใหม่จะโหลดไฟล์อัตโนมัติ หรือเลือกเมนู 7 เพื่อโหลดซ้ำระหว่างใช้งาน',initial,'words.json\n'+show(bank),'Vocabulary saved.\nreturn True')
        ])
      ];
    }
    if (lesson === 'load') {
      const old = [cat];
      const incoming = scenario === 'duplicate' ? [cat,{word:'CAT',hint:'Another pet'}] : scenario === 'schema' ? {words:bank} : bank;
      const file = scenario === 'missing' ? 'ไม่มีไฟล์ words.json' : scenario === 'broken' ? '[{"word": "kiwi", ... ไฟล์เขียนไม่ครบ' : show(incoming);
      const start = [step('def load_words','เริ่มจากคลังเดิม','words ใน RAM มี cat อยู่ เราจะยังไม่เปลี่ยนคลังจนกว่าจะตรวจไฟล์ครบ',{words:old,path:'words.json'},file),step('with open','เปิดไฟล์เพื่ออ่าน','with ดูแลการปิดไฟล์ให้อัตโนมัติ โหมดเริ่มต้นของ open คืออ่าน',{words:old},file)];
      const failed = reason => [step('except (OSError','ไปทางจัดการข้อผิดพลาด',reason+' คลังคำเดิมใน RAM ยังอยู่',{words:old},file,'Could not load a valid file. Current vocabulary is unchanged.'),step('return False','จบโดยไม่เปลี่ยนคลัง','ยังไม่เคยทำ words[:] = loaded จึงไม่มีรายการจากไฟล์เข้าไปทับข้อมูลเดิม',{words:old},file,'return False')];
      if(scenario === 'missing') return [...start,...failed('open หาไฟล์ไม่เจอ เกิด OSError')];
      if(scenario === 'broken') return [...start,step('data = json.load','อ่าน JSON ไม่สำเร็จ','ข้อความในไฟล์ไม่ใช่ JSON ที่สมบูรณ์ เกิด JSONDecodeError ซึ่งเป็นชนิดย่อยของ ValueError',{words:old},file),...failed('json.load อ่านข้อความที่เสียไม่ได้')];
      const read = step('data = json.load','เปลี่ยน JSON กลับเป็นข้อมูล Python','data เป็นข้อมูลที่เพิ่งอ่านมา แต่ words ยังเป็นคลังเดิม',{words:old,data:incoming},file);
      if(scenario === 'schema') return [...start,read,step('if not isinstance(data, list)','ตรวจว่าเป็น list','ไฟล์นี้เป็น dictionary ไม่ใช่ list ตามรูปแบบที่โปรแกรมต้องการ จึง raise ValueError',{words:old,data:incoming},file),...failed('ข้อมูลผิดรูปแบบ')];
      const checked = [step('loaded = []','เตรียมพื้นที่ตรวจข้อมูล','loaded เก็บรายการที่ตรวจแล้ว ส่วน seen เก็บคำสำหรับเช็กซ้ำ ทั้งสองลิสต์นี้ยังไม่ใช่คลังจริง',{words:old,loaded:[],seen:[]},file),step('word = word.strip().lower()','ตรวจรายการแรก','เช็กชนิด dictionary และ string แล้วตัดช่องว่าง แปลงคำเป็นตัวเล็ก และเช็กคำใบ้',{words:old,item:cat,loaded:[],seen:[]},file),step('loaded.append','รายการแรกผ่าน','เพิ่ม cat ลง loaded และ seen แล้ววนไปตรวจรายการถัดไป คลัง words ยังไม่เปลี่ยน',{words:old,loaded:[cat],seen:['cat']},file)];
      if(scenario === 'duplicate') return [...start,read,...checked,step('if not word.isascii()','เจอคำซ้ำหลังแปลงตัวเล็ก','CAT กลายเป็น cat ซึ่งอยู่ใน seen แล้ว จึง raise ValueError และไม่โหลดแม้แต่รายการแรก',{words:old,word:'cat',loaded:[cat],seen:['cat']},file),...failed('มีคำซ้ำในไฟล์')];
      return [...start,read,...checked,step('words[:] = loaded','ตรวจครบแล้วจึงเปลี่ยนคลัง','kiwi ผ่านการตรวจเช่นกัน จึงเปลี่ยนสมาชิกใน list เดิม main() ซึ่งใช้ list นี้จะเห็นข้อมูลใหม่',{words:bank,loaded:bank,seen:['cat','kiwi']},file),step('return True','โหลดสำเร็จ','ไฟล์ไม่ได้ถูกแก้ไข การโหลดนำข้อมูลจากไฟล์มาแทนคลังใน RAM เท่านั้น',{words:bank},file,'Vocabulary loaded. It replaces the current bank.\nreturn True')];
    }
    if(lesson === 'game') {
      const guesses = scenario === 'repeat' ? ['a'] : [];
      const first = [step('item = random.choice','เลือกคำจากคลัง','ตัวอย่างนี้สมมติว่าสุ่มได้ banana ส่วนคำจริงเลือกด้วย random.choice ไม่ได้เลือกตัวแรกเสมอ',{word:'banana',guesses,mistakes:0},'ไฟล์ไม่เกี่ยวกับรอบนี้'),step('for letter in word','สร้างช่องคำ','for ตรวจทุกตำแหน่ง ถ้าตัวอักษรอยู่ใน guesses จะเปิด ไม่อย่างนั้นใช้ _',{word:'banana',guesses,display:guesses.length?'_ a _ a _ a':'_ _ _ _ _ _',mistakes:0},'ไฟล์ไม่เปลี่ยน')];
      if(scenario === 'quit') return [...first,step('if guess == "0"','ผู้เล่นเลือก 0','ตรวจคำสั่งออกก่อนตรวจว่าคำตอบเป็นตัวอักษร จึงไม่เสียโอกาส',{word:'banana',guess:'0',mistakes:0},'ไฟล์ไม่เปลี่ยน'),step('return "quit"','ส่งสัญญาณกลับ main()','main() เห็นค่า quit จึงข้ามการรอ Enter หลังจบรอบ แล้วกลับเมนูทันที',{result:'quit',mistakes:0},'ไฟล์ไม่เปลี่ยน','กลับเมนู · ไม่ถือว่าแพ้')];
      const guess = scenario === 'wrong' ? 'z' : 'a';
      if(scenario === 'repeat')return [...first,step('elif guess in guesses','ตรวจว่าทายแล้วหรือยัง','a อยู่ใน guesses แล้ว จึงไม่ append และไม่เพิ่ม mistakes',{guesses:['a'],guess:'a',mistakes:0},'ไฟล์ไม่เปลี่ยน'),step('message = "You already','เก็บข้อความไว้แสดงตาถัดไป','ทุกครั้งจะล้างแล้ววาดใหม่ แต่ข้อความยังอยู่ในตัวแปร message',{guesses:['a'],mistakes:0,message:'You already guessed that letter.'},'ไฟล์ไม่เปลี่ยน','You already guessed that letter.')];
      return [...first,step('guesses.append','รับตัวอักษรใหม่','คำตอบเป็นตัวอักษรอังกฤษหนึ่งตัวและยังไม่ซ้ำ จึงเก็บลง guesses',{word:'banana',guess,guesses:[guess],mistakes:0},'ไฟล์ไม่เปลี่ยน'),scenario === 'wrong' ? step('mistakes += 1','ตัวอักษรไม่อยู่ในคำ','z ไม่อยู่ใน banana จึงเพิ่ม mistakes หนึ่งครั้ง และตั้งข้อความ Wrong!',{word:'banana',guesses:['z'],mistakes:1,message:'Wrong!'},'ไฟล์ไม่เปลี่ยน','Wrong! · รูปเพิ่มหัวหนึ่งส่วน') : step('message = "Correct!"','ทายถูก','a อยู่ในคำ จึงไม่เพิ่ม mistakes รอบถัดไป for จะเปิด a ทุกตำแหน่ง',{word:'banana',guesses:['a'],mistakes:0,display:'_ a _ a _ a',message:'Correct!'},'ไฟล์ไม่เปลี่ยน','Correct!')];
    }
    if(lesson === 'add') {
      const word = scenario === 'invalid'?'dog1':scenario === 'duplicate'?'cat':'kiwi';
      const first=[step('word = input','รับและจัดรูปแบบคำ','strip() ตัดช่องว่างหัวท้าย lower() แปลงตัวพิมพ์เล็ก เช่น " KIWI " กลายเป็น kiwi',{words:[cat],word},'ยังไม่บันทึกไฟล์')];
      if(scenario==='invalid')return [...first,step('if not word.isascii()','ปฏิเสธคำที่มีตัวเลข','dog1 ไม่ผ่าน isalpha() จึงแจ้งเตือนและ return ก่อนเพิ่มอะไร',{words:[cat],word},'ไฟล์ไม่เปลี่ยน','Enter a word using English letters only.')];
      if(scenario==='duplicate')return [...first,step('if item["word"] == word','เจอคำซ้ำ','for เจอ cat ในคลังแล้ว จึง return โดยไม่ถามคำใบ้',{words:[cat],word},'ไฟล์ไม่เปลี่ยน','This word already exists.')];
      return [...first,step('hint = input','รับคำใบ้หลังผ่านการตรวจคำ','คำไม่ซ้ำจึงขอคำใบ้ ถ้าคำใบ้ว่างจะไม่เพิ่ม',{words:[cat],word:'kiwi',hint:'Green fruit'},'ยังไม่บันทึกไฟล์'),step('words.append','เพิ่ม dictionary ลง list เดิม','main() ใช้ list เดียวกันจึงเห็น kiwi ทันที แต่ต้องเลือกเมนู 6 จึงจะเซฟข้ามการปิดโปรแกรม',{words:bank},'ไฟล์เดิมยังไม่เปลี่ยน','Word added.')];
    }
    if(lesson === 'clear') {
      if(scenario==='pipe')return [step('if not sys.stdout.isatty()','ผลลัพธ์ไม่ได้ออก Terminal','เช่นส่งเข้าไฟล์ จึง return โดยไม่สั่งล้าง',{isatty:false},'ไม่มีการเขียนไฟล์จาก clear_screen','ไม่สั่ง cls หรือ clear')];
      if(scenario==='windows')return [step('if not sys.stdout.isatty()','กำลังแสดงบน Terminal','isatty() เป็น True จึงทำต่อ',{isatty:true},'ไม่เกี่ยวกับไฟล์คำศัพท์'),step('os.system("cls")','เลือกคำสั่งของ Windows','os.name เป็น nt จึงใช้ cls แล้ว game วาดเฟรมใหม่จากด้านบน',{isatty:true,'os.name':'nt'},'ไม่เปลี่ยนคลังคำ','ล้างหน้าจอ → วาดใหม่')];
      return [step('if os.name == "nt"','ระบบนี้ไม่ใช่ Windows','บน macOS/Linux os.name โดยทั่วไปเป็น posix จึงไปตรวจ TERM',{isatty:true,'os.name':'posix'},'ไม่เปลี่ยนคลังคำ'),step('elif os.environ.get','ตรวจความพร้อมของ Terminal',scenario==='dumb'?'TERM เป็น dumb จึงข้าม clear เพื่อหลีกเลี่ยงข้อความเตือน':'TERM เป็น xterm จึงเรียก clear ได้ตามเงื่อนไขของโปรแกรม',{'TERM':scenario==='dumb'?'dumb':'xterm'},'ไม่เปลี่ยนคลังคำ',scenario==='dumb'?'ไม่สั่ง clear · พิมพ์ต่อได้':'clear → วาดใหม่')];
    }
    throw new Error('Unknown lesson');
  }
  return {lessons,getTrace};
})();
