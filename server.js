const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// 解析 POST 请求体数据
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json()); // 建议加上这一行以支持 JSON 数据

// 设置静态文件目录 (让 HTML 能被访问)
app.use(express.static(path.join(__dirname)));

// 内存数据库（演示用）
let users = [];

// --- 页面路由 ---

// 首页（注册页面）
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// 登录页面
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// --- 功能接口 ---

// 注册功能 (修复后的核心逻辑)
app.post("/register", (req, res) => {
    // [调试] 打印前端传来的原始数据，确保字段名正确
    console.log("收到注册请求:", req.body);

    // 关键修复点：这里解构的变量名必须与 HTML 中的 name 属性完全一致
    const { username, email, password, confirmPassword } = req.body;

    // --- BUG-01 修复：检查 username 是否为空 ---
    if (!username || username.trim() === "") {
        return res.status(400).send("Error: Username is required!");
    }

    // Email 基本校验
    if (!email) {
        return res.status(400).send("Error: Email is required!");
    }
    if (!email.includes("@")) {
        return res.status(400).send("Error: Invalid email format!");
    }

    // 密码存在校验
    if (!password) {
        return res.status(400).send("Error: Password is required!");
    }

    // --- BUG-02 修复：密码长度至少 6 位 ---
    // 原错误逻辑可能是 > 6 或其他，现修正为 < 6 报错
    if (password.length < 6) {
        return res.status(400).send("Error: Password must be at least 6 characters!");
    }

    // --- BUG-03 修复：验证确认密码 ---
    // 必须确保 HTML 中 input 的 name="confirmPassword"
    if (password !== confirmPassword) {
        return res.status(400).send("Error: Passwords do not match!");
    }

    // 检查用户名是否已存在
    const existUser = users.find(u => u.username === username);
    if (existUser) {
        return res.status(400).send("Error: Username already exists. Please login.");
    }

    // --- BUG-04 修复：数据结构规范化 ---
    // 使用标准的 username 字段存入数据库，而非 user
    const newUser = { username, email, password };
    users.push(newUser);
    
    console.log("注册成功，新用户:", newUser);
    res.send(`Registration successful! You can now <a href="/login">login</a>.`);
});

// 登录功能
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("Username and Password are required!");
    }

    // 查找用户
    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
        res.send(`Login successful! Welcome, ${foundUser.username}`);
    } else {
        const existUser = users.find(u => u.username === username);
        if (existUser) {
            res.status(401).send("Incorrect password. Please try again.");
        } else {
            res.status(404).send("User not found. Please register first.");
        }
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});