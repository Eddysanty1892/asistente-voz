import { useState, useRef, useMemo } from 'react';
import type { FormularioData } from '../types/formulario';
import type { VoiceFormState } from './types';
import { useCallback } from 'react';
const initialFormData: FormularioData = {
  nombres_apellidos: "",
  cedula_ciudadania: "",
  sexo: "",
  fecha_nacimiento: "",
  edad: 0,
  eps_afiliacion: "",
  lugar_nacimiento: "",
  direccion_residencia: "",
  contacto_celular: "",
  victima_conflicto: "",
  sisben: "",
  discapacidad: "",
  tipo_discapacidad: ""
};

export const useFormState = () => {
  // Estados reactivos
  const [state, setState] = useState<VoiceFormState>({
    isListening: false,
    preguntaActual: -1,
    formulario: { ...initialFormData },
    esperandoConfirmacion: false,
    respuestaTemporal: "",
    mensajeActual: "",
    errorMic: ""
  });

  // Referencias para valores actuales
  const stateRef = useRef(state);
  const formularioRef = useRef<FormularioData>({ ...initialFormData });

  // Campos y preguntas
  const camposPreguntas = useMemo(() => [
    "nombres_apellidos",
    "cedula_ciudadania", 
    "sexo",
    "fecha_nacimiento",
    "edad",
    "eps_afiliacion",
    "lugar_nacimiento",
    "direccion_residencia",
    "contacto_celular",
    "victima_conflicto",
    "sisben",
    "discapacidad",
    "tipo_discapacidad"
  ] as (keyof FormularioData)[], []);

  const preguntas = useMemo(() => [
     "¿Cuáles son sus nombres y apellidos completos?",
    "¿Cuál es su número de cédula de ciudadanía?",
    "¿Cuál es su sexo? Diga masculino o femenino.",
    "¿Cuál es su fecha de nacimiento? Por ejemplo: 15 de marzo de 1990.",
    "¿Cuántos años tiene?",
    "¿A qué EPS está afiliado?",
    "¿En qué ciudad o lugar nació?",
    "¿Cuál es su dirección de residencia?",
    "¿Cuál es su número de celular de contacto?",
    "¿Es víctima del conflicto armado? Diga sí o no.",
    "¿Cuál es su puntaje SISBEN?",
    "¿Tiene alguna discapacidad? Diga sí o no.",
    "¿Qué tipo de discapacidad tiene?"
  ], []);

  // Actualizadores de estado
  const updateState = useCallback((updates: Partial<VoiceFormState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      stateRef.current = newState;
      return newState;
    });
  }, []);

  const updateFormulario = useCallback((updates: Partial<FormularioData>) => {
    setState(prev => {
      const newFormulario = { ...prev.formulario, ...updates };
      formularioRef.current = newFormulario;
      return { ...prev, formulario: newFormulario };
    });
  }, []);

  // Sincronizar refs
  const syncRefs = useCallback(() => {
    stateRef.current = state;
  }, [state]);

  return {
    // Estado actual
    state,
    
    // Referencias
    stateRef,
    formularioRef,
    
    // Datos constantes
    camposPreguntas,
    preguntas,
    initialFormData,
    
    // Actualizadores
    updateState,
    updateFormulario,
    syncRefs
  };
};