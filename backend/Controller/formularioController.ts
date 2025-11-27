import { Context } from "../Dependencies/dependencias.ts";
import { Formulario } from "../Models/formularioModel.ts";
import { z } from "../Dependencies/dependencias.ts";

// ✅ ESQUEMA FLEXIBLE para desarrollo - Todos los campos con valores por defecto
const formularioSchema = z.object({
    nombres_apellidos: z.string().min(1, "El nombre y apellido es requerido"),
    cedula_ciudadania: z.string().default("0000000000"), // Valor por defecto
    sexo: z.string().default("No especificado"), // Valor por defecto
    fecha_nacimiento: z.string().default(""),
    edad: z.number().min(0).max(120).default(0),
    eps_afiliacion: z.string().default(""),
    lugar_nacimiento: z.string().default(""),
    direccion_residencia: z.string().default(""),
    contacto_celular: z.string().default(""),
    victima_conflicto: z.string().default("No"),
    sisben: z.string().default(""),
    discapacidad: z.string().default(""),
    tipo_discapacidad: z.string().default("")
});

export const postFormulario = async (ctx: Context) => {
    const { request, response } = ctx;
    
    try {
        // Verificar que el cuerpo no esté vacío
        if (!request.hasBody) {
            response.status = 400;
            response.body = { 
                success: false, 
                message: "El cuerpo de la solicitud está vacío" 
            };
            return;
        }

        const body = await request.body.json();
        console.log("📥 Datos recibidos del frontend:", body);
        
        // ✅ Validar datos con Zod - usando .parse() que aplica valores por defecto
        const validatedData = formularioSchema.parse({
            ...body,
            edad: body.edad ? parseInt(body.edad) : 0
        });

        console.log("✅ Datos validados:", validatedData);

        const FormularioData = {
            idformulario: null,
            nombres_apellidos: validatedData.nombres_apellidos,
            cedula_ciudadania: validatedData.cedula_ciudadania,
            sexo: validatedData.sexo,
            fecha_nacimiento: validatedData.fecha_nacimiento,
            edad: validatedData.edad,
            eps_afiliacion: validatedData.eps_afiliacion,
            lugar_nacimiento: validatedData.lugar_nacimiento,
            direccion_residencia: validatedData.direccion_residencia,
            contacto_celular: validatedData.contacto_celular,
            victima_conflicto: validatedData.victima_conflicto,
            sisben: validatedData.sisben,
            discapacidad: validatedData.discapacidad,
            tipo_discapacidad: validatedData.tipo_discapacidad
        };

        console.log("💾 Datos para guardar en BD:", FormularioData);

        const objFormulario = new Formulario(FormularioData);
        const result = await objFormulario.insertarFormulario();

        // Usar el resultado directamente del modelo
        if (result.success) {
            response.status = 201;
            response.body = {
                success: true,
                message: result.message,
                data: result.formulario,
                id: result.id
            };
        } else {
            response.status = 400;
            response.body = {
                success: false,
                message: result.message
            };
        }

    } catch (error) {
        console.error("❌ Error en postFormulario:", error);
        
        if (error instanceof z.ZodError) {
            response.status = 400;
            response.body = { 
                success: false, 
                message: "Error de validación",
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            };
        } else {
            response.status = 500;
            response.body = { 
                success: false, 
                message: "Error interno del servidor al procesar la solicitud"
            };
        }
    }
};

export const getFormularios = async (ctx: Context) => {
    const { response } = ctx;
    
    try {
        const objFormulario = new Formulario();
        const formularios = await objFormulario.seleccionarFormularios();
        
        response.status = 200;
        response.body = { 
            success: true, 
            data: formularios,
            count: formularios.length
        };
    } catch (error) {
        console.error("Error en getFormularios:", error);
        response.status = 500;
        response.body = { 
            success: false, 
            message: "Error interno del servidor al listar formularios"
        };
    }
};

// import { Context } from "../Dependencies/dependencias.ts";
// import { Formulario } from "../Models/formularioModel.ts";

// export const postFormulario = async (ctx: Context) => {
//     const { request, response } = ctx;
    
//     try {
//         const contentLength = request.headers.get("content-length");
//         if (contentLength === "0") {
//             response.status = 400;
//             response.body = { success: false, message: "El cuerpo de la solicitud está vacío" };
//             return;
//         }

//         const body = await request.body.json();
        
//         const FormularioData = {
//             idformulario: null,
//             nombres_apellidos: body.nombres_apellidos || "",
//             cedula_ciudadania: body.cedula_ciudadania || "",
//             sexo: body.sexo || "",
//             fecha_nacimiento: body.fecha_nacimiento || "",
//             edad: body.edad || 0,
//             eps_afiliacion: body.eps_afiliacion || "",
//             lugar_nacimiento: body.lugar_nacimiento || "",
//             direccion_residencia: body.direccion_residencia || "",
//             contacto_celular: body.contacto_celular || "",
//             victima_conflicto: body.victima_conflicto || "",
//             sisben: body.sisben || "",
//             discapacidad: body.discapacidad || "",
//             tipo_discapacidad: body.tipo_discapacidad || ""
//         };

//         const objFormulario = new Formulario(FormularioData);
//         const result = await objFormulario.insertarFormulario();

//         response.status = 200;
//         response.body = {
//             success: true,
//             body: result
//         };

//     } catch (error) {
//         response.status = 400;
//         response.body = { 
//             success: false, 
//             message: "Error al procesar la solicitud", 
//             errors: error 
//         };
//     }
// };

// export const getFormularios = async (ctx: Context) => {
//     const { response } = ctx;
    
//     try {
//         const objFormulario = new Formulario();
//         const formularios = await objFormulario.seleccionarFormularios();
        
//         response.status = 200;
//         response.body = { 
//             success: true, 
//             data: formularios 
//         };
//     } catch (error) {
//         response.status = 400;
//         response.body = { 
//             success: false, 
//             message: "Error al listar formularios", 
//             errors: error 
//         };
//     }
// };