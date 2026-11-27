const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "scam_db"
});

db.connect(err => {
    if (err) {
        console.log("Lỗi MySQL:", err);
        return;
    }
    console.log("MySQL đã kết nối!");
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Trang chủ
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/Account.html");
});

// Đăng ký và gửi OTP
app.post("/api/register", async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin!"
            });
        }

        const [users] = await db.promise().query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (users.length > 0) {
            return res.status(400).json({
                message: "Email đã được đăng ký!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = String(
            Math.floor(100000 + Math.random() * 900000)
        );

        const expires = new Date(Date.now() + 5 * 60 * 1000);

        await db.promise().query(
            `INSERT INTO users
            (username, email, password, otp, otp_expires, is_verified)
            VALUES (?, ?, ?, ?, ?, FALSE)`,
            [fullname, email, hashedPassword, otp, expires]
        );

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Mã xác nhận tài khoản",
            text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`
        });

        res.json({
            message: "Đã gửi mã OTP về email của bạn!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Không thể đăng ký hoặc gửi OTP!"
        });
    }
});

// Xác nhận OTP
app.post("/api/verify", async (req, res) => {
    try {
        const { fulname, email, otp } = req.body;

        const [users] = await db.promise().query(
            `SELECT * FROM users
            WHERE email = ? AND otp = ?
            AND otp_expires > NOW()
            AND is_verified = FALSE`,
            [email, otp]
        );

        if (users.length === 0) {
            return res.status(400).json({
                message: "OTP không đúng hoặc đã hết hạn!"
});
        }

        await db.promise().query(
            `UPDATE users
            SET is_verified = TRUE,
                otp = NULL,
                otp_expires = NULL
            WHERE email = ?`,
            [email]
        );

        res.json({
            message: "Xác nhận tài khoản thành công!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi xác nhận OTP!"
        });
    }
});


// API ĐĂNG NHẬP
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập Gmail và mật khẩu!"
            });
        }

        const [users] = await db.promise().query(
            "SELECT * FROM users WHERE email = ? AND is_verified = TRUE",
            [email.trim().toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Tài khoản không tồn tại hoặc chưa xác minh Gmail!"
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Gmail hoặc mật khẩu không đúng!"
            });
        }

        res.json({
            message: "Đăng nhập thành công!"
        });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);

        res.status(500).json({
            message: "Lỗi máy chủ khi đăng nhập!"
        });
    }
});
app.listen(3000, () => {
    console.log("Server chạy tại http://localhost:3000");
});