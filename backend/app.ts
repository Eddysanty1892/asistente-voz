import { Application, oakCors } from "./Dependencies/dependencias.ts";
import formularioRouter from "./Routes/formularioRouter.ts";

const app = new Application();

app.use(oakCors());

// ✅ SOLO API (NO FRONTEND)
app.use(formularioRouter.routes());
app.use(formularioRouter.allowedMethods());

const PORT = Number(Deno.env.get("PORT")) || 10000;

console.log("🚀 Backend escuchando en puerto", PORT);

await app.listen({
  hostname: "0.0.0.0",
  port: PORT,
});
