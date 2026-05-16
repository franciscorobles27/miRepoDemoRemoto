import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import auth from "./cookieHttpOnly/auth.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}));

const SECRET="supersupersecreto";

app.post("login", (req,res) => {
    const { username, password} = req.body;

    //fake validation
    if (username==="admin" && password==="12345"){
        const token=jwt.sign({username}, SECRET,{expiresIn:"1h"});
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax"   
            });
        return res.json({message: "Login exitoso"})
    }
    return res.status(401).json({message:"Crdenciales invalidas"});
});

app.get("/perfil",auth,(req,res)=>{
    res.json({
        message:"Eres un usuario protegido",
        user: req.user
    });
});

app.post("/logout", (req, res)=>{
    res.clearCookie("token");
    res.json({message: "Logout exitoso"});
});

app.listen(3000, ()=>{
    console.log("Servidor en http:localhost:3000");
});