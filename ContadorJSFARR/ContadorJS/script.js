let valor = 0;
let totalAumentar = 0;
let totalDisminuir = 0;

const contador = document.getElementById("contador");
const clicsAumentar = document.getElementById("clicsAumentar");
const clicsDisminuir = document.getElementById("clicsDisminuir");

const btnAumentar = document.getElementById("btnAumentar");
const btnDisminuir = document.getElementById("btnDisminuir");
const btnReiniciar = document.getElementById("btnReiniciar");

function actualizarPantalla() {
    contador.textContent = valor;
    clicsAumentar.textContent = totalAumentar;
    clicsDisminuir.textContent = totalDisminuir;
}

btnAumentar.addEventListener("click", () => {
    valor++;
    totalAumentar = totalAumentar >= 10 ? 0 : totalAumentar + 1;
    actualizarPantalla();
});

btnDisminuir.addEventListener("click", () => {
    if (valor > 0) {
        valor--;
    }

    totalDisminuir = totalDisminuir >= 10 ? 0 : totalDisminuir + 1;
    actualizarPantalla();
});

btnReiniciar.addEventListener("click", () => {
    valor = 0;
    totalAumentar = 0;
    totalDisminuir = 0;
    actualizarPantalla();
});

actualizarPantalla();
