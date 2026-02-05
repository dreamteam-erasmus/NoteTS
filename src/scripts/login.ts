// Login page script

// Access lucide from window (loaded via CDN)
const lucide = (window as any).lucide;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const loginInput = document.getElementById('login') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
    const errorBanner = document.getElementById('error-banner') as HTMLDivElement;

    function checkFields() {
        loginBtn.disabled = !(loginInput.value.trim() && passwordInput.value.trim());
    }

    loginInput.addEventListener('input', checkFields);
    passwordInput.addEventListener('input', checkFields);
    checkFields();

    function handleSubmit(e: KeyboardEvent) {
        if (e.key === 'Enter' && !loginBtn.disabled) handleLogin();
    }

    passwordInput.addEventListener('keydown', handleSubmit);
    loginInput.addEventListener('keydown', handleSubmit);
    loginBtn.addEventListener('click', handleLogin);

    async function handleLogin() {
        loginBtn.textContent = 'Signing in...';
        loginBtn.disabled = true;
        errorBanner.classList.add('hidden');

        try {
            const res = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: loginInput.value,
                    password: passwordInput.value
                })
            });
            const json = await res.json();

            if (json.data === true) {
                window.location.href = '/dash.html';
            } else {
                errorBanner.classList.remove('hidden');
                loginBtn.textContent = 'Continue';
                checkFields();
            }
        } catch (err) {
            errorBanner.textContent = 'Connection error';
            errorBanner.classList.remove('hidden');
            loginBtn.textContent = 'Continue';
            checkFields();
        }
    }
});

export { };