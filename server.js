const express = require("express");
const app = express();
app.use(express.json());

// เก็บข้อมูลใน Memory (ถ้า Server restart ข้อมูลหาย)
// แต่ใช้ได้ดีสำหรับการ migrate ครั้งเดียว
const playerData = {};

const SECRET_KEY = process.env.SECRET_KEY || "siamcamp2025";

// =============================
//  Middleware ตรวจ Secret Key
// =============================
function auth(req, res, next) {
    const key = req.headers["x-secret-key"];
    if (key !== SECRET_KEY) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    next();
}

// =============================
//  POST /save  - แมพเก่าส่งข้อมูลมาเก็บ
// =============================
app.post("/save", auth, (req, res) => {
    const { userId, data } = req.body;
    if (!userId || !data) {
        return res.status(400).json({ error: "Missing userId or data" });
    }
    playerData[userId] = data;
    console.log(`[SAVE] userId=${userId}`);
    res.json({ success: true });
});

// =============================
//  GET /load/:userId  - แมพใหม่ดึงข้อมูล
// =============================
app.get("/load/:userId", auth, (req, res) => {
    const { userId } = req.params;
    const data = playerData[userId];
    if (!data) {
        return res.status(404).json({ error: "Not found" });
    }
    console.log(`[LOAD] userId=${userId}`);
    res.json({ success: true, data });
});

// =============================
//  GET /count  - ดูว่ามีข้อมูลกี่คน
// =============================
app.get("/count", auth, (req, res) => {
    res.json({ count: Object.keys(playerData).length });
});

// =============================
//  GET /  - Health check
// =============================
app.get("/", (req, res) => {
    res.json({ status: "SiamCamp API Server Running ✅" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
