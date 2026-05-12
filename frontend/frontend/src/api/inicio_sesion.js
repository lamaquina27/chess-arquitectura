export async function iniciarSesion(username, password) {
    const response = await fetch(`/api/token`, {
        method: "POST",
        body: new URLSearchParams({ "username": username, "password": password })
    })
    if(response.status==404){
        return{
            error:true,mensaje:"Usuario no encontrado"
        }
    }
    const data = await response.json();
    localStorage.setItem("token", data.access_token)
    return data
}