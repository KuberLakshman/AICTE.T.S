import { useState } from "react";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    full_name: "",
    usn: "",
    email: "",
    phone: "",
    password: "",
    branch: "",
    semester: "",
    section: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/register",
        formData
      );

      alert(res.data.message);
    } catch (error) {
      console.log("Error:", error);
      console.log("Response:", error.response);
      alert(error.response?.data?.message || "Please check each registration field and try again.");
    }
  };

  return (
    <div>
      <h2>Student Registration</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          onChange={handleChange}
        />

        <input
          type="text"
          name="usn"
          placeholder="USN"
          onChange={handleChange}
        />

        <input
          type="text"
          name="branch"
          placeholder="Branch"
          onChange={handleChange}
        />

        <input
          type="text"
          name="semester"
          inputMode="numeric"
          placeholder="Semester"
          onChange={handleChange}
        />

        <input
          type="text"
          name="section"
          placeholder="Section"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
