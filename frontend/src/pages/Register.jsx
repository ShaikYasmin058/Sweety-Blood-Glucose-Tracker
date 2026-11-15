
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/useAuth";

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await register(name, email, password);
            navigate("/", {
                state: { message: "Registration successful! Please sign in." }
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand">
                    <div className="brand-icon">
                        <HeartPulse size={30} />
                    </div>
                    <h1>Sweety</h1>
                    <p>Blood Glucose Tracker</p>
                </div>

                <h2>Create your account</h2>
                <p className="auth-subtitle">
                    Start tracking your glucose readings.
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label>Full name</label>
                    <div className="input-group">
                        <User size={18} />
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <label>Email address</label>
                    <div className="input-group">
                        <Mail size={18} />
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <label>Password</label>
                    <div className="input-group">
                        <Lock size={18} />
                        <input
                            type="password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    <label>Confirm password</label>
                    <div className="input-group">
                        <Lock size={18} />
                        <input
                            type="password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="primary-btn" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
