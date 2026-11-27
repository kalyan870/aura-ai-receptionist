// Speech Recognition & Speech Synthesis Utility (with Push-to-Talk support)

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isHolding = false;
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.onInterimCallback = null;
    this.onFinalCallback = null;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.selectedVoice = null;
    this.onListeningChange = null;
    this.onSpeakingChange = null;

    this.initSpeechRecognition();
    this.initVoice();
  }

  initVoice() {
    if (!this.synthesis) return;

    const setVoice = () => {
      const voices = this.synthesis.getVoices();
      const preferred = voices.find(
        v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Ava') || v.name.includes('Jenny')) && v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

      this.selectedVoice = preferred;
    };

    setVoice();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = setVoice;
    }
  }

  initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not supported in this browser environment.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onListeningChange) this.onListeningChange(true);
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this.finalTranscript += (this.finalTranscript ? ' ' : '') + piece.trim();
        } else {
          interim += piece;
        }
      }
      this.interimTranscript = interim.trim();
      const combined = [this.finalTranscript, this.interimTranscript].filter(Boolean).join(' ');
      if (this.onInterimCallback) {
        this.onInterimCallback(combined);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;

      // If user is still holding the button, restart recognition seamlessly to keep listening
      if (this.isHolding) {
        try {
          this.recognition.start();
          return;
        } catch (e) {
          console.warn('Could not restart continuous recognition:', e);
        }
      }

      if (this.onListeningChange) this.onListeningChange(false);

      // Deliver accumulated transcript on release
      const fullText = [this.finalTranscript, this.interimTranscript].filter(Boolean).join(' ').trim();
      const finalCb = this.onFinalCallback;
      this.onFinalCallback = null;
      this.onInterimCallback = null;

      if (finalCb) {
        finalCb(fullText);
      }
    };

    this.recognition.onerror = (e) => {
      // 'no-speech' or 'aborted' can happen on quick clicks; handle gracefully
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Speech recognition error:', e.error);
      }
      if (!this.isHolding) {
        this.isListening = false;
        if (this.onListeningChange) this.onListeningChange(false);
      }
    };
  }

  startPushToTalk(onInterim, onError) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser. Please use text input.');
      return;
    }

    // Stop speaking if AURA is currently talking
    this.stopSpeaking();

    this.isHolding = true;
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.onInterimCallback = onInterim;
    this.onFinalCallback = null;

    if (!this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        console.warn('Speech recognition start error:', e);
      }
    }
  }

  stopPushToTalk(onFinalTranscript) {
    if (!this.isHolding) return;
    this.isHolding = false;
    this.onFinalCallback = onFinalTranscript;

    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Speech recognition stop error:', e);
      }
    } else {
      // Recognition already ended or hadn't started yet
      const fullText = [this.finalTranscript, this.interimTranscript].filter(Boolean).join(' ').trim();
      this.onFinalCallback = null;
      this.onInterimCallback = null;
      if (this.onListeningChange) this.onListeningChange(false);
      if (onFinalTranscript) onFinalTranscript(fullText);
    }
  }

  speak(text, onStart, onEnd) {
    if (!this.synthesis) {
      if (onEnd) onEnd();
      return;
    }

    this.synthesis.cancel();

    const cleanText = text.replace(/[*_#`[\]()]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = 1.02;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      if (this.onSpeakingChange) this.onSpeakingChange(true);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (this.onSpeakingChange) this.onSpeakingChange(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      if (this.onSpeakingChange) this.onSpeakingChange(false);
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      if (this.onSpeakingChange) this.onSpeakingChange(false);
    }
  }
}

export const speechService = new SpeechService();
