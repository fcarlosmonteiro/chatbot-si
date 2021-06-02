export default class SpeechSynthesis {
  constructor(props) {
    this.props = props;
    this.timeoutResumeInfinity = null;
    this.utterance = new window.SpeechSynthesisUtterance();
    this.utterance.text = props.text.replace(/\n/g, "");
    this.utterance.lang = props.lang || "pt-BR";
    this.utterance.pitch = parseFloat(props.pitch, 10) || 0.8;
    this.utterance.rate = parseFloat(props.rate, 10) || 1;
    this.utterance.volume = parseFloat(props.volume, 10) || 1;
    window.speechSynthesis.onvoiceschanged = this._handleVoicesChanged;
  }

  _handleVoicesChanged = () => {
    const { voice } = this.props;
    const voices = window.speechSynthesis.getVoices();
    const _voice = voices.find(item => item.name === voice);
    this.utterance.voice = _voice || voices[0];
  };

  // Issue with long text
  // https://stackoverflow.com/a/40508243/4515379
  _resumeInfinity = () => {
    window.speechSynthesis.resume();
    this.timeoutResumeInfinity = setTimeout(this._resumeInfinity, 1000);
  };

  onend = callback => {
    clearTimeout(this.timeoutResumeInfinity);
    this.utterance.onend = callback;
  };

  onerror = callback => {
    this.utterance.onerror = callback;
  };

  speak = () => {
    this._resumeInfinity();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(this.utterance);
  };

  pause = () => {
    clearTimeout(this.timeoutResumeInfinity);
    window.speechSynthesis.pause();
  };

  cancel = () => {
    clearTimeout(this.timeoutResumeInfinity);
    window.speechSynthesis.cancel();
  };

  resume = () => {
    this._resumeInfinity();
  };
}
