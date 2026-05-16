const express = require("express");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan variables de entorno: SUPABASE_URL y SUPABASE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    const { error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        return res.redirect(`/error.html?msg=${encodeURIComponent(error.message)}`);
    }

    return res.redirect("/signup_success.html");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return res.redirect(`/error.html?msg=${encodeURIComponent(error.message)}`);
    }

    res.cookie("access_token", data.session.access_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    });

    return res.redirect("/private");
});

app.get("/private", async (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.redirect("/");
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        res.clearCookie("access_token");
        return res.redirect("/");
    }

    const filePath = path.join(__dirname, "private.html");

    fs.readFile(filePath, "utf8", (err, html) => {
        if (err) {
            console.error("No se pudo cargar private.html", err);
            return res.status(500).send("Error del servidor.");
        }

        const page = html.replace("{{userEmail}}", data.user.email);
        return res.send(page);
    });
});

app.get("/logout", (req, res) => {
    res.clearCookie("access_token");
    return res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
