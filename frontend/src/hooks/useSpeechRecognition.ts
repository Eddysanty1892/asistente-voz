/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useCallback } from 'react';
import type { RecognitionCallbacks } from './types';

export const useSpeechRecognition = (callbacks: RecognitionCallbacks) => {
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      callbacks.onError("Reconocimiento de voz no disponible");
      return;
    }

    // Detener reconocimiento previo
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "es-CO";
    recognition.maxAlternatives = 1;

    // Configurar event listeners
    recognition.onstart = callbacks.onStart;
    recognition.onend = callbacks.onEnd;
    
    recognition.onerror = (event: any) => {
      callbacks.onError("Error: " + event.error);
    };

    recognition.onresult = (event: any) => {
      const texto = event.results[0][0].transcript.trim();
      callbacks.onResult(texto);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      callbacks.onError("No se pudo iniciar el micrófono");
    }
  }, [callbacks]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Error al detener reconocimiento:", e);
      }
    }
  }, []);

  return {
    startListening,
    stopListening
  };
};