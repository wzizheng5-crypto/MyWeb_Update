const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname)));

// 内存存储用户数据（演示用）
let users = [];

// 首页（注册页面）
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// 登录页面
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// 注册功能
app.post("/register", (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // BUG-01 修复：username 不能为空
    if (!username) return res.send("Username is required!");

    // Email 校验
    if (!email) return res.send("Email is required!");
    if (!email.includes("@")) return res.send("Invalid email format!");

    // 密码校验
    if (!password) return res.send("Password is required!");

    // BUG-02 修复：正确的密码长度判断（至少 6 位）
    if (password.length < 6) return res.send("Password must be at least 6 characters!");

    // BUG-03 修复：验证两次密码一致
    if (password !== confirmPassword) return res.send("Passwords do not match!");

    // BUG-04 修复：字段命名改回 username
    const newUser = { username, email, password };

    // 检查重复用户名
    const existUser = users.find(u => u.username === username);
    if (existUser) return res.send("Username already exists. Please login.");

    users.push(newUser);
    console.log("User registered:", newUser);

    res.send(`Registration successful! You can now <a href="/login">login</a>.`);
});

// 登录功能
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username) return res.send("Username is required!");
    if (!password) return res.send("Password is required!");

    // 查找账号
    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
        res.send(`Login successful! Welcome, ${username}`);
    } else {
        const existUser = users.find(u => u.username === username);
        if (existUser) {
            res.send("Incorrect password. Please try again.");
        } else {
            res.send("User not found. Please register first.");
        }
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
