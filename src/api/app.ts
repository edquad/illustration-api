//import "./configs/tls";
import express from "express";
import cors from "cors";
import http from "http";


import illustrationRouter from "./routes/illustrationRouter";
import contactsRouter from "./routes/contactsRouter";
import clientRouter from "./routes/clientRouter";
import adminRouter from "./routes/adminRouter";
import chatbotRouter from "./routes/chatbotRouter";

import config from "./configs/config";
import connection from "./configs/snowflake";

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 3010;

app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  try {
    const server = http.createServer(app);

    // Mount routers (matches Python URL structure)
    app.use("/api/illustration", illustrationRouter());
    app.use("/api/contacts", contactsRouter);
    app.use("/api/clients", clientRouter); // NEW: Client router
    app.use("/api/admin", adminRouter);
    app.use("/api/chatbot", chatbotRouter); // NEW: Chatbot router

    app.get("/", (req, res) => {
      res.send("Illustration API is running successfully ");
    });

    app.get("/health", async (req, res) => {
      if ((config as any).snowflakeDisabled) {
        return res.status(200).send({ ok: true, snowflake: "disabled" });
      }
      try {
        await (connection as any).use(async (conn: any) => {
          await new Promise<void>((resolve, reject) => {
            conn.execute({
              sqlText: "select 1",
              complete: (err: any) => (err ? reject(err) : resolve()),
            });
          });
        });
        res.status(200).send({ ok: true, snowflake: "up" });
      } catch (e: any) {
        res.status(503).send({ ok: false, snowflake: "down", error: e?.message });
      }
    });

    // Global error handler
    app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error(err.stack);
        res.status(500).send({ error: "Something went wrong!" });
      }
    );

    // Start the server
    server.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server due to startup error:", error);
    process.exit(1);
  }
};

startServer();
