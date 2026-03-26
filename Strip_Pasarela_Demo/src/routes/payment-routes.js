import { Router } from "express";
import { procesarPago } from "../controllers/pagoControllers.js";
const router=Router();

//router.get("/pagar", (req, res) => res.send("Pagando..."));
router.post("/pagar",procesarPago);

router.get("/exito", (req, res) => res.redirect("pagado.html"));

//router.get("/exito", (req, res) => res.send("Gracias por su pago"));
router.get("/cancelado", (req, res) => res.redirect("cancelado.html"));

export default router;