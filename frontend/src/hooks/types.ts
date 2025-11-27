import type { FormularioData } from '../types/formulario';

// Props para el hook principal
export interface UseVoiceFormProps {
  onGuardarCompleto: (datos: FormularioData) => void;
}

// Estado completo del formulario de voz
export interface VoiceFormState {
  isListening: boolean;
  preguntaActual: number;
  formulario: FormularioData;
  esperandoConfirmacion: boolean;
  respuestaTemporal: string;
  mensajeActual: string;
  errorMic: string;
}

// Configuración de voz
export interface SpeechConfig {
  lang: string;
  rate: number;
  volume: number;
}

// Callbacks para el reconocimiento de voz
export interface RecognitionCallbacks {
  onResult: (text: string) => void;
  onStart: () => void;
  onEnd: () => void;
  onError: (error: string) => void;
}

// Tipos para el procesamiento de respuestas
export interface AnswerProcessing {
  texto: string;
  textoLimpio: string;
  preguntaIndex: number;
}

// Tipos para las preguntas y campos
export interface QuestionFlow {
  camposPreguntas: (keyof FormularioData)[];
  preguntas: string[];
}

// Retorno del hook principal
export interface UseVoiceFormReturn {
  // Estados
  isListening: boolean;
  preguntaActual: number;
  preguntas: string[];
  formulario: FormularioData;
  esperandoConfirmacion: boolean;
  respuestaTemporal: string;
  mensajeActual: string;
  errorMic: string;
  
  // Acciones
  iniciarFormulario: () => void;
  stopListening: () => void;
}