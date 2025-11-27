import { Application, oakCors, send } from "./Dependencies/dependencias.ts";
import formularioRouter from "./Routes/formularioRouter.ts";

const app = new Application();

app.use(oakCors());

// API
app.use(formularioRouter.routes());
app.use(formularioRouter.allowedMethods());

// ✅ FRONTEND
app.use(async (ctx, next) => {
  if (ctx.request.url.pathname.startsWith("/api")) {
    await next();
    return;
  }

  try {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/frontend/dist`,
      index: "index.html",
    });
  } catch {
    await send(ctx, "index.html", {
      root: `${Deno.cwd()}/frontend/dist`,
    });
  }
});

const PORT = Number(Deno.env.get("PORT")) || 8000;

console.log("🚀 Servidor escuchando en puerto", PORT);

await app.listen({
  hostname: "0.0.0.0",
  port: PORT,
});
