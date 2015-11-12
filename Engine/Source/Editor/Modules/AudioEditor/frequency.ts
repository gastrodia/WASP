(function(){
  var notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

      function startGain() {
          gainObj.gain.value = 1;
      }

      function stopGain() {
          gainObj.gain.value = 0;
      }

      function setNote(n) {
          var f = 27.5 * Math.pow(2, (n / 12));
          (<any>document.getElementById('note')).value = f + "Hz (" + notes[n % 12] + ")";
          setFrequency(f);
      }

      function setFrequency(f) {
          oscillator.frequency.value = f;
      }

      var context = new AudioContext();
      var oscillator = context.createOscillator();
      oscillator.type = (<any>oscillator).SINE;
      oscillator.frequency.value = 440;
      oscillator.start(0);
      var gainObj = context.createGain();
      gainObj.gain.value = 0;
      oscillator.connect(gainObj);
      gainObj.connect(context.destination);

})();
