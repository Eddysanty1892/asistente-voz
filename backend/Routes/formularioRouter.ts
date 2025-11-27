import { Router } from "../Dependencies/dependencias.ts";
import { getFormularios, postFormulario } from "../Controller/formularioController.ts";

const formularioRouter = new Router();

formularioRouter.get("/formularios", getFormularios);
formularioRouter.post("/formularios", postFormulario);

export default formularioRouter;  // ← Cambiado a export default