export async function iniciarSesion(username, password) {
    try {
        const response = await fetch(`/api/token`, {
            method: "POST",
            body: new URLSearchParams({ "username": username, "password": password })
        })
        if (!response.ok) {
            return { error: true, mensaje: "Usuario o contraseña incorrectos." }
        }
        const data = await response.json();
        localStorage.setItem("token", data.access_token)
        return data
    } catch {
        return { error: true, mensaje: "Error de conexión." }
    }
}