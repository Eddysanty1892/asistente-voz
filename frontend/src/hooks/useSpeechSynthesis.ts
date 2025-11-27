/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const timeoutRef = useRef<any>(null);

  const speak = useCallback((text: string, callback?: () => void) => {
    // Limpiar timeouts y síntesis previa
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (!("speechSynthesis" in window)) {
      if (callback) {
        timeoutRef.current = setTimeout(callback, 2000);
      }
      return text; // Retorna texto para mostrar en UI
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-CO";
    utterance.rate = 0.8;

    utterance.onend = () => {
      if (callback) {
        timeoutRef.current = setTimeout(callback, 1000);
      }
    };

    utterance.onerror = () => {
      if (callback) {
        timeoutRef.current = setTimeout(callback, 1000);
      }
    };

    speechSynthesis.speak(utterance);
    return text; // Retorna texto para mostrar en UI
  }, []);

  const cancelSpeech = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    speechSynthesis.cancel();
  }, []);

  return {
    speak,
    cancelSpeech
  };
};