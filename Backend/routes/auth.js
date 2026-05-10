const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const router = express.Router();

/*
=====================================
REGISTER USER
=====================================
*/
router.post("/register", async (req, res) => {

    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from("users")
        .insert([
            {
                name,
                email,
                password: hashedPassword,
                role
            }
        ]);

    if (error) {
        return res.status(400).json({ error });
    }

    res.json({ success: true, data });
});

/*
=====================================
LOGIN USER
=====================================
*/
router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

    if (!data) {
        return res.status(400).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, data.password);

    if (!match) {
        return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
        {
            id: data.id,
            role: data.role,
            name: data.name
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.json({
        success: true,
        token,
        user: data
    });
});

module.exports = router;
