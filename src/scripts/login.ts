const loginInput = document.getElementById("login") as HTMLInputElement
const passwordInput = document.getElementById("password") as HTMLInputElement
document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const json = await (await fetch("/api/users/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: loginInput.value,
            password:  passwordInput.value
        })
    })).json()
    console.log(json);
    
    if (json.data == true) {

    }
})