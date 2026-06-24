const express = require("express");
const cors = require("cors");
const db = require("./db");
const app = express();
app.use(express.json());
app.use(cors());

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

app.post("/register", (req, res) => {
    const { full_name, usn, email, phone, password, branch, semester, section } = req.body;

    if (!email.endsWith("@vvce.ac.in")) {
        return res.status(400).json({ message: "Only VVCE emails are allowed" });
    }

    const sql = `
        INSERT INTO students
        (full_name, usn, email, phone, password, branch, semester, section)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [full_name, usn, email, phone, password, branch, semester, section], (err, result) => {
        if (err) {
            console.error(err);
            if (err.code === "ER_DUP_ENTRY") {
                const duplicateField = err.sqlMessage || "";
                if (duplicateField.includes("usn")) {
                    return res.status(409).json({ message: "USN is already registered" });
                }
                if (duplicateField.includes("email")) {
                    return res.status(409).json({ message: "Email is already registered" });
                }
            }
            return res.status(500).json({ message: "Unable to register student. Please check the form details and try again." });
        }
        res.json({ message: "Student Registered Successfully" });
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM students WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, result) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        if (result.length === 0) return res.status(401).json({ message: "Invalid Email or Password" });
        
        // Don't send password back in production, but okay for prototype
        res.json({ message: "Login Successful", student: result[0] });
    });
});

app.get("/student/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM students WHERE student_id = ?", [id], (err, result) => {
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

app.post("/activities", (req, res) => {
    const { student_id, activity_name, activity_date, points } = req.body;
    const sql = "INSERT INTO activities (student_id, activity_name, activity_date, points) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [student_id, activity_name, activity_date, points], (err, result) => {
        if (err) return res.status(500).json({ message: "Error adding activity" });
        updateTotalPoints(student_id);
        res.json({ message: "Activity added successfully" });
    });
});

app.get("/activities/:studentId", (req, res) => {
    const { studentId } = req.params;
    db.query("SELECT * FROM activities WHERE student_id = ? ORDER BY activity_date DESC", [studentId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        res.json(results);
    });
});

app.put("/activities/:id", (req, res) => {
    const { id } = req.params;
    const { activity_name, activity_date, points, student_id } = req.body;
    const sql = "UPDATE activities SET activity_name=?, activity_date=?, points=? WHERE activity_id=?";
    
    db.query(sql, [activity_name, activity_date, points, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating activity" });
        if (student_id) updateTotalPoints(student_id);
        res.json({ message: "Activity updated successfully" });
    });
});

app.delete("/activities/:id", (req, res) => {
    const { id } = req.params;
    const { student_id } = req.query; // pass student_id to update total_points
    
    db.query("DELETE FROM activities WHERE activity_id=?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting activity" });
        if (student_id) updateTotalPoints(student_id);
        res.json({ message: "Activity deleted successfully" });
    });
});

// --- Teacher APIs ---

app.post("/teacher/register", (req, res) => {
    const { full_name, email, password, branch } = req.body;
    const sql = "INSERT INTO teachers (full_name, email, password, branch) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [full_name, email, password, branch], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY" && (err.sqlMessage || "").includes("email")) {
                return res.status(409).json({ message: "teacher email is already registered" });
            }
            return res.status(500).json({ message: "Unable to register teacher. Please check the form details and try again." });
        }
        res.json({ message: "Teacher Registered Successfully" });
    });
});

app.post("/teacher/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM teachers WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, result) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        if (result.length === 0) return res.status(401).json({ message: "Invalid Email or Password" });
        res.json({ message: "Login Successful", teacher: result[0] });
    });
});

app.get("/students", (req, res) => {
    db.query("SELECT student_id, usn, full_name, branch, semester, section, total_points FROM students", (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        res.json(results);
    });
});

app.get("/students/filter", (req, res) => {
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

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
