const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");
const show = document.querySelector(".show");

// Ẩn / hiện mật khẩu
let isShow = false;

show.addEventListener("click", () => {
    isShow = !isShow;
    password.type = isShow ? "text" : "password";
    show.textContent = isShow ? "Hide" : "Show";
});

// ĐĂNG NHẬP
loginBtn.addEventListener("click", async () => {
    const userEmail = email.value.trim().toLowerCase();
    const userPassword = password.value;

    if (!userEmail || !userPassword) {
        message.textContent = "Vui lòng nhập Gmail và mật khẩu!";
        return;
    }

    message.textContent = "Đang đăng nhập...";
    loginBtn.disabled = true;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: userEmail,
                password: userPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            message.textContent = "Đăng nhập thành công!";

            setTimeout(() => {
                window.location.href = "menu.html";
            }, 1000);
        } else {
            message.textContent = data.message || "Gmail hoặc mật khẩu không đúng!";
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Không thể kết nối máy chủ!";
    } finally {
        loginBtn.disabled = false;
    }
});