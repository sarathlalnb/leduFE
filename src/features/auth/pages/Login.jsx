import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../../services/allAPI";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("first")
    

    try {
      setLoading(true);
      setError("");

      const res = await loginUser(form);
      console.log(res)  

      const { token, user } = res;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }

    } catch (err) {
        console.log(err)
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">

        <h1 className="text-3xl font-bold text-center gradient-text mb-6">
          Ledu.
        </h1>

        <h2 className="text-xl font-semibold text-center mb-1">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Login to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-white font-medium gradient-bg hover:opacity-90 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;