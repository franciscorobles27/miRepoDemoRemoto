const password = document.getElementById("password");
const btnMostrar = document.getElementById("btnMostrar");
const estado = document.getElementById("estado");

btnMostrar.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        btnMostrar.textContent = "Ocultar";
        estado.textContent = "La contraseña está visible.";
    } else {
        password.type = "password";
        btnMostrar.textContent = "Mostrar";
        estado.textContent = "La contraseña está oculta.";
    }
});
