require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const app = express();
app.use(express.json());
app.use(cors());

const JWT_EXPIRES_IN = "1h";

const getJwtSecret = () => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        const error = new Error("JWT_SECRET is missing. Add JWT_SECRET to backend/.env before using login routes.");
        error.code = "JWT_SECRET_MISSING";
        throw error;
    }

    return jwtSecret;
};

const createToken = (payload) => {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== "string") {
        return res.status(401).json({ message: "Authorization token is required" });
    }

    const [scheme, token] = authHeader.trim().split(/\s+/);

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Authorization token is required" });
    }

    try {
        req.user = jwt.verify(token, getJwtSecret());
        return next();
    } catch (err) {
        console.error("JWT verification error:", err.message);

        if (err.code === "JWT_SECRET_MISSING") {
            return res.status(500).json({ message: "Server authentication is not configured" });
        }

        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

const requireStudent = (req, res, next) => {
    if (!req.user || req.user.role !== "student") {
        return res.status(403).json({ message: "Student access required" });
    }

    return next();
};

const requireTeacher = (req, res, next) => {
    if (!req.user || req.user.role !== "teacher") {
        return res.status(403).json({ message: "Teacher access required" });
    }

    return next();
};

const withoutPassword = (user) => {
    if (!user || typeof user !== "object") {
        return {};
    }

    const { password, ...safeUser } = user;
    return safeUser;
};

const handleLoginServerError = (res, label, error) => {
    console.error(`${label} login server error:`, error.message);

    if (error.code === "JWT_SECRET_MISSING") {
        return res.status(500).json({ message: "Server authentication is not configured" });
    }

    return res.status(500).json({ message: "Unable to complete login due to a server error" });
};

const getMissingFields = (body, requiredFields) => {
    return requiredFields.filter((field) => {
        const value = body[field];
        return value === undefined || value === null || String(value).trim() === "";
    });
};

// --- Database Initialization ---
const initDb = () => {
    // Create Students Table
    db.query(`
        CREATE TABLE IF NOT EXISTS students (
            student_id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            usn VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone VARCHAR(20),
            password VARCHAR(255) NOT NULL,
            branch VARCHAR(100),
            semester INT,
            section VARCHAR(10),
            total_points INT DEFAULT 0
        )
    `, (err) => {
        if (err) console.error("Error creating students table", err);
    });

    // Create Teachers Table
    db.query(`
        CREATE TABLE IF NOT EXISTS teachers (
            teacher_id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            branch VARCHAR(100)
        )
    `, (err) => {
        if (err) console.error("Error creating teachers table", err);
    });

    // Create Activities Table
    db.query(`
        CREATE TABLE IF NOT EXISTS activities (
            activity_id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT,
            activity_name VARCHAR(255) NOT NULL,
            activity_date DATE,
            points INT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error("Error creating activities table", err);
    });

    // Ensure total_points column exists in case students table was already there without it
    db.query(`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0
    `, (err) => {
        // Ignore errors for column already exists depending on MySQL version
    });
};

initDb();

// --- Endpoints ---

app.get("/", (req, res) => {
    res.send("AICTE.T.S Backend Running");
});

// --- Student APIs ---

app.post("/register", async (req, res) => {
    const body = req.body || {};
    const { full_name, usn, email, phone, password, branch, semester, section } = body;
    const missingFields = getMissingFields(body, [
        "full_name",
        "usn",
        "email",
        "password",
        "branch",
        "semester",
        "section"
    ]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: `Missing required fields: ${missingFields.join(", ")}`
        });
    }

    if (!email.endsWith("@vvce.ac.in")) {
        return res.status(400).json({ message: "Only VVCE emails are allowed" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
            INSERT INTO students
            (full_name, usn, email, phone, password, branch, semester, section)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [full_name, usn, email, phone, hashedPassword, branch, semester, section], (err) => {
            if (err) {
                console.error("Student registration database error:", err.message);
                if (err.code === "ER_DUP_ENTRY") {
                    const duplicateField = err.sqlMessage || "";
                    if (duplicateField.includes("usn")) {
                        return res.status(409).json({ message: "USN is already registered" });
                    }
                    if (duplicateField.includes("email")) {
                        return res.status(409).json({ message: "Email is already registered" });
                    }
                }

                return res.status(500).json({ message: "Unable to register student due to a server or database error" });
            }

            return res.json({ message: "Student Registered Successfully" });
        });
    } catch (err) {
        console.error("Student password hashing error:", err.message);
        return res.status(500).json({ message: "Unable to register student due to a server error" });
    }
});

app.post("/login", (req, res) => {
    const body = req.body || {};
    const { email, password } = body;
    const missingFields = getMissingFields(body, ["email", "password"]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: `Missing required fields: ${missingFields.join(", ")}`
        });
    }

    const sql = "SELECT * FROM students WHERE email = ?";
    
    db.query(sql, [email], async (err, result) => {
        if (err) {
            console.error("Student login database error:", err.message);
            return res.status(500).json({ message: "Database Error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        const student = result[0];

        try {
            const passwordMatches = await bcrypt.compare(password, student.password);

            if (!passwordMatches) {
                return res.status(401).json({ message: "Invalid password" });
            }

            const token = createToken({
                id: student.student_id,
                email: student.email,
                role: "student"
            });

            return res.json({
                message: "Login Successful",
                token,
                student: withoutPassword(student)
            });
        } catch (compareError) {
            return handleLoginServerError(res, "Student", compareError);
        }
    });
});

app.get("/student/:id", verifyToken, requireTeacher, (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT student_id, full_name, usn, email, phone, branch, semester, section, total_points
        FROM students
        WHERE student_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        if (result.length === 0) return res.status(404).json({ message: "Student not found" });
        res.json(result[0]);
    });
});

// --- Activity APIs ---

const updateTotalPoints = (student_id) => {
    db.query("SELECT SUM(points) as total FROM activities WHERE student_id = ?", [student_id], (err, result) => {
        if (!err) {
            const total = result[0].total || 0;
            db.query("UPDATE students SET total_points = ? WHERE student_id = ?", [total, student_id]);
        }
    });
};

app.post("/activities", verifyToken, requireStudent, (req, res) => {
    const student_id = req.user.id;
    const { activity_name, activity_date, points } = req.body;
    const sql = "INSERT INTO activities (student_id, activity_name, activity_date, points) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [student_id, activity_name, activity_date, points], (err) => {
        if (err) return res.status(500).json({ message: "Error adding activity" });
        updateTotalPoints(student_id);
        res.json({ message: "Activity added successfully" });
    });
});

app.get("/activities/:studentId", verifyToken, requireStudent, (req, res) => {
    const { studentId } = req.params;

    if (String(studentId) !== String(req.user.id)) {
        return res.status(403).json({ message: "Access denied" });
    }

    db.query("SELECT * FROM activities WHERE student_id = ? ORDER BY activity_date DESC", [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        res.json(results);
    });
});

app.put("/activities/:id", verifyToken, requireStudent, (req, res) => {
    const { id } = req.params;
    const student_id = req.user.id;
    const { activity_name, activity_date, points } = req.body;
    const sql = "UPDATE activities SET activity_name=?, activity_date=?, points=? WHERE activity_id=? AND student_id=?";
    
    db.query(sql, [activity_name, activity_date, points, id, student_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating activity" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Activity not found" });
        }

        updateTotalPoints(student_id);
        res.json({ message: "Activity updated successfully" });
    });
});

app.delete("/activities/:id", verifyToken, requireStudent, (req, res) => {
    const { id } = req.params;
    const student_id = req.user.id;
    
    db.query("DELETE FROM activities WHERE activity_id=? AND student_id=?", [id, student_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting activity" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Activity not found" });
        }

        updateTotalPoints(student_id);
        res.json({ message: "Activity deleted successfully" });
    });
});

// --- Teacher APIs ---

app.post("/teacher/register", async (req, res) => {
    const body = req.body || {};
    const { full_name, email, password, branch } = body;
    const missingFields = getMissingFields(body, ["full_name", "email", "password", "branch"]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: `Missing required fields: ${missingFields.join(", ")}`
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO teachers (full_name, email, password, branch) VALUES (?, ?, ?, ?)";
        
        db.query(sql, [full_name, email, hashedPassword, branch], (err) => {
            if (err) {
                console.error("Teacher registration database error:", err.message);
                if (err.code === "ER_DUP_ENTRY" && (err.sqlMessage || "").includes("email")) {
                    return res.status(409).json({ message: "teacher email is already registered" });
                }

                return res.status(500).json({ message: "Unable to register teacher due to a server or database error" });
            }

            return res.json({ message: "Teacher Registered Successfully" });
        });
    } catch (err) {
        console.error("Teacher password hashing error:", err.message);
        return res.status(500).json({ message: "Unable to register teacher due to a server error" });
    }
});

app.post("/teacher/login", (req, res) => {
    const body = req.body || {};
    const { email, password } = body;
    const missingFields = getMissingFields(body, ["email", "password"]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: `Missing required fields: ${missingFields.join(", ")}`
        });
    }

    const sql = "SELECT * FROM teachers WHERE email = ?";
    
    db.query(sql, [email], async (err, result) => {
        if (err) {
            console.error("Teacher login database error:", err.message);
            return res.status(500).json({ message: "Database Error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const teacher = result[0];

        try {
            const passwordMatches = await bcrypt.compare(password, teacher.password);

            if (!passwordMatches) {
                return res.status(401).json({ message: "Invalid password" });
            }

            const token = createToken({
                id: teacher.teacher_id,
                email: teacher.email,
                role: "teacher"
            });

            return res.json({
                message: "Login Successful",
                token,
                teacher: withoutPassword(teacher)
            });
        } catch (compareError) {
            return handleLoginServerError(res, "Teacher", compareError);
        }
    });
});

app.get("/students", verifyToken, requireTeacher, (req, res) => {
    db.query("SELECT student_id, usn, full_name, branch, semester, section, total_points FROM students", (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        res.json(results);
    });
});

app.get("/students/filter", verifyToken, requireTeacher, (req, res) => {
    const { branch, semester, section } = req.query;
    let sql = "SELECT student_id, usn, full_name, branch, semester, section, total_points FROM students WHERE 1=1";
    const params = [];
    
    if (branch) {
        sql += " AND branch = ?";
        params.push(branch);
    }
    if (semester) {
        sql += " AND semester = ?";
        params.push(semester);
    }
    if (section) {
        sql += " AND section = ?";
        params.push(section);
    }
    
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        res.json(results);
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
