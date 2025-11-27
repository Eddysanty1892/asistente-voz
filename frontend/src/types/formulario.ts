export interface FormularioData {
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

export type CampoFormulario = keyof FormularioData;