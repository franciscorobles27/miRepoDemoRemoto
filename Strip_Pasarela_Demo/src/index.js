import express from "express";
import cors from "cors";
import { PORT } from "./config.js";
import path from "path";
import router from "../src/routes/payment-routes.js";


const app = express();
app.use(router);
app.use(express.json());
app.use(cors());
app.use(express.static(path.resolve("src/public")));

app.listen(PORT);
console.log("Servidor en el puerto 4000",PORT);