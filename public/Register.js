const registerForm = document.getElementById("registerForm");
const otpSection = document.getElementById("otpSection");
const message = document.getElementById("message");

let currentEmail = "";

// ĐĂNG KÝ TÀI KHOẢN
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Kiểm tra mật khẩu
    if (password.length < 8) {
        message.textContent = "Mật khẩu phải có ít nhất 8 ký tự!";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Mật khẩu xác nhận không khớp!";
        return;
    }

    message.textContent = "Đang gửi mã OTP...";
    
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullname,
                email,
                password
            })
        });

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            currentEmail = email;

            registerForm.hidden = true;
            otpSection.hidden = false;

            message.textContent = "Đã gửi OTP đến Gmail của bạn. Hãy kiểm tra hộp thư!";
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Không thể kết nối máy chủ!";
    } finally {
        submitBtn.disabled = false;
    }
});


// XÁC NHẬN OTP
document.getElementById("verifyBtn").addEventListener("click", async () => {

    const otp = document.getElementById("otp").value.trim();

    if (!/^\d{6}$/.test(otp)) {
        message.textContent = "Vui lòng nhập đúng mã OTP 6 số!";
        return;
    }

    message.textContent = "Đang xác nhận OTP...";

    const verifyBtn = document.getElementById("verifyBtn");
    verifyBtn.disabled = true;

    try {
        const response = await fetch("/api/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: currentEmail,
                otp
            })
        });

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            message.textContent = "Xác nhận thành công! Đang chuyển đến trang đăng nhập...";

            setTimeout(() => {
                window.location.href = "Account.html";
            }, 1500);
        }
        } catch (error) {
        console.error(error);
        message.textContent = "Không thể kết nối máy chủ!";
    } finally {
        verifyBtn.disabled = false;
    }
});