export async function iniciarSesion(username,password){
    const response = await fetch("http://127.0.0.1:8000/api/token",{
        method:"POST",
        body: new URLSearchParams({"username":username,"password":password})
    })
    const data = await response.json();
    console.log(data)
    localStorage.setItem("token", data.access_token)
    return data
}