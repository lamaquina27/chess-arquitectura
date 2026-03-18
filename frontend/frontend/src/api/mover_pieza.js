import { data } from "react-router-dom"

export async function moverPieza(from, to, pieza) {
    const response = await fetch("http://localhost:8000/partida/mover", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            casilla_inicio: from,
            casilla_llegada: to,
            pieza: pieza
        })
    })
    const data = await response.json()
    console.log(data)
    return data
}
