export async function registro(correo,username,password){
    
    const response = await fetch("http://localhost:8000/api/usuario/registro",{
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"username":username,"email":correo,"password":password})
    })
    const data = await response.json();
    localStorage.setItem("token", data.access_token)
    console.log(data)
    return data

}