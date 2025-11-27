/* eslint-disable @typescript-eslint/no-explicit-any */

import type { FormularioData } from "../types/formulario";

interface VoiceFormProps {
  isListening: boolean;
  preguntaActual: number;
  preguntas: string[];
  formulario: FormularioData;
  esperandoConfirmacion: boolean;
  respuestaTemporal: string;
  mensajeActual: string;
  errorMic: string;
  onIniciar: () => void;
  onDetener: () => void;
}

const VoiceForm = ({
  isListening,
  preguntaActual,
  preguntas,
  formulario,
  esperandoConfirmacion,
  respuestaTemporal,
  mensajeActual,
  errorMic,
  onIniciar,
  onDetener,
}: VoiceFormProps) => {

  const progreso =
  preguntaActual >= 0 && preguntas.length > 0
    ? ((preguntaActual + 1) / preguntas.length) * 100
    : 0;


  const camposLegibles: { [key: string]: string } = {
    nombres_apellidos: "Nombres y Apellidos",
    cedula_ciudadania: "Cédula",
    sexo: "Sexo",
    fecha_nacimiento: "Fecha Nacimiento",
    edad: "Edad",
    eps_afiliacion: "EPS",
    lugar_nacimiento: "Lugar Nacimiento",
    direccion_residencia: "Dirección",
    contacto_celular: "Celular",
    victima_conflicto: "Víctima Conflicto",
    sisben: "SISBEN",
    discapacidad: "Discapacidad",
    tipo_discapacidad: "Tipo Discapacidad",
  };

  const campoOrden: string[] = [
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
    "tipo_discapacidad",
  ];
return (
    // Contenedor principal del formulario, usa las clases de estilo neumórfico.
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-gray-800 bg-gray-50 font-sans">

      {/* TÍTULO SUPERIOR (Si lo quieres dentro del componente, sino elimínalo y déjalo en App.tsx) */}
      {/* <h2 className="text-3xl sm:text-4xl font-light text-blue-900 mb-10 sm:mb-16 text-center tracking-wide flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
        <svg className="w-8 h-8 sm:w-9 sm:h-9 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.657 11.5 3 12 3h1a2 2 0 012 2v14a2 2 0 01-2 2h-1c-.5 0-1.077-.657-1.707-1.293L5.586 15z"/>
        </svg>
        <span className="text-xl sm:text-4xl">Asistente de Voz </span>
        <span className="font-semibold text-blue-800 text-xl sm:text-4xl">Inteligente</span>
      </h2>
      */}

      <div className="space-y-8 sm:space-y-12">

        {/* PANEL SUPERIOR (PROGRESO Y BOTONES) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* PANEL IZQUIERDO – ESTADO + PROGRESO (2/3 ancho en desktop) */}
          <div className="col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 transition-all duration-500">
            
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10">

              {/* CÍRCULO DE PROGRESO */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-full bg-white shadow-lg"> 
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="gradAzul" x1="0" x2="1">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                  {/* Fondo del círculo */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e0e7ff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Progreso del círculo */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#gradAzul)"
                    strokeWidth="3"
                    strokeDasharray={`${progreso.toFixed(2)}, 100`}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs sm:text-sm text-blue-600 font-normal tracking-wide">Progreso</span>
                  <span className="text-2xl sm:text-3xl font-bold text-blue-900">
                    {Math.round(progreso)}%
                  </span>
                </div>
              </div>

              {/* ESTADO */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="text-sm text-blue-700 font-semibold tracking-widest uppercase">Estado del Formulario</div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {/* Estado Grabación */}
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-normal transition
                      ${
                        isListening
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                  >
                    {isListening ? "🎤 Grabando Activo" : "⚪ Inactivo"}
                  </div>
                  {/* Progreso */}
                  <div className="px-4 py-2 rounded-full text-sm font-normal bg-blue-50 text-blue-800 border border-blue-200">
                    {preguntaActual + 1}/{preguntas.length}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-700 leading-relaxed pt-2 font-normal">
                  {esperandoConfirmacion
                    ? "🗣️ Por favor, confirma la información con 'sí' o 'no'."
                    : preguntaActual >= 0
                    ? "💬 Responde la pregunta indicada usando tu voz."
                    : "▶️ Presiona 'Iniciar' para activar el asistente de voz."}
                </p>
              </div>
            </div>
          </div>

          {/* BOTONES (1/3 ancho en desktop) */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <button
              onClick={onIniciar}
              className="w-full py-4 sm:py-5 rounded-full font-semibold text-base sm:text-lg
                bg-blue-500 text-white shadow-neumorphic-blue
                hover:bg-blue-600 active:shadow-inner-neumorphic-blue
                transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7v0a7 7 0 01-7-7v0m14 0V9a5 5 0 00-5-5H9a5 5 0 00-5 5v2m14 0c0 4.418-3.582 8-8 8s-8-3.582-8-8"/></svg> 
              Iniciar
            </button>

            <button
              onClick={onDetener}
              className="w-full py-4 sm:py-5 rounded-full font-semibold text-base sm:text-lg
                bg-red-500 text-white shadow-neumorphic-red
                hover:bg-red-600 active:shadow-inner-neumorphic-red
                transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Detener
            </button>
          </div>

        </div>
        
        {/* PANEL PRINCIPAL (REGISTRO Y ASISTENTE) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* CAMPOS (2/3 ancho en desktop) */}
          <div className="col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 transition-all duration-500">
            
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6 sm:mb-10 tracking-wide flex items-center gap-3">
              {/* Icono de Documento/Archivo */}
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              
              <span className="flex flex-wrap gap-x-1">
                <span>Información</span> <span className="font-semibold text-blue-800">Registrada</span>
              </span>
            </h3>

            {/* GRID DE CAMPOS REGISTRADOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {campoOrden.map((campo) => {
                const valor = (formulario as any)[campo];
                const label = camposLegibles[campo];
                const lleno = Boolean(valor && `${valor}`.trim() !== "" && valor !== 0); // Considerar 0 como no lleno para campos como 'edad' al inicio.

                return (
                  <div
                    key={campo}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 break-words
                      ${lleno
                        ? "bg-blue-50 border-blue-200 shadow-inner-soft"
                        : "bg-white border-gray-200 shadow-md-soft"}
                    `}
                  >
                    <div className="text-xs text-blue-600 uppercase font-semibold tracking-widest">
                      {label}
                    </div>

                    <div className={`mt-1 sm:mt-2 text-lg sm:text-xl font-medium ${lleno ? "text-blue-900" : "text-gray-500 italic font-light"}`}>
                      {valor || "Pendiente"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ASISTENTE (1/3 ancho en desktop) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 transition-all duration-500 flex flex-col">
            
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6 sm:mb-8 tracking-wide flex items-center gap-3">
              {/* Icono de Burbuja de Diálogo */}
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              
              {/* AJUSTE CLAVE: gap-x-0.5 para que las palabras "Interacción de Voz" no se rompan */}
              <span className="flex flex-wrap gap-x-0.5"> 
                <span>Interacción de</span> <span className="font-semibold text-blue-800">Voz</span>
              </span>
            </h3>

            {/* SISTEMA */}
            <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200 shadow-md-soft flex items-start gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.75 17L9 20l-4 1-4-1 4-1M15 17h6l-4 1-4-1M15 17l4 1-4-1 4-1m0-3h-6"/></svg>
              <div>
                <div className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wider">Sistema</div>
                <p className="text-sm sm:text-base text-gray-700 mt-1 font-normal break-words">
                  {mensajeActual || "Aquí aparecerán las instrucciones para guiarte."}
                </p>
              </div>
            </div>

            {/* PREGUNTA ACTUAL */}
            <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-2xl bg-white border border-blue-200 shadow-inner-soft">
              {preguntaActual >= 0 ? (
                <>
                  <div className="text-xs text-blue-600 font-semibold mb-1 uppercase">
                    Pregunta {preguntaActual + 1}/{preguntas.length}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-gray-800 break-words leading-snug">
                    {preguntas[preguntaActual]}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 italic text-sm sm:text-base font-normal">Presiona iniciar para comenzar.</p>
              )}
            </div>

            {/* RESPUESTA */}
            <div className={`mb-4 sm:mb-6 p-4 sm:p-5 rounded-2xl border break-words transition-all shadow-md
              ${esperandoConfirmacion
                ? "bg-yellow-50 border-yellow-300 text-yellow-800 animate-pulse-subtle"
                : "bg-blue-100 border-blue-300 text-blue-800 shadow-md-soft"
              }`}>
              <div className="text-xs font-bold uppercase tracking-wider">{esperandoConfirmacion ? "CONFIRMAR RESPUESTA" : "Tu Respuesta"}</div>
              <div className="mt-1 sm:mt-2 font-semibold text-lg sm:text-xl">{respuestaTemporal || "—"}</div>
              {esperandoConfirmacion && (
                <div className="mt-2 text-xs sm:text-sm font-normal opacity-80">
                  Di **“sí”** para confirmar o **“no”** para repetir.
                </div>
              )}
            </div>

            {/* MIC PANEL */}
            <div className="flex items-center gap-4 sm:gap-6 mt-4 p-3 sm:p-4 bg-gray-50 rounded-full border border-gray-200 shadow-inner-soft">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-300
                ${isListening
                  ? "bg-blue-600 text-white shadow-xl pulse-neumorphic"
                  : "bg-gray-200 text-gray-600 shadow-md-soft"
                }`}>
                {/* Ícono de Micrófono Elegante */}
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7v0a7 7 0 01-7-7v0m14 0V9a5 5 0 00-5-5H9a5 5 0 00-5 5v2m14 0c0 4.418-3.582 8-8 8s-8-3.582-8-8"/></svg>
              </div>

              <div>
                <div className="text-base sm:text-lg font-bold text-gray-800">
                  {isListening ? "🎙️ Escuchando..." : "Asistente en espera"}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                  {esperandoConfirmacion ? "Modo confirmación activo" : "Habla después del tono"}
                </div>
              </div>
            </div>

            {errorMic && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-300 text-red-700 text-sm break-words font-normal shadow-md-soft">
                <strong>Error:</strong> {errorMic}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* ESTILOS CSS PARA NEUMORFISMO Y ANIMACIONES */}
      <style >{`
        /* Sombra exterior suave general */
        .shadow-md-soft {
            box-shadow: 3px 3px 6px #d1d9e6, -3px -3px 6px #ffffff;
        }

        /* Sombra interior suave general */
        .shadow-inner-soft {
            box-shadow: inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #ffffff;
        }

        /* Neumorfismo para Botón Azul (Iniciar) */
        .shadow-neumorphic-blue {
            box-shadow: 6px 6px 12px #9bc8ff, -6px -6px 12px #c9e2ff;
        }
        .active\\:shadow-inner-neumorphic-blue:active {
            box-shadow: inset 4px 4px 8px #1e40af, inset -4px -4px 8px #60a5fa;
            transform: scale(0.98);
        }

        /* Neumorfismo para Botón Rojo (Detener) */
        .shadow-neumorphic-red {
            box-shadow: 6px 6px 12px #ffb3a3, -6px -6px 12px #ffc9b3;
        }
        .active\\:shadow-inner-neumorphic-red:active {
            box-shadow: inset 4px 4px 8px #991b1b, inset -4px -4px 8px #ef4444;
            transform: scale(0.98);
        }

        /* Animación de pulso Neumórfica para el Micrófono */
        @keyframes pulse-neumorphic {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(37, 99, 235, 0);
          }
        }
        .pulse-neumorphic {
          animation: pulse-neumorphic 1.8s infinite;
        }

        /* Animación de pulso sutil para la confirmación */
        @keyframes pulse-subtle {
          0%, 100% {
            box-shadow: 0 4px 6px -1px rgba(253, 230, 138, 0.5), 0 2px 4px -2px rgba(253, 230, 138, 0.5);
          }
          50% {
            box-shadow: 0 4px 6px -1px rgba(253, 230, 138, 0.7), 0 2px 4px -2px rgba(253, 230, 138, 0.7);
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default VoiceForm;


// /* eslint-disable @typescript-eslint/no-explicit-any */
// import type { FormularioData } from "../types/formulario";

// interface VoiceFormProps {
//   isListening: boolean;
//   preguntaActual: number;
//   preguntas: string[];
//   formulario: FormularioData;
//   esperandoConfirmacion: boolean;
//   respuestaTemporal: string;
//   mensajeActual: string;
//   errorMic: string;
//   onIniciar: () => void;
//   onDetener: () => void;
// }

// const VoiceForm = ({
//   isListening,
//   preguntaActual,
//   preguntas,
//   formulario,
//   esperandoConfirmacion,
//   respuestaTemporal,
//   mensajeActual,
//   errorMic,
//   onIniciar,
//   onDetener
// }: VoiceFormProps) => {
//   const progreso =
//     preguntaActual >= 0 && preguntas.length > 0
//       ? ((preguntaActual + 1) / preguntas.length) * 100
//       : 0;

//   const camposLegibles: { [key: string]: string } = {
//     nombres_apellidos: "Nombres y Apellidos",
//     cedula_ciudadania: "Cédula",
//     sexo: "Sexo",
//     fecha_nacimiento: "Fecha Nacimiento",
//     edad: "Edad",
//     eps_afiliacion: "EPS",
//     lugar_nacimiento: "Lugar Nacimiento",
//     direccion_residencia: "Dirección",
//     contacto_celular: "Celular",
//     victima_conflicto: "Víctima Conflicto",
//     sisben: "SISBEN",
//     discapacidad: "Discapacidad",
//     tipo_discapacidad: "Tipo Discapacidad",
//   };

//   const campoOrden: string[] = [
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

//   return (
//     <div className="space-y-10 text-gray-900">

//       {/* TOP PANEL: progreso circular + resumen */}
//       <div className="flex flex-col md:flex-row items-center gap-6">
//         <div className="w-full md:w-auto bg-white/70 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-gray-100 flex items-center gap-4">
//           {/* Circulo progreso */}
//           <div className="relative w-20 h-20">
//             <svg className="w-20 h-20" viewBox="0 0 36 36">
//               <defs>
//                 <linearGradient id="g1" x1="0" x2="1">
//                   <stop offset="0%" stopColor="#6366f1" />
//                   <stop offset="100%" stopColor="#7c3aed" />
//                 </linearGradient>
//               </defs>
//               <path
//                 d="M18 2.0845
//                    a 15.9155 15.9155 0 0 1 0 31.831
//                    a 15.9155 15.9155 0 0 1 0 -31.831"
//                 fill="none"
//                 stroke="#e6e7ee"
//                 strokeWidth="2.2"
//                 strokeLinecap="round"
//               />
//               <path
//                 d="M18 2.0845
//                    a 15.9155 15.9155 0 0 1 0 31.831
//                    a 15.9155 15.9155 0 0 1 0 -31.831"
//                 fill="none"
//                 stroke="url(#g1)"
//                 strokeWidth="2.2"
//                 strokeDasharray={`${progreso.toFixed(2)}, 100`}
//                 strokeLinecap="round"
//                 className="transition-all duration-700"
//               />
//             </svg>

//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="text-center">
//                 <div className="text-sm font-semibold text-gray-700">Progreso</div>
//                 <div className="text-lg font-extrabold text-gray-900">{Math.round(progreso)}%</div>
//               </div>
//             </div>
//           </div>

//           <div className="flex-1">
//             <div className="text-sm text-gray-600">Estado</div>
//             <div className="flex items-center gap-3 mt-1">
//               <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold shadow-sm
//                 ${isListening ? "bg-green-50 text-green-800 border border-green-100" : "bg-gray-50 text-gray-700 border border-gray-100"}`}>
//                 {isListening ? "🔊 Grabando" : "🔇 Inactivo"}
//               </div>

//               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold shadow-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
//                 {preguntaActual >= 0 ? `${preguntaActual + 1}/${preguntas.length}` : "0/" + preguntas.length}
//               </div>
//             </div>

//             <p className="mt-3 text-sm text-gray-600">
//               {preguntaActual >= 0 ? "Responde las preguntas por voz y confirma cuando te lo pidan." : "Presiona Iniciar para comenzar el formulario por voz."}
//             </p>
//           </div>
//         </div>

//         {/* quick actions (iniciar/detener) */}
//         <div className="w-full md:w-64 flex gap-4">
//           <button
//             onClick={onIniciar}
//             className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl py-3 font-bold shadow-lg hover:scale-[1.02] transition transform"
//             aria-pressed={isListening}
//           >
//             🎤 Iniciar
//           </button>

//           <button
//             onClick={onDetener}
//             className="w-20 bg-white border border-gray-200 rounded-2xl py-3 text-red-600 font-bold shadow-sm hover:scale-105 transition"
//           >
//             ⏹
//           </button>
//         </div>
//       </div>

//       {/* main grid: campos + asistente */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//         {/* LEFT: campos con chips (mostrar todos en lista compacta) */}
//         <div className="col-span-2 bg-white/75 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-gray-100">
//           <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Datos del usuario</h3>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {campoOrden.map((campo) => {
//               const valor = (formulario as any)[campo];
//               const label = camposLegibles[campo] ?? campo.replace(/_/g, " ");
//               const filled = Boolean(valor && String(valor).trim() !== "");
//               return (
//                 <div key={campo} className="flex items-start gap-3 p-3 rounded-xl border transition-shadow hover:shadow-md"
//                      style={{ background: filled ? "linear-gradient(90deg,#f8fafc,#ffffff)" : "#ffffff" }}>
//                   <div className={`flex-shrink-0 mt-1 inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-semibold
//                     ${filled ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-100 text-gray-600 border border-gray-100"}`}>
//                     {filled ? "✓" : "…"}
//                   </div>

//                   <div className="min-w-0">
//                     <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
//                     <div className={`mt-1 text-sm font-medium ${filled ? "text-gray-900" : "text-gray-400"}`}>
//                       {valor || "Pendiente"}
//                     </div>
//                   </div>

//                   {/* copy quick (no funcional, solo UI) */}
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* RIGHT: asistente — tarjeta focal */}
//         <div className="bg-gradient-to-bl from-white/80 to-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col">
//           <h3 className="text-lg font-bold text-gray-900 mb-3">🤖 Asistente</h3>

//           {/* mensaje del sistema */}
//           <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700">
//             <div className="text-sm font-semibold">Sistema</div>
//             <div className="mt-1 text-sm">{mensajeActual || "Aquí verás las instrucciones y confirmaciones."}</div>
//           </div>

//           {/* pregunta grande */}
//           <div className="mb-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex-1">
//             {preguntaActual >= 0 ? (
//               <>
//                 <div className="text-xs text-gray-500 mb-2">Pregunta {preguntaActual + 1} / {preguntas.length}</div>
//                 <div className="text-lg font-semibold text-gray-900">{preguntas[preguntaActual]}</div>
//               </>
//             ) : (
//               <div className="text-gray-500">Presiona Iniciar para que comience el asistente por voz.</div>
//             )}
//           </div>

//           {/* respuesta temporal */}
//           <div className="mb-4">
//             <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-100 text-yellow-800">
//               <div className="text-xs font-semibold">Tu última respuesta</div>
//               <div className="mt-1 font-medium">{respuestaTemporal || "—"}</div>
//             </div>
//           </div>

//           {/* mic bubble y ayuda */}
//           <div className="flex items-center justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-xl transition-transform
//                 ${isListening ? "bg-red-500 text-white animate-pulse scale-105" : "bg-white text-gray-700 border border-gray-100"}`}>
//                 {isListening ? "🎙" : "🎤"}
//               </div>

//               <div>
//                 <div className="text-sm font-semibold">{isListening ? "Grabando ahora" : "Esperando comando"}</div>
//                 <div className="text-xs text-gray-500">{esperandoConfirmacion ? "Di 'sí' o 'no' para confirmar" : "Habla claramente después del tono"}</div>
//               </div>
//             </div>

//             <div className="flex flex-col gap-2 w-36">
//               <button
//                 onClick={onIniciar}
//                 className="w-full bg-indigo-600 text-white py-2 rounded-xl font-semibold shadow hover:brightness-105 transition"
//               >
//                 Iniciar
//               </button>
//               <button
//                 onClick={onDetener}
//                 className="w-full bg-white border border-gray-200 text-red-600 py-2 rounded-xl font-semibold shadow-sm hover:scale-105 transition"
//               >
//                 Detener
//               </button>
//             </div>
//           </div>

//           {/* error y ayuda */}
//           {errorMic && (
//             <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded-lg">
//               <strong>Error:</strong> {errorMic}
//             </div>
//           )}

//           <div className="mt-4 text-xs text-gray-500">
//             • Usa Chrome/Edge para mejor compatibilidad. • Confirma con "sí" cuando te pregunte.
//           </div>
//         </div>
//       </div>

//       {/* FOOTER HELP */}
//       <div className="bg-violet-50/70 rounded-2xl p-4 border border-violet-100 text-sm text-violet-700 shadow-sm">
//         <strong>Atajos útiles:</strong> di <em>"sí"</em> para confirmar, <em>"no"</em> para corregir. Habla claro y breve.
//       </div>
//     </div>
//   );
// };

// export default VoiceForm;


