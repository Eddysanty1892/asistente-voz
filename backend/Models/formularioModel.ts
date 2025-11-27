import { conexion } from "./conexion.ts";

interface FormularioData {
    idformularios?: number | null;
    nombres_apellidos: string;
    cedula_ciudadania: string;
    sexo: string;
    fecha_nacimiento: string;
    edad: number;
    eps_afiliacion: string;
    lugar_nacimiento: string;
    direccion_residencia: string;
    contacto_celular: string;
    victima_conflicto: string;
    sisben: string;
    discapacidad: string;
    tipo_discapacidad: string;
}

interface ResultadoFormulario {
    success: boolean;
    message: string;
    formulario?: Record<string, unknown>;
    id?: number;
}

export class Formulario {
    public _objformulario: FormularioData | null;

    constructor(objFormulario: FormularioData | null = null) {
        this._objformulario = objFormulario;
    }

    public async insertarFormulario(): Promise<ResultadoFormulario> {
    try {
        if (!this._objformulario) {
            throw new Error("No se ha proporcionado un objeto de formulario válido");
        }

        const {
            nombres_apellidos, cedula_ciudadania, sexo, fecha_nacimiento, edad,
            eps_afiliacion, lugar_nacimiento, direccion_residencia, contacto_celular,
            victima_conflicto, sisben, discapacidad, tipo_discapacidad
        } = this._objformulario;

        // ✅ VALIDACIÓN MÍNIMA - solo el nombre es realmente requerido
        if (!nombres_apellidos?.trim()) {
            throw new Error("El nombre y apellido es requerido");
        }

        // ✅ Usar valores por defecto si están vacíos
        const cedula = cedula_ciudadania?.trim() || "0000000000";
        const sexoVal = sexo?.trim() || "No especificado";

        await conexion.execute("START TRANSACTION");
        
        const result = await conexion.execute(`
            INSERT INTO formularios_adultos_mayores (
                nombres_apellidos, cedula_ciudadania, sexo, fecha_nacimiento, edad,
                eps_afiliacion, lugar_nacimiento, direccion_residencia, contacto_celular,
                victima_conflicto, sisben, discapacidad, tipo_discapacidad
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            nombres_apellidos.trim(), 
            cedula, 
            sexoVal, 
            fecha_nacimiento || null, 
            edad || 0,
            eps_afiliacion?.trim() || '', 
            lugar_nacimiento?.trim() || '', 
            direccion_residencia?.trim() || '', 
            contacto_celular?.trim() || '',
            victima_conflicto?.trim() || '', 
            sisben?.trim() || '', 
            discapacidad?.trim() || '', 
            tipo_discapacidad?.trim() || ''
        ]);

            // ✅ CORRECCIÓN: Verificación más segura
            if (result && 'affectedRows' in result && result.affectedRows && result.affectedRows > 0) {
                const lastInsertId = result.lastInsertId;
                const [formulario] = await conexion.query(
                    `SELECT * FROM formularios_adultos_mayores WHERE idformularios = ?`,
                    [lastInsertId]
                );
                await conexion.execute("COMMIT");
                return {
                    success: true,
                    message: "Formulario registrado correctamente",
                    formulario: formulario,
                    id: lastInsertId
                };
            } else {
                throw new Error("No fue posible registrar el formulario - ninguna fila afectada");
            }

        } catch (error) {
            await conexion.execute("ROLLBACK");
            const errorMessage = error instanceof Error ? error.message : "Error desconocido al insertar formulario";
            console.error("Error en insertarFormulario:", error);
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    public async seleccionarFormularios(): Promise<FormularioData[]> {
        try {
            const formularios = await conexion.query(
                `SELECT * FROM formularios_adultos_mayores ORDER BY fecha_registro DESC`
            );
            return formularios as FormularioData[];
        } catch (error) {
            console.error("Error en seleccionarFormularios:", error);
            throw new Error("Error al obtener formularios de la base de datos");
        }
    }
}

// import { conexion } from "./conexion.ts";

// interface FormularioData {
//     idformulario?: number | null;
//     nombres_apellidos: string;
//     cedula_ciudadania: string;
//     sexo: string;
//     fecha_nacimiento: string;
//     edad: number;
//     eps_afiliacion: string;
//     lugar_nacimiento: string;
//     direccion_residencia: string;
//     contacto_celular: string;
//     victima_conflicto: string;
//     sisben: string;
//     discapacidad: string;
//     tipo_discapacidad: string;
// }

// interface ResultadoFormulario {
//     [x: string]: any;
//     success: boolean;
//     message: string;
//     formulario?: Record<string, unknown>;
// }

// export class Formulario {
//     public _objformulario: FormularioData | null;

//     constructor(objFormulario: FormularioData | null = null) {
//         this._objformulario = objFormulario;
//     }

//     public async insertarFormulario(): Promise<ResultadoFormulario> {
//         try {
//             if (!this._objformulario) {
//                 throw new Error("No se ha proporcionado un objeto de formulario válido");
//             }

//             const {
//                 nombres_apellidos, cedula_ciudadania, sexo, fecha_nacimiento, edad,
//                 eps_afiliacion, lugar_nacimiento, direccion_residencia, contacto_celular,
//                 victima_conflicto, sisben, discapacidad, tipo_discapacidad
//             } = this._objformulario;

//             if (!nombres_apellidos || !cedula_ciudadania || !sexo) {
//                 throw new Error("Faltan campos requeridos: nombres, cédula y sexo son obligatorios");
//             }

//             await conexion.execute("START TRANSACTION");
            
//             const result = await conexion.execute(`
//                 INSERT INTO formularios_adultos_mayores (
//                     nombres_apellidos, cedula_ciudadania, sexo, fecha_nacimiento, edad,
//                     eps_afiliacion, lugar_nacimiento, direccion_residencia, contacto_celular,
//                     victima_conflicto, sisben, discapacidad, tipo_discapacidad
//                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//             `, [
//                 nombres_apellidos, cedula_ciudadania, sexo, fecha_nacimiento, edad,
//                 eps_afiliacion, lugar_nacimiento, direccion_residencia, contacto_celular,
//                 victima_conflicto, sisben, discapacidad, tipo_discapacidad || ''
//             ]);

//             // CORRECCIÓN: Verificar affectedRows correctamente
//             if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
//                 const [formulario] = await conexion.query(
//                     `SELECT * FROM formularios_adultos_mayores WHERE idformularios = LAST_INSERT_ID()`
//                 );
//                 await conexion.execute("COMMIT");
//                 return {
//                     success: true,
//                     message: "Formulario registrado correctamente",
//                     formulario: formulario
//                 };
//             } else {
//                 throw new Error("No fue posible registrar el formulario");
//             }

//         } catch (error) {
//             await conexion.execute("ROLLBACK");
//             // CORRECCIÓN: Manejo seguro del error
//             const errorMessage = error instanceof Error ? error.message : "Error desconocido";
//             return {
//                 success: false,
//                 message: errorMessage
//             };
//         }
//     }

//     public async seleccionarFormularios(): Promise<FormularioData[]> {
//         const { rows: formularios } = await conexion.execute(
//             `SELECT * FROM formularios_adultos_mayores ORDER BY fecha_registro DESC`
//         );
//         return formularios as FormularioData[];
//     }
// }