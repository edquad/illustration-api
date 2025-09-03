import express from "express";
import cors from "cors";
import http from "http";

import illustrationRouter from "./routes/illustrationRouter";
import contactsRouter from "./routes/contactsRouter";
import clientRouter from "./routes/clientRouter";
import adminRouter from "./routes/adminRouter";

const app = express();
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
    app.use("/api/clients", clientRouter);
    app.use("/api/admin", adminRouter);

    app.get("/", (req, res) => {
      res.send("Illustration API is running successfully 🚀");
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