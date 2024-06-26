const app = document.getElementById('app');
const suite = [5, 9, 1, 24, 12, 7, 1, 17, 20, 21];
let interval;

function start(){
  const clavier = document.createElement('div');
  clavier.classList.add('clavier');
  app.appendChild(clavier);

  let pattern = 'BNBNBBNBNBNBBNBNBBNBNBNBB';
  let noteIndex = 0;
  let whiteConsecutive = 0;
  let decalage = 0;

  for(let i = 0; i < pattern.length; i++){
    const note = document.createElement('div');
    if(pattern[i] === 'B'){
      // Create white note
      note.classList.add('note' + (noteIndex+1), 'white');
      whiteConsecutive++;
    } else {
      // Create black note
      note.classList.add('note' + (noteIndex+1), "black");
      if(whiteConsecutive === 2){
        decalage += 4;
        note.style.left = decalage + 'em';
      } else {
        noteIndex === 1 ? decalage += 1.5 : decalage += 2;
        note.style.left = decalage + 'em';
      }
      whiteConsecutive = 0;
    }
    clavier.appendChild(note);
    noteIndex++;
  }
  initEvent();
}

function initEvent(){
  nextNote()
  function midiMessageReceived(event) {
    const NOTE_ON = 9;
    const NOTE_OFF = 8
    const cmd = event.data[0] >> 4; 
    const pitch = event.data[1];
    const timestamp = Date.now();
    if (cmd === NOTE_OFF) { 
        const noteStartTime = notesOn.get(pitch);
        if (noteStartTime) {
          const note = document.querySelector('.note' + (pitch - 47));
          if(note){
            if(note.classList.contains('error')){
              note.classList.remove('error');
            }
          }
          notesOn.delete(pitch);
        }
    } else if (cmd === NOTE_ON) { 
        const note = document.querySelector('.note' + (pitch - 47));
        if(note){
          if(note.classList.contains('next') && suite.length > 0){
            note.classList.remove('next');
            nextNote();
          } else {
            note.classList.add('error');
          }
        }
        notesOn.set(pitch, timestamp);
    }
  }

  const notesOn = new Map();


  function onMIDISuccess(midiAccess) {
    console.log('MIDI Access Granted');
    initDevices(midiAccess);
  }

  function onMIDIFailure() {
    console.error('MIDI Access Denied');
  }

  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

  function initDevices(midiAccess) {
    midiIn = [];
    midiOut = [];
    const inputs = midiAccess.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        midiIn.push(input.value);
    }
    const outputs = midiAccess.outputs.values();
    for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
        midiOut.push(output.value);
    }
    startListening();
  }

  function startListening() {
    for (const input of midiIn) {
      input.addEventListener('midimessage', midiMessageReceived);
    }
  }
}

function nextNote(){
  suite.pop()
  const note = document.querySelector('.note' + suite[suite.length - 1]);
  note.classList.add('next');
}

start();