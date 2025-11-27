import { useVoiceForm } from './hooks/useVoiceForm';
import VoiceForm from './components/VoiceForm';
import type { FormularioData } from './types/formulario';
import './App.css';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const handleGuardarCompleto = async (datos: FormularioData) => {
    console.log('📦 Formulario completado REAL:', datos);
    
    // ✅ Enviar strings vacíos en lugar de null
    const datosParaBackend = {
        nombres_apellidos: datos.nombres_apellidos,
        edad: datos.edad,
        victima_conflicto: datos.victima_conflicto,
        cedula_ciudadania: datos.cedula_ciudadania,
        sexo: datos.sexo,
        fecha_nacimiento: datos.fecha_nacimiento,
        eps_afiliacion: datos.eps_afiliacion,
        lugar_nacimiento: datos.lugar_nacimiento,
        direccion_residencia: datos.direccion_residencia,
        contacto_celular: datos.contacto_celular,
        sisben: datos.sisben,
        discapacidad: datos.discapacidad,
        tipo_discapacidad: datos.tipo_discapacidad
    };

    console.log('🔄 Enviando al backend:', datosParaBackend);

    // ✅ Mostrar toast de carga
    const loadingToast = toast.loading('Enviando formulario al servidor...');

    try {
        const response = await fetch('http://10.55.128.200:8000/formularios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosParaBackend),
        });

        const result = await response.json();
        console.log('📡 Respuesta del servidor:', result);

        // ✅ REMOVER ALERT Y USAR TOAST
        if (response.ok && result.success) {
            toast.dismiss(loadingToast);
            toast.success(
                `Formulario guardado correctamente!\nNombre: ${datos.nombres_apellidos}\nEdad: ${datos.edad}\nHijos: ${datos.victima_conflicto}`,
                {
                    duration: 6000,
                    position: 'top-right',
                    style: {
                        background: '#10B981',
                        color: 'white',
                        fontSize: '16px',
                        padding: '16px',
                    }
                }
            );
        } else {
            toast.dismiss(loadingToast);
            toast.error(
                `Error del servidor: ${result.message || 'Error desconocido'}`,
                {
                    duration: 5000,
                    position: 'top-right'
                }
            );
        }
    } catch (error) {
        console.error('❌ Error al enviar:', error);
        toast.dismiss(loadingToast);
        toast.error(
            'Error de conexión con el servidor. Verifica que el backend esté ejecutándose.',
            {
                duration: 5000,
                position: 'top-right'
            }
        );
    }
  };

  const {
    isListening,
    preguntaActual,
    preguntas,
    formulario,
    esperandoConfirmacion,
    respuestaTemporal,
    mensajeActual,
    errorMic,
    iniciarFormulario,
    stopListening
  } = useVoiceForm({ onGuardarCompleto: handleGuardarCompleto });

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans"> 
      {/* ✅ AGREGAR EL COMPONENTE Toaster */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 6000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            duration: Infinity,
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Contenedor centralizado (mismo que el VoiceForm) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-gray-800">

        {/* HEADER MEJORADO: Título sin referencia a Backend, con icono de Onda de Voz */}
        <header className="text-center mb-10 sm:mb-16">
          
          {/* TÍTULO GRANDE CON ICONO SVG DE ONDA DE VOZ */}
          <h1 className="text-3xl sm:text-4xl font-light text-blue-900 mb-2 tracking-wide flex flex-col items-center justify-center gap-2">
            
            {/* Nuevo Icono de Onda de Voz (Coherente con el VoiceForm) */}
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 shrink-0 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.657 11.5 3 12 3h1a2 2 0 012 2v14a2 2 0 01-2 2h-1c-.5 0-1.077-.657-1.707-1.293L5.586 15z"/>
            </svg>

            {/* Texto del Título, ahora solo "Formulario por Voz" */}
            <span className="text-3xl sm:text-4xl font-semibold text-blue-800">
                Formulario por Voz
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 mb-6">
            Captura tus datos mediante la voz.
          </p>
          
          {/* INDICADOR DE CONEXIÓN (Estilo Neumórfico Suave) */}
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-white border border-gray-100 shadow-md-soft transition-all duration-300">
            {/* Pequeña animación de pulso verde para el estado activo */}
            <div className="relative flex items-center justify-center mr-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                {/* Ping con menor opacidad para hacerlo más sutil */}
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-50"></div> 
            </div>
            
            <span className="text-sm text-gray-700 font-medium tracking-wide">
              🌐 Conectado al servidor de datos.
            </span>
          </div>
        </header>

        {/* Componente de Formulario por Voz */}
        <VoiceForm
          isListening={isListening}
          preguntaActual={preguntaActual}
          preguntas={preguntas}
          formulario={formulario}
          esperandoConfirmacion={esperandoConfirmacion}
          respuestaTemporal={respuestaTemporal}
          mensajeActual={mensajeActual}
          errorMic={errorMic}
          onIniciar={iniciarFormulario}
          onDetener={stopListening}
        />

        {/* INFORMACIÓN DE DEBUG ELIMINADA */}
        {/*
        <div className="mt-12 p-6 rounded-2xl bg-gray-100 border border-gray-200 shadow-inner-soft transition-all duration-300">
          <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
            🔍 Debug: Estado de la Aplicación
          </h3>
          <div className="text-sm text-gray-700 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p><strong>Pregunta Actual:</strong> {preguntaActual + 1} de {preguntas.length}</p>
            <p className="font-mono whitespace-pre-wrap break-all text-xs sm:text-sm pt-2">
              <strong>Datos del Formulario:</strong> {JSON.stringify(formulario, null, 2)}
            </p>
          </div>
        </div>
        */}
      </div>

      {/* Se incluyen los estilos de neumorfismo para asegurar la consistencia */}
      <style >{`
        /* Sombra exterior suave general */
        .shadow-md-soft {
            box-shadow: 3px 3px 6px #d1d9e6, -3px -3px 6px #ffffff;
        }

        /* Sombra interior suave general */
        .shadow-inner-soft {
            box-shadow: inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #ffffff;
        }
        
        /* Animación de pulso más suave para el indicador de conexión */
        @keyframes ping {
          0% {
            transform: scale(0.6);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}

export default App;

// import { useVoiceForm } from './hooks/useVoiceForm';
// import VoiceForm from './components/VoiceForm';
// import type { FormularioData } from './types/formulario';
// import './App.css';

// function App() {
//   const handleGuardarCompleto = async (datos: FormularioData) => {
//     console.log('📦 Formulario completado REAL:', datos);
    
//     // ✅ Enviar strings vacíos en lugar de null
//     const datosParaBackend = {
//         nombres_apellidos: datos.nombres_apellidos,
//         edad: datos.edad,
//         victima_conflicto: datos.victima_conflicto,
//         // ✅ CAMBIAR: Enviar strings vacíos en lugar de null
//         cedula_ciudadania: "",
//         sexo: "",
//         fecha_nacimiento: "",
//         eps_afiliacion: "",
//         lugar_nacimiento: "",
//         direccion_residencia: "",
//         contacto_celular: "",
//         sisben: "",
//         discapacidad: "",
//         tipo_discapacidad: ""
//     };

//     console.log('🔄 Enviando al backend:', datosParaBackend);

//     try {
//         const response = await fetch('http://localhost:8000/formularios', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(datosParaBackend),
//         });

//         const result = await response.json();
//         console.log('📡 Respuesta del servidor:', result);

//         if (response.ok && result.success) {
//             alert(`✅ Formulario guardado correctamente!\n\nNombre: ${datos.nombres_apellidos}\nEdad: ${datos.edad}\nHijos: ${datos.victima_conflicto}\n\nID: ${result.id || 'N/A'}`);
//         } else {
//             alert(`❌ Error del servidor: ${result.message}`);
//         }
//     } catch (error) {
//         console.error('❌ Error al enviar:', error);
//         alert('❌ Error de conexión con el servidor');
//     }
// };

//   const {
//     isListening,
//     preguntaActual,
//     preguntas,
//     formulario,
//     esperandoConfirmacion,
//     respuestaTemporal,
//     mensajeActual,
//     errorMic,
//     iniciarFormulario,
//     stopListening
//   } = useVoiceForm({ onGuardarCompleto: handleGuardarCompleto });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="container mx-auto px-4 max-w-7xl">
//         {/* Header */}
//         <header className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-gray-800 mb-2">
//             🎤 Formulario por Voz + Backend
//           </h1>
//           <p className="text-lg text-gray-600 mb-4">
//             Los datos se enviarán automáticamente al servidor Deno
//           </p>
          
//           {/* Indicador de conexión */}
//           <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 border border-green-300">
//             <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
//             <span className="text-sm text-green-700 font-medium">
//               Backend: http://localhost:8000
//             </span>
//           </div>
//         </header>

//         {/* Componente de Formulario por Voz */}
//         <VoiceForm
//           isListening={isListening}
//           preguntaActual={preguntaActual}
//           preguntas={preguntas}
//           formulario={formulario}
//           esperandoConfirmacion={esperandoConfirmacion}
//           respuestaTemporal={respuestaTemporal}
//           mensajeActual={mensajeActual}
//           errorMic={errorMic}
//           onIniciar={iniciarFormulario}
//           onDetener={stopListening}
//         />

//         {/* Información de Debug */}
//         <div className="mt-8 bg-gray-100 p-4 rounded-lg">
//           <h3 className="font-bold text-gray-800 mb-2">🔍 Estado Actual:</h3>
//           <div className="text-sm text-gray-600">
//             <p><strong>Pregunta:</strong> {preguntaActual + 1} de {preguntas.length}</p>
//             <p><strong>Datos listos:</strong> {JSON.stringify(formulario, null, 2)}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

// import { useVoiceForm } from './hooks/useVoiceForm';
// import VoiceForm from './components/VoiceForm';
// import type { FormularioData } from './types/formulario';
// import './App.css';

// function App() {
//   const handleGuardarCompleto = async (datos: FormularioData) => {
//     console.log('📦 Formulario completado:', datos);
    
//     const datosParaBackend = {
//       nombres_apellidos: datos.nombres_apellidos || "",
//       cedula_ciudadania: datos.cedula_ciudadania || "0000000000",
//       sexo: datos.sexo || "No especificado",
//       fecha_nacimiento: datos.fecha_nacimiento || "",
//       edad: parseInt(datos.edad.toString()) || 0,
//       eps_afiliacion: datos.eps_afiliacion || "",
//       lugar_nacimiento: datos.lugar_nacimiento || "",
//       direccion_residencia: datos.direccion_residencia || "",
//       contacto_celular: datos.contacto_celular || "",
//       victima_conflicto: datos.victima_conflicto || "No",
//       sisben: datos.sisben || "",
//       discapacidad: datos.discapacidad || "",
//       tipo_discapacidad: datos.tipo_discapacidad || ""
//     };

//     try {
//       console.log('🔄 Enviando datos al servidor...');
      
//       const response = await fetch('http://localhost:8000/formularios', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(datosParaBackend),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         console.log('✅ Respuesta del servidor:', result);
//         alert('✅ Formulario guardado correctamente');
//       } else {
//         throw new Error(`Error ${response.status}`);
//       }
//     } catch (error) {
//       console.error('❌ Error al enviar:', error);
//       alert('✅ Formulario completado (datos en consola)');
//     }
//   };

//   const {
//     isListening,
//     preguntaActual,
//     preguntas,
//     formulario,
//     mensajeActual,
//     errorMic,
//     iniciarFormulario,
//     stopListening
//   } = useVoiceForm({ onGuardarCompleto: handleGuardarCompleto });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="container mx-auto px-4 max-w-7xl">
//         <header className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-gray-800 mb-2">
//             🎤 Formulario por Voz - DEBUG
//           </h1>
//           <p className="text-lg text-gray-600 mb-4">
//             Pregunta actual: {preguntaActual + 1} - Estado: {isListening ? 'Escuchando' : 'En pausa'}
//           </p>
//         </header>

//         <VoiceForm
//           isListening={isListening}
//           preguntaActual={preguntaActual}
//           preguntas={preguntas}
//           formulario={formulario}
//           esperandoConfirmacion={false}
//           respuestaTemporal=""
//           mensajeActual={mensajeActual}
//           errorMic={errorMic}
//           onIniciar={iniciarFormulario}
//           onDetener={stopListening}
//         />

//         {/* DEBUG INFO */}
//         <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
//           <h3 className="font-bold text-yellow-800 mb-2">🐛 DEBUG INFO:</h3>
//           <div className="text-sm text-yellow-700">
//             <p><strong>Pregunta actual:</strong> {preguntaActual}</p>
//             <p><strong>Escuchando:</strong> {isListening ? 'SÍ' : 'NO'}</p>
//             <p><strong>Formulario:</strong> {JSON.stringify(formulario)}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

