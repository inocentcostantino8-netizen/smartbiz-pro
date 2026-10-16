// =========================================================================
// SMARTBIZ SYSTEM - AUTHENTICATION & LOGIN MANAGER (LILILOSAHIHISHWA 100%)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginEmailInput = document.getElementById("loginEmail");
    const loginPasswordInput = document.getElementById("loginPassword");
    const rememberMeCheck = document.getElementById("rememberMeCheck");
    const togglePasswordIcon = document.getElementById("togglePasswordIcon");

    // 1. Kagua kama mtumiaji alishajaza "Nikumbuke" hapo nyuma (Auto-fill)
    const savedEmail = localStorage.getItem("smartbiz_remember_email");
    if (savedEmail && loginEmailInput) {
        loginEmailInput.value = savedEmail;
        if (rememberMeCheck) rememberMeCheck.checked = true;
    }

    // 2. KIPENGELE CHA KUANGALIA NA KUFICHA PASSWORD (SHOW/HIDE)
    if (togglePasswordIcon && loginPasswordInput) {
        togglePasswordIcon.addEventListener("click", () => {
            if (loginPasswordInput.type === "password") {
                loginPasswordInput.type = "text";
                togglePasswordIcon.innerText = "🔒"; 
            } else {
                loginPasswordInput.type = "password";
                togglePasswordIcon.innerText = "👁️"; 
            }
        });
    }

    // 3. MINGILIANO YA LOG IN NA DATABASE YAKO (REKEBISHO LA RESULT ERROR)
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = loginEmailInput.value;
            const password = loginPasswordInput.value;

            // Maandalizi ya OAuth2 Form Payload inayotakiwa na backend yako
            const formData = new FormData();
            formData.append("username", email);
            formData.append("password", password);

            try {
                // Tunatuma ombi la kuingia na kusubiri majibu yajae kwenye variable ya 'result' kwanza!
                const result = await API.post("/login", formData, true);
                
                // REKEBISHO KUU: Sasa neno result lipo hai na linatambulika kikamilifu na kivinjari hapa!
                const storageEngine = rememberMeCheck && rememberMeCheck.checked ? localStorage : sessionStorage;
                
                storageEngine.setItem("smartbiz_token", result.access_token);
                storageEngine.setItem("smartbiz_user_role", result.role);
                
                // Mfumo unajaza jina la mtumiaji aliyelogin kulingana na barua pepe yake
                const cleanName = email.split('@')[0].toUpperCase();
                storageEngine.setItem("smartbiz_username", cleanName);

                // Kushughulikia mfumo wa Nikumbuke
                if (rememberMeCheck && rememberMeCheck.checked) {
                    localStorage.setItem("smartbiz_remember_email", email);
                } else {
                    localStorage.removeItem("smartbiz_remember_email");
                }

                alert(`🎉 Umefanikiwa kuingia! Jukumu lako kwenye duka: [${result.role}]`);
                window.location.href = "dashboard.html"; 

            } catch (error) {
                alert(`❌ Imeshindikana Kuingia:\n${error.message}`);
            }
        });
    }

    // 4. USIMAMIZI WA MODAL YA RESET PASSWORD (FORGOT PASSWORD ENG)
    const btnForgotPassword = document.getElementById("btnForgotPassword");
    const forgotPasswordModal = document.getElementById("forgotPasswordModal");
    const btnCancelReset = document.getElementById("btnCancelReset");
    const resetPasswordForm = document.getElementById("resetPasswordForm");

    if (btnForgotPassword && forgotPasswordModal && btnCancelReset) {
        btnForgotPassword.addEventListener("click", (e) => {
            e.preventDefault();
            forgotPasswordModal.style.display = "flex"; 
        });

        btnCancelReset.addEventListener("click", () => {
            forgotPasswordModal.style.display = "none"; 
        });
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("resetEmail").value;
            const newPassword = document.getElementById("resetNewPassword").value;

            try {
                await API.patch("/auth/reset-password", { email: email, new_password: newPassword });
                alert("🎉 Nenosiri jipya limehifadhiwa kwenye database! Sasa unaweza kulogin nalo.");
                forgotPasswordModal.style.display = "none";
                resetPasswordForm.reset();
            } catch (error) {
                alert(`❌ Hitilafu ya kubadilisha:\n${error.message}`);
            }
        });
    }
});
