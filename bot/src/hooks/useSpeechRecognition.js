import { useState, useRef, useEffect, useReducer } from "react";

/** @type {typeof window.SpeechRecognition} */
const BrowserSpeechRecognition =
  window &&
  (window.SpeechRecognition ||
    window["webkitSpeechRecognition"] ||
    window["mozSpeechRecognition"] ||
    window["msSpeechRecognition"] ||
    window["oSpeechRecognition"]);

/** Creates a browser speech recognition instance. */
function createRecognition() {
  const result = new BrowserSpeechRecognition();
  result.interimResults = true;
  result.maxAlternatives = 1;
  result.lang = "pt-BR";
  return result;
}

/**
 * Concatenates any number of transcripts together, trimming whitespace and removing any empty transcripts.
 * @param  {...string} transcripts The transcripts to concatenate.
 * @returns {string}
 */
function concat(...transcripts) {
  return transcripts
    .map(x => x.trim())
    .filter(x => x)
    .join(" ");
}

/**
 * Builds a transcript from a speech recognition result list. This function only returns the most confident transcript.
 * @param {SpeechRecognitionResultList} speechRecognitionResultList The speech recognition results.
 * @param {(x: SpeechRecognitionResult) => boolean} predicate A filter to determine which results to include.
 */
function getTranscript(speechRecognitionResultList, predicate) {
  /** @type {string[]} */
  const result = [];
  for (let i = 0; i !== speechRecognitionResultList.length; ++i) {
    if (!predicate(speechRecognitionResultList[i])) {
      continue;
    }
    result.push(speechRecognitionResultList[i][0].transcript);
  }
  return concat(...result);
}

/**
 * @typedef {object} State
 * @property {string} final The transcript so far that has been finalized.
 * @property {string} transcript The full transcript, including the finalized transcript followed by the transient transcript.
 */
const initialState = { final: "", transcript: "" };

/**
 * @typedef {object} UpdateFinalTranscriptAction
 * @property {'UpdateFinalTranscript'} type
 * @property {string} final The additional final transcript to update the final transcript with.
 */

/**
 * @typedef {object} UpdateTransientTranscriptAction
 * @property {'UpdateTransientTranscript'} type
 * @property {string} transient The current transient transcript.
 */

/**
 * @typedef {object} ClearTranscriptAction
 * @property {'ClearTranscript'} type
 */

/**
 * Reducer for transcript state.
 * @param {State} state The original state.
 * @param {UpdateFinalTranscriptAction|UpdateTransientTranscriptAction|ClearTranscriptAction} action The action to apply.
 * @returns {State}
 */
function reducer(state, action) {
  switch (action.type) {
    case "UpdateFinalTranscript":
      return { ...state, final: concat(state.final, action.final) };
    case "UpdateTransientTranscript":
      return { ...state, transcript: concat(state.final, action.transient) };
    case "ClearTranscript":
      return initialState;
    default:
      throw new Error();
  }
}

export function useSpeechRecognition() {
  const recognition = useRef(
    BrowserSpeechRecognition ? createRecognition() : null
  );
  const browserSupportsSpeechRecognition = recognition.current !== null;
  const [listening, setListening] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      return;
    }

    /**
     * Handles the `onresult` event from the browser speech recognition object.
     * @param {SpeechRecognitionEvent} event
     */
    function handleResult(event) {
      const final = getTranscript(event.results, x => x.isFinal);
      dispatch({ type: "UpdateFinalTranscript", final });

      const transient = getTranscript(event.results, x => !x.isFinal);
      dispatch({ type: "UpdateTransientTranscript", transient });
    }

    /**
     * Handles the `onend` event from the browser speech recognition object.
     */
    function handleEnd() {
      setListening(false);
    }

    const r = recognition.current;
    r.addEventListener("result", handleResult);
    r.addEventListener("end", handleEnd);
    return () => {
      r.removeEventListener("result", handleResult);
      r.removeEventListener("end", handleEnd);
    };
  }, [browserSupportsSpeechRecognition]);

  function startListening() {
    dispatch({ type: "ClearTranscript" });
    setListening(true);
    recognition.current.start();
  }

  function stopListening() {
    setListening(false);
    recognition.current.stop();
  }

  return {
    browserSupportsSpeechRecognition,
    transcript: state.transcript,
    stopListening: stopListening,
    startListening: browserSupportsSpeechRecognition
      ? startListening
      : () => {},
    listening
  };
}
