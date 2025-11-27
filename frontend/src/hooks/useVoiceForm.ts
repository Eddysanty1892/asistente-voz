/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from 'react';
import type { FormularioData } from '../types/formulario';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useFormState } from './useFormState';
import type { UseVoiceFormProps } from './types';

export const useVoiceForm = ({ onGuardarCompleto }: UseVoiceFormProps) => {
  // Hooks especializados
  const { speak, cancelSpeech } = useSpeechSynthesis();
  const {
    state,
    stateRef,
    formularioRef,
    camposPreguntas,
    preguntas,
    initialFormData,
    updateState,
    updateFormulario,
    syncRefs
  } = useFormState();

  const timeoutRef = useRef<any>(null);/*le agrege este para el inicio de la pregunta */
  // Ref para el manejador de respuestas
  const manejarRespuestaUsuarioRef = useRef<(texto: string) => void>(() => {});

  // Lógica de confirmación
  const confirmarRespuesta = useCallback(() => {
    const campoActual = camposPreguntas[stateRef.current.preguntaActual];
    const nuevaRespuesta = stateRef.current.respuestaTemporal;

    // Actualizar formulario
    const nuevoFormulario = {
      ...formularioRef.current,
      [campoActual]: nuevaRespuesta
    };
    
    updateFormulario({ [campoActual]: nuevaRespuesta });
    formularioRef.current = nuevoFormulario;

    // Limpiar estado temporal
    updateState({
      esperandoConfirmacion: false,
      respuestaTemporal: ""
    });

    // Manejar siguiente pregunta o finalizar
    if (stateRef.current.preguntaActual < preguntas.length - 1) {
      manejarSiguientePregunta();
    } else {
      finalizarFormulario(nuevoFormulario);
    }
  }, [camposPreguntas, preguntas.length, updateState, updateFormulario]);

  const rechazarRespuesta = useCallback(() => {
    speak("🔄 De acuerdo, repitamos la pregunta.", () => {
      updateState({
        esperandoConfirmacion: false,
        respuestaTemporal: ""
      });
      hacerPreguntaActual();
    });
  }, [speak, updateState]);

  // Lógica de flujo de preguntas
  const manejarSiguientePregunta = useCallback(() => {
    const siguiente = stateRef.current.preguntaActual + 1;
    
    updateState({ preguntaActual: siguiente });
    
    speak("✅ Correcto. Respuesta guardada.", () => {
      hacerPregunta(siguiente);
    });
  }, [speak, updateState]);
const hacerPregunta = useCallback((indice: number) => {
  const mensajesIntroduccion = [
    "Comencemos con la primera pregunta: ",
    "Ahora la segunda pregunta: ", 
    "Y finalmente la tercera pregunta: "
  ];
  
  const mensaje = indice < mensajesIntroduccion.length 
    ? mensajesIntroduccion[indice] + preguntas[indice]
    : `Pregunta ${indice + 1}: ${preguntas[indice]}`;
  
  speak(mensaje, () => {
    timeoutRef.current = setTimeout(() => {
      speak("Puede responder ahora.", () => {
        timeoutRef.current = setTimeout(() => startListening(), 1200);
      });
    }, 1000);
  });
}, [preguntas, speak]);

/*tenia este  */
  // const hacerPregunta = useCallback((indice: number) => {
  //   speak(`Siguiente pregunta: ${preguntas[indice]}`, () => {
  //     speak("Puede responder ahora.", () => {
  //       startListening();
  //     });
  //   });
  // }, [preguntas, speak]);

  const hacerPreguntaActual = useCallback(() => {
    hacerPregunta(stateRef.current.preguntaActual);
  }, [hacerPregunta]);

  const finalizarFormulario = useCallback((formulario: FormularioData) => {
    speak("✅ Correcto. Formulario completado.", () => {
      speak("Enviando datos...", () => {
        onGuardarCompleto(formulario);
      });
    });
  }, [speak, onGuardarCompleto]);

  // Procesamiento de respuestas
  const procesarRespuestaNormal = useCallback((texto: string, textoLimpio: string) => {
    let valor = texto.trim();
    
    // Procesamiento específico por tipo de pregunta
    if (stateRef.current.preguntaActual === 1) { // Edad
      const numeros = textoLimpio.match(/\d+/);
      if (numeros) valor = numeros[0];
    } else if (stateRef.current.preguntaActual === 2) { // Hijos
      valor = textoLimpio.includes("sí") || textoLimpio.includes("si") ? "Sí" : "No";
    }

    updateState({ respuestaTemporal: valor });
    
    speak(`Entendí: ${valor}.`, () => {
      updateState({ esperandoConfirmacion: true });
      speak('¿Es correcto? Diga "SÍ" para confirmar o "NO" para corregir.', () => {
        startListening();
      });
    });
  }, [speak, updateState]);

  const procesarConfirmacion = useCallback((textoLimpio: string) => {
    const esSi = /^(sí|si|s|afirmativo|correcto|claro)/i.test(textoLimpio);
    const esNo = /^(no|n|negativo|incorrecto|mal)/i.test(textoLimpio);

    if (esSi && !esNo) {
      confirmarRespuesta();
    } else if (esNo && !esSi) {
      rechazarRespuesta();
    } else {
      speak(`No entendí "${textoLimpio}". ¿Su respuesta es correcta?`, () => {
        speak('Diga claramente "SÍ" para confirmar o "NO" para corregir.', () => {
          startListening();
        });
      });
    }
  }, [confirmarRespuesta, rechazarRespuesta, speak]);

  // Manejador principal de respuestas
  const manejarRespuestaUsuario = useCallback((texto: string) => {
    const textoLimpio = texto.toLowerCase().trim().replace(/[.,!?]/g, '');

    if (stateRef.current.esperandoConfirmacion) {
      procesarConfirmacion(textoLimpio);
    } else {
      procesarRespuestaNormal(texto, textoLimpio);
    }
  }, [procesarConfirmacion, procesarRespuestaNormal]);

  // Configuración del reconocimiento de voz
  const { startListening, stopListening: stopRecognition } = useSpeechRecognition({
    onResult: (texto) => {
      stopRecognition();
      manejarRespuestaUsuarioRef.current(texto);
    },
    onStart: () => updateState({ isListening: true, errorMic: "" }),
    onEnd: () => updateState({ isListening: false }),
    onError: (error) => updateState({ errorMic: error, isListening: false })
  });

  // Inicialización y limpieza
  const iniciarFormulario = useCallback(() => {
    cancelSpeech();
    stopRecognition();
    
    updateState({
      isListening: false,
      preguntaActual: 0,
      formulario: { ...initialFormData },
      esperandoConfirmacion: false,
      respuestaTemporal: "",
      mensajeActual: "",
      errorMic: ""
    });
    
    formularioRef.current = { ...initialFormData };

    speak("Hola soy tu asistente de voz virtual ,Voy a guiarlo paso a paso para completar el formulario ,Después de cada respuesta, le pediré que confirme. ", () => {
      hacerPregunta(0);
    });
  }, [cancelSpeech, stopRecognition, updateState, speak, hacerPregunta]);

  const stopEverything = useCallback(() => {
    cancelSpeech();
    stopRecognition();
    updateState({
      isListening: false,
      preguntaActual: -1,
      esperandoConfirmacion: false,
      respuestaTemporal: "",
      mensajeActual: "",
      errorMic: ""
    });
  }, [cancelSpeech, stopRecognition, updateState]);

  // Efectos
  useEffect(() => {
    manejarRespuestaUsuarioRef.current = manejarRespuestaUsuario;
  }, [manejarRespuestaUsuario]);

  useEffect(() => {
    syncRefs();
  });

  useEffect(() => {
    return stopEverything;
  }, [stopEverything]);

  return {
    // Estado
    ...state,
    preguntas,
    formulario: state.formulario,
    
    // Acciones
    iniciarFormulario,
    stopListening: stopEverything
  };
};

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState, useRef, useCallback, useEffect, useMemo } from "react";
// import type { FormularioData } from "../types/formulario"; // ✅ Solo importar lo necesario

// interface UseVoiceFormProps {
//   onGuardarCompleto: (datos: FormularioData) => void;
// }

// export const useVoiceForm = ({ onGuardarCompleto }: UseVoiceFormProps) => {
//   const [isListening, setIsListening] = useState(false);
//   const [preguntaActual, setPreguntaActual] = useState(-1);
//   const [formulario, setFormulario] = useState<FormularioData>({
//     nombres_apellidos: "",
//     cedula_ciudadania: "",
//     sexo: "",
//     fecha_nacimiento: "",
//     edad: 0,
//     eps_afiliacion: "",
//     lugar_nacimiento: "",
//     direccion_residencia: "",
//     contacto_celular: "",
//     victima_conflicto: "",
//     sisben: "",
//     discapacidad: "",
//     tipo_discapacidad: ""
//   });

//   const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(false);
//   const [respuestaTemporal, setRespuestaTemporal] = useState("");
//   const [mensajeActual, setMensajeActual] = useState("");
//   const [errorMic, setErrorMic] = useState("");

//   const recognitionRef = useRef<any>(null);
//   const timeoutRef = useRef<any>(null);
  
//   // ✅ REF para el formulario REAL (siempre actualizado)
//   const formularioRef = useRef<FormularioData>({
//     nombres_apellidos: "",
//     cedula_ciudadania: "",
//     sexo: "",
//     fecha_nacimiento: "",
//     edad: 0,
//     eps_afiliacion: "",
//     lugar_nacimiento: "",
//     direccion_residencia: "",
//     contacto_celular: "",
//     victima_conflicto: "",
//     sisben: "",
//     discapacidad: "",
//     tipo_discapacidad: ""
//   });

//   // Refs para evitar problemas de closure
//   const esperandoConfirmacionRef = useRef(false);
//   const respuestaTemporalRef = useRef("");
//   const preguntaActualRef = useRef(-1);

//   // ✅ REF para manejarRespuestaUsuario (rompe la dependencia circular)
//   const manejarRespuestaUsuarioRef = useRef<(texto: string) => void>(() => {}); // ✅ Inicializar con función vacía

//   // ✅ CORREGIDO: Typo en "CampoFormulario" y usar keyof
//   const camposPreguntas = useMemo(() => [
//     "nombres_apellidos",
//     "edad",
//     "victima_conflicto"
//   ] as (keyof FormularioData)[], []);

//   const preguntas = useMemo(
//     () => [
//       "¿Cuáles son sus nombres y apellidos completos?",
//       "¿Cuántos años tiene?",
//       "¿Tiene hijos? Diga sí o no.",
//     ],
//     []
//   );

//   // ======= FUNCIÓN PARA HABLAR =======
//   const speak = useCallback((text: string, callback?: () => void) => {
//     if (!("speechSynthesis" in window)) {
//       setMensajeActual(text);
//       if (callback) setTimeout(callback, 2000);
//       return;
//     }

//     speechSynthesis.cancel();
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);

//     setMensajeActual(text);
    
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "es-CO";
//     utterance.rate = 0.8;

//     utterance.onend = () => {
//       setMensajeActual("");
//       if (callback) {
//         timeoutRef.current = setTimeout(callback, 1000);
//       }
//     };

//     utterance.onerror = () => {
//       setMensajeActual("");
//       if (callback) {
//         timeoutRef.current = setTimeout(callback, 1000);
//       }
//     };

//     speechSynthesis.speak(utterance);
//   }, []);

//   // ======= DETENER ESCUCHA =======
//   const stopListening = useCallback(() => {
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.stop();
//         setIsListening(false);
//       } catch (e) {
//         console.log("Error al detener reconocimiento:", e);
//       }
//     }
//   }, []);

//   // ======= INICIAR ESCUCHA ======= (DECLARADA PRIMERO)
//   const startListening = useCallback(() => {
//     console.log("🔊 Iniciando escucha...", "Confirmación:", esperandoConfirmacionRef.current);
    
//     stopListening();

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       setErrorMic("Reconocimiento de voz no disponible");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = "es-CO";
//     recognition.maxAlternatives = 1;

//     recognition.onstart = () => {
//       console.log("🎤 Micrófono ACTIVADO - Confirmación:", esperandoConfirmacionRef.current);
//       setIsListening(true);
//       setErrorMic("");
//     };

//     recognition.onend = () => {
//       console.log("🎤 Micrófono DESACTIVADO");
//       setIsListening(false);
//     };

//     recognition.onerror = (event: any) => {
//       console.error("❌ Error de micrófono:", event.error);
//       setIsListening(false);
//       setErrorMic("Error: " + event.error);
//     };

//     recognition.onresult = (event: any) => {
//       const texto = event.results[0][0].transcript.trim();
//       console.log("🎤 Usuario dijo:", texto, "- Confirmación:", esperandoConfirmacionRef.current);
//       stopListening();
      
//       // ✅ USAR LA REFERENCIA DIRECTA en lugar de la dependencia
//       if (manejarRespuestaUsuarioRef.current) {
//         manejarRespuestaUsuarioRef.current(texto);
//       }
//     };

//     try {
//       recognition.start();
//       recognitionRef.current = recognition;
//     } catch (error) {
//       console.error("❌ Error al iniciar reconocimiento:", error);
//       setErrorMic("No se pudo iniciar el micrófono");
//     }
//   }, [stopListening]); // ✅ SOLO stopListening como dependencia

//   // ======= CONFIRMAR RESPUESTA =======
//   const confirmarRespuesta = useCallback(() => {
//     console.log("✅ Confirmando respuesta:", respuestaTemporalRef.current);
    
//     const campoActual = camposPreguntas[preguntaActualRef.current];
    
//     // ✅ ACTUALIZAR TANTO EL REF COMO EL ESTADO
//     const nuevoFormulario = {
//       ...formularioRef.current,
//       [campoActual]: respuestaTemporalRef.current
//     };
    
//     formularioRef.current = nuevoFormulario;
//     setFormulario(nuevoFormulario);

//     console.log("💾 Formulario actualizado:", nuevoFormulario);

//     setEsperandoConfirmacion(false);
//     setRespuestaTemporal("");

//     if (preguntaActualRef.current < preguntas.length - 1) {
//       const siguiente = preguntaActualRef.current + 1;
//       setPreguntaActual(siguiente);
      
//       speak("✅ Correcto. Respuesta guardada.", () => {
//         timeoutRef.current = setTimeout(() => {
//           speak(`Siguiente pregunta: ${preguntas[siguiente]}`, () => {
//             timeoutRef.current = setTimeout(() => {
//               speak("Puede responder ahora.", () => {
//                 timeoutRef.current = setTimeout(() => startListening(), 1500);
//               });
//             }, 1000);
//           });
//         }, 500);
//       });
//     } else {
//       console.log("🎊 Formulario final completado:", nuevoFormulario);
//       speak("✅ Correcto. Formulario completado.", () => {
//         timeoutRef.current = setTimeout(() => {
//           speak("Enviando datos...", () => {
//             onGuardarCompleto(nuevoFormulario);
//           });
//         }, 500);
//       });
//     }
//   }, [preguntas, camposPreguntas, speak, startListening, onGuardarCompleto]);

//   // ======= RECHAZAR RESPUESTA =======
//   const rechazarRespuesta = useCallback(() => {
//     console.log("🔄 Rechazando respuesta");
    
//     speak("🔄 De acuerdo, repitamos la pregunta.", () => {
//       setEsperandoConfirmacion(false);
//       setRespuestaTemporal("");
//       timeoutRef.current = setTimeout(() => {
//         speak(preguntas[preguntaActualRef.current], () => {
//           timeoutRef.current = setTimeout(() => {
//             speak("Puede responder ahora.", () => {
//               timeoutRef.current = setTimeout(() => startListening(), 1500);
//             });
//           }, 1000);
//         });
//       }, 500);
//     });
//   }, [preguntas, speak, startListening]);

//   // ======= MANEJAR RESPUESTA DEL USUARIO =======
//   const manejarRespuestaUsuario = useCallback((texto: string) => {
//     const textoLimpio = texto.toLowerCase().trim().replace(/[.,!?]/g, '');
//     console.log("🔍 Procesando:", textoLimpio);
//     console.log("🎯 Estado actual - Confirmación:", esperandoConfirmacionRef.current, "Respuesta temp:", respuestaTemporalRef.current);

//     // MODO CONFIRMACIÓN - USANDO REF
//     if (esperandoConfirmacionRef.current) {
//       console.log("🔄 EN MODO CONFIRMACIÓN - Procesando SÍ/NO");
      
//       // DETECCIÓN MUY FLEXIBLE DE "SÍ"
//       const esSi = 
//         textoLimpio === "sí" || 
//         textoLimpio === "si" ||
//         textoLimpio === "s" ||
//         textoLimpio.includes("sí") ||
//         textoLimpio.includes("si") ||
//         textoLimpio.includes("afirmativo") ||
//         textoLimpio.includes("correcto") ||
//         textoLimpio.includes("claro") ||
//         textoLimpio === "sí sí" ||
//         textoLimpio === "si si" ||
//         textoLimpio === "correcta";

//       // DETECCIÓN MUY FLEXIBLE DE "NO"  
//       const esNo = 
//         textoLimpio === "no" ||
//         textoLimpio === "n" ||
//         textoLimpio.includes("no") ||
//         textoLimpio.includes("negativo") ||
//         textoLimpio.includes("incorrecto") ||
//         textoLimpio === "no no" ||
//         textoLimpio === "mal";

//       console.log("✅ ¿Es SÍ?", esSi, "- Texto:", textoLimpio);
//       console.log("❌ ¿Es NO?", esNo, "- Texto:", textoLimpio);

//       if (esSi && !esNo) {
//         console.log("🎉 CONFIRMACIÓN ACEPTADA - Avanzando...");
//         confirmarRespuesta();
//         return;
//       }
      
//       if (esNo && !esSi) {
//         console.log("🔄 CONFIRMACIÓN RECHAZADA - Repitiendo...");
//         rechazarRespuesta();
//         return;
//       }

//       // Si no está claro
//       console.log("🤔 Respuesta no clara en confirmación:", textoLimpio);
//       speak(`No entendí "${texto}". ¿Su respuesta es correcta?`, () => {
//         // Mantener el modo confirmación
//         timeoutRef.current = setTimeout(() => {
//           speak('Diga claramente "SÍ" para confirmar o "NO" para corregir.', () => {
//             timeoutRef.current = setTimeout(() => startListening(), 1500);
//           });
//         }, 500);
//       });
//       return;
//     }

//     // MODO RESPUESTA NORMAL
//     console.log("📝 MODO RESPUESTA NORMAL - Guardando respuesta temporal");
//     let valor = texto.trim();
    
//     if (preguntaActualRef.current === 1) { // Edad
//       const numeros = textoLimpio.match(/\d+/);
//       if (numeros) valor = numeros[0];
//       console.log("🔢 Edad procesada:", valor);
//     }
    
//     if (preguntaActualRef.current === 2) { // Hijos
//       if (textoLimpio.includes("sí") || textoLimpio.includes("si")) {
//         valor = "Sí";
//       } else if (textoLimpio.includes("no")) {
//         valor = "No";
//       }
//       console.log("👨‍👩‍👧‍👦 Respuesta hijos:", valor);
//     }

//     console.log("💾 Estableciendo respuesta temporal:", valor);
//     setRespuestaTemporal(valor);
//     respuestaTemporalRef.current = valor;
    
//     speak(`Entendí: ${valor}.`, () => {
//       console.log("🎯 Activando modo confirmación...");
//       setEsperandoConfirmacion(true);
//       esperandoConfirmacionRef.current = true;
//       timeoutRef.current = setTimeout(() => {
//         speak('¿Es correcto?', () => {
//           timeoutRef.current = setTimeout(() => {
//             speak('Diga "SÍ" para confirmar o "NO" para corregir.', () => {
//               timeoutRef.current = setTimeout(() => startListening(), 1500);
//             });
//           }, 800);
//         });
//       }, 500);
//     });
//   }, [speak, startListening, confirmarRespuesta, rechazarRespuesta]);

//   // ======= DETENER TODO =======
//   const stopEverything = useCallback(() => {
//     console.log("🛑 Deteniendo todo...");
    
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.stop();
//       } catch (e) {
//         console.log("Error al detener reconocimiento:", e);
//       }
//     }
    
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }
    
//     speechSynthesis.cancel();
//     setIsListening(false);
//     setPreguntaActual(-1);
//     setEsperandoConfirmacion(false);
//     setRespuestaTemporal("");
//     setMensajeActual("");
//     setErrorMic("");
    
//     // Resetear el ref del formulario
//     formularioRef.current = {
//       nombres_apellidos: "",
//       cedula_ciudadania: "",
//       sexo: "",
//       fecha_nacimiento: "",
//       edad: 0,
//       eps_afiliacion: "",
//       lugar_nacimiento: "",
//       direccion_residencia: "",
//       contacto_celular: "",
//       victima_conflicto: "",
//       sisben: "",
//       discapacidad: "",
//       tipo_discapacidad: ""
//     };
//   }, []);

//   // ======= INICIAR FORMULARIO =======
//   const iniciarFormulario = useCallback(() => {
//     console.log("🚀 Iniciando formulario con confirmación...");
    
//     stopEverything();
    
//     setTimeout(() => {
//       setPreguntaActual(0);
//       const formularioInicial = {
//         nombres_apellidos: "",
//         cedula_ciudadania: "",
//         sexo: "",
//         fecha_nacimiento: "",
//         edad: 0,
//         eps_afiliacion: "",
//         lugar_nacimiento: "",
//         direccion_residencia: "",
//         contacto_celular: "",
//         victima_conflicto: "",
//         sisben: "",
//         discapacidad: "",
//         tipo_discapacidad: ""
//       };
//       setFormulario(formularioInicial);
//       formularioRef.current = formularioInicial;

//       speak("Bienvenido al formulario por voz.", () => {
//         timeoutRef.current = setTimeout(() => {
//           speak("Primera pregunta:", () => {
//             timeoutRef.current = setTimeout(() => {
//               speak(preguntas[0], () => {
//                 timeoutRef.current = setTimeout(() => {
//                   speak("Puede responder ahora.", () => {
//                     timeoutRef.current = setTimeout(() => startListening(), 1500);
//                   });
//                 }, 1000);
//               });
//             }, 500);
//           });
//         }, 500);
//       });
//     }, 100);
//   }, [preguntas, speak, startListening, stopEverything]);

//   // ✅ ACTUALIZAR LA REFERENCIA cuando manejarRespuestaUsuario cambie
//   useEffect(() => {
//     manejarRespuestaUsuarioRef.current = manejarRespuestaUsuario;
//   }, [manejarRespuestaUsuario]);

//   // Sincronizar refs con estados
//   useEffect(() => {
//     esperandoConfirmacionRef.current = esperandoConfirmacion;
//     respuestaTemporalRef.current = respuestaTemporal;
//     preguntaActualRef.current = preguntaActual;
//   }, [esperandoConfirmacion, respuestaTemporal, preguntaActual]);

//   // Efecto para limpiar
//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//       speechSynthesis.cancel();
//     };
//   }, []);

//   return {
//     isListening,
//     preguntaActual,
//     preguntas,
//     formulario,
//     esperandoConfirmacion,
//     respuestaTemporal,
//     mensajeActual,
//     errorMic,
//     iniciarFormulario,
//     stopListening: stopEverything,
//   };
// };







// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState, useRef, useCallback, useEffect, useMemo } from "react";
// import type { FormularioData, CampoFormulario } from "../types/formulario";

// interface UseVoiceFormProps {
//   onGuardarCompleto: (datos: FormularioData) => void;
// }

// export const useVoiceForm = ({ onGuardarCompleto }: UseVoiceFormProps) => {
//   const [isListening, setIsListening] = useState(false);
//   const [preguntaActual, setPreguntaActual] = useState(0);
//   const [formulario, setFormulario] = useState<FormularioData>({
//     nombres_apellidos: "",
//     cedula_ciudadania: "",
//     sexo: "",
//     fecha_nacimiento: "",
//     edad: 0,
//     eps_afiliacion: "",
//     lugar_nacimiento: "",
//     direccion_residencia: "",
//     contacto_celular: "",
//     victima_conflicto: "",
//     sisben: "",
//     discapacidad: "",
//     tipo_discapacidad: "",
//   });

//   const [esperandoConfirmacion, setEsperandoConfirmacion] = useState(false);
//   const [respuestaTemporal, setRespuestaTemporal] = useState("");
//   const [mensajeActual, setMensajeActual] = useState("");

//   const recognitionRef = useRef<any>(null);
//   const hablandoRef = useRef(false);

//   const camposPreguntas: CampoFormulario[] = [
//     "nombres_apellidos",
//     "cedula_ciudadania",
//     "sexo",
//     "fecha_nacimiento",
//     "edad",
//     "eps_afiliacion",
//     "lugar_nacimiento",
//     "direccion_residencia",
//     "contacto_celular",
//     "victima_conflicto",
//     "sisben",
//     "discapacidad",
//     "tipo_discapacidad",
//   ];

//   const preguntas = useMemo(
//     () => [
//       "¿Cuáles son sus nombres y apellidos completos?",
//       "¿Cuál es su número de cédula de ciudadanía?",
//       "¿Cuál es su sexo? Diga masculino o femenino.",
//       "¿Cuál es su fecha de nacimiento?",
//       "¿Cuántos años tiene?",
//       "¿A qué EPS está afiliado?",
//       "¿En qué ciudad o lugar nació?",
//       "¿Cuál es su dirección de residencia?",
//       "¿Cuál es su número de celular de contacto?",
//       "¿Ha sido víctima del conflicto armado? Diga sí o no.",
//       "¿Cuál es su clasificación del SISBÉN?",
//       "¿Tiene alguna discapacidad? Diga sí o no.",
//       "¿Qué tipo de discapacidad tiene?",
//     ],
//     []
//   );

//   // ======= FUNCIÓN PARA HABLAR =======
//   const speak = useCallback((text: string, callback?: () => void) => {
//     if (!("speechSynthesis" in window)) {
//       console.warn("speechSynthesis no soportado");
//       if (callback) callback();
//       return;
//     }

//     speechSynthesis.cancel();
//     hablandoRef.current = true;

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "es-CO";
//     utterance.rate = 0.9;
//     utterance.pitch = 1;
//     utterance.volume = 1;

//     utterance.onstart = () => {
//       setMensajeActual(text);
//       setIsListening(false);
//       if (recognitionRef.current) recognitionRef.current.stop();
//     };

//     utterance.onend = () => {
//       hablandoRef.current = false;
//       setMensajeActual("");
//       if (callback) setTimeout(callback, 800);
//     };

//     speechSynthesis.speak(utterance);
//   }, []);

//   // ======= FUNCIÓN PARA ESCUCHAR =======
//   const startListening = useCallback(() => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       speak("Este navegador no soporta reconocimiento de voz.");
//       return;
//     }

//     if (hablandoRef.current) return;

//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = "es-CO";

//     recognition.onstart = () => setIsListening(true);
//     recognition.onend = () => setIsListening(false);
//     recognition.onerror = (e: any) => {
//       console.warn("Error micrófono:", e.error);
//       setIsListening(false);
//     };
//     recognition.onresult = (e: any) => {
//       const texto = e.results[0][0].transcript.trim();
//       manejarVozUsuario(texto);
//     };

//     recognition.start();
//     recognitionRef.current = recognition;
//   }, [speak]);

//   // ======= CONFIRMAR RESPUESTA =======
//   const confirmarRespuesta = useCallback(() => {
//     const campoActual = camposPreguntas[preguntaActual];
//     const nuevoFormulario = { ...formulario, [campoActual]: respuestaTemporal };

//     setFormulario(nuevoFormulario);
//     setEsperandoConfirmacion(false);
//     setRespuestaTemporal("");

//     // --- Pasar a la siguiente pregunta ---
//     if (preguntaActual < preguntas.length - 1) {
//       const siguiente = preguntaActual + 1;
//       setPreguntaActual(siguiente);

//       // hablar la transición
//       speak("Okey, pasemos a la siguiente pregunta.", () => {
//         setTimeout(() => {
//           speak(preguntas[siguiente], () => startListening());
//         }, 1200);
//       });
//     } else {
//       speak("Formulario completado. Muchas gracias por su tiempo.", () => {
//         onGuardarCompleto(nuevoFormulario);
//       });
//     }
//   }, [
//     camposPreguntas,
//     preguntaActual,
//     respuestaTemporal,
//     formulario,
//     preguntas,
//     speak,
//     startListening,
//     onGuardarCompleto,
//   ]);

//   // ======= NEGAR RESPUESTA =======
//   const negarRespuesta = useCallback(() => {
//     speak("De acuerdo, repitamos la pregunta.", () => {
//       setEsperandoConfirmacion(false);
//       setRespuestaTemporal("");
//       setTimeout(() => {
//         speak(preguntas[preguntaActual], () => startListening());
//       }, 1000);
//     });
//   }, [preguntaActual, preguntas, speak, startListening]);

//   // ======= MANEJAR RECONOCIMIENTO =======
//   const manejarVozUsuario = useCallback(
//     (texto: string) => {
//       const t = texto.toLowerCase().trim();
//       console.log("Usuario dijo:", t);

//       // --- Confirmaciones ---
//       if (esperandoConfirmacion) {
//         if (["sí", "si", "claro", "correcto", "exacto"].some((w) => t.includes(w))) {
//           if (recognitionRef.current) recognitionRef.current.stop();
//           setEsperandoConfirmacion(false);
//           setIsListening(false);
//           confirmarRespuesta();
//           return;
//         }
//         if (["no", "incorrecto", "mal", "negativo"].some((w) => t.includes(w))) {
//           if (recognitionRef.current) recognitionRef.current.stop();
//           setEsperandoConfirmacion(false);
//           setIsListening(false);
//           negarRespuesta();
//           return;
//         }
//       }

//       // --- Respuesta normal ---
//       let valor = texto.trim();
//       if (preguntaActual === 2) {
//         if (t.includes("masculino")) valor = "Masculino";
//         else if (t.includes("femenino")) valor = "Femenino";
//       }
//       if ([9, 11].includes(preguntaActual)) {
//         if (t.includes("si")) valor = "Sí";
//         else if (t.includes("no")) valor = "No";
//       }

//       setRespuestaTemporal(valor);
//       speak(`Usted dijo: ${valor}. ¿Es correcto?`, () => {
//         setEsperandoConfirmacion(true);
//         setTimeout(() => startListening(), 1000);
//       });
//     },
//     [
//       preguntaActual,
//       esperandoConfirmacion,
//       confirmarRespuesta,
//       negarRespuesta,
//       speak,
//       startListening,
//     ]
//   );

//   // ======= DETENER =======
//   const stopListening = useCallback(() => {
//     if (recognitionRef.current) recognitionRef.current.stop();
//     speechSynthesis.cancel();
//     setIsListening(false);
//   }, []);

//   // ======= INICIAR FORMULARIO =======
//   const iniciarFormulario = useCallback(() => {
//     setPreguntaActual(0);
//     setFormulario({
//       nombres_apellidos: "",
//       cedula_ciudadania: "",
//       sexo: "",
//       fecha_nacimiento: "",
//       edad: 0,
//       eps_afiliacion: "",
//       lugar_nacimiento: "",
//       direccion_residencia: "",
//       contacto_celular: "",
//       victima_conflicto: "",
//       sisben: "",
//       discapacidad: "",
//       tipo_discapacidad: "",
//     });
//     setEsperandoConfirmacion(false);
//     setRespuestaTemporal("");

//     speak(
//       "Bienvenido al formulario por voz. Responda después de escuchar cada pregunta.",
//       () => {
//         setTimeout(() => {
//           speak(preguntas[0], () => startListening());
//         }, 1000);
//       }
//     );
//   }, [preguntas, speak, startListening]);

//   useEffect(() => {
//     return () => stopListening();
//   }, [stopListening]);

//   // ======= EXPORTAR ESTADO =======
//   return {
//     isListening,
//     preguntaActual,
//     preguntas,
//     formulario,
//     esperandoConfirmacion,
//     respuestaTemporal,
//     mensajeActual,
//     iniciarFormulario,
//     stopListening,
//   };
// };
