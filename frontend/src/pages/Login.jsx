
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Activity,
    Mail,
    Lock,
    HeartPulse,
    ShieldCheck,
    ArrowRight,
    Droplets
} from "lucide-react";
import { useAuth } from "../context/useAuth";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const styles = {
        page: {
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "30px 18px",
            background: "linear-gradient(135deg, #e9f8f5 0%, #f4f8fc 55%, #eaf1ff 100%)",
            fontFamily: "'DM Sans', sans-serif"
        },
        card: {
            width: "100%",
            maxWidth: "1000px",
            minHeight: "590px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "#ffffff",
            borderRadius: "25px",
            overflow: "hidden",
            boxShadow: "0 25px 70px rgba(28, 74, 86, 0.13)"
        },
        left: {
            padding: "55px 45px",
            background: "linear-gradient(145deg, #087f75, #0ca99a)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        },
        logo: {
            display: "flex",
            alignItems: "center",
            gap: "12px"
        },
        logoIcon: {
            width: "48px",
            height: "48px",
            borderRadius: "15px",
            background: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        },
        right: {
            padding: "65px 55px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
        },
        input: {
            width: "100%",
            boxSizing: "border-box",
            padding: "15px 16px",
            border: "1px solid #dce8e8",
            borderRadius: "11px",
            outline: "none",
            fontSize: "14px",
            background: "#f9fbfc",
            color: "#263746"
        },
        button: {
            width: "100%",
            padding: "15px",
            marginTop: "12px",
            border: "none",
            borderRadius: "11px",
            background: "linear-gradient(90deg, #07877c, #0ba99a)",
            color: "white",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9px"
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.left}>
                    <div>
                        <div style={styles.logo}>
                            <div style={styles.logoIcon}>
                                <HeartPulse size={29} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "27px" }}>Sweety</h2>
                                <p style={{ margin: "3px 0 0", fontSize: "12px", opacity: 0.85 }}>
                                    BLOOD GLUCOSE TRACKER
                                </p>
                            </div>
                        </div>

                        <div style={{ marginTop: "85px" }}>
                            <p style={{
                                fontSize: "12px",
                                letterSpacing: "2px",
                                fontWeight: "700",
                                opacity: 0.8
                            }}>
                                YOUR HEALTH, YOUR CONTROL
                            </p>

                            <h1 style={{
                                fontSize: "39px",
                                lineHeight: "1.2",
                                margin: "15px 0",
                                fontWeight: "800"
                            }}>
                                Small steps.<br />Healthier days.
                            </h1>

                            <p style={{
                                fontSize: "15px",
                                lineHeight: "1.8",
                                opacity: 0.88,
                                maxWidth: "350px"
                            }}>
                                Keep track of your glucose readings, understand your
                                daily patterns, and stay informed about your health.
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "13px",
                        opacity: 0.9
                    }}>
                        <ShieldCheck size={19} />
                        Your health data deserves privacy and care.
                    </div>
                </div>

                <div style={styles.right}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: "#e6f7f4",
                        color: "#07877c",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "22px"
                    }}>
                        <Droplets size={25} />
                    </div>

                    <h1 style={{
                        fontSize: "30px",
                        color: "#203744",
                        margin: "0 0 9px",
                        fontWeight: "800"
                    }}>
                        Welcome back!
                    </h1>

                    <p style={{
                        color: "#82919b",
                        fontSize: "14px",
                        margin: "0 0 32px",
                        lineHeight: "1.6"
                    }}>
                        Sign in to continue your health journey.
                    </p>

                    {error && (
                        <div style={{
                            padding: "12px",
                            marginBottom: "18px",
                            borderRadius: "9px",
                            background: "#fff0f0",
                            color: "#c03939",
                            fontSize: "13px"
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <label style={{
                            display: "block",
                            color: "#344b57",
                            fontSize: "13px",
                            fontWeight: "700",
                            marginBottom: "9px"
                        }}>
                            Email address
                        </label>

                        <div style={{ position: "relative", marginBottom: "22px" }}>
                            <Mail
                                size={18}
                                color="#8ca1a9"
                                style={{
                                    position: "absolute",
                                    left: "14px",
                                    top: "15px"
                                }}
                            />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ ...styles.input, paddingLeft: "43px" }}
                            />
                        </div>

                        <label style={{
                            display: "block",
                            color: "#344b57",
                            fontSize: "13px",
                            fontWeight: "700",
                            marginBottom: "9px"
                        }}>
                            Password
                        </label>

                        <div style={{ position: "relative", marginBottom: "24px" }}>
                            <Lock
                                size={18}
                                color="#8ca1a9"
                                style={{
                                    position: "absolute",
                                    left: "14px",
                                    top: "15px"
                                }}
                            />
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ ...styles.input, paddingLeft: "43px" }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.button,
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <p style={{
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#82919b",
                        marginTop: "27px"
                    }}>
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            style={{
                                color: "#07877c",
                                fontWeight: "700",
                                textDecoration: "none"
                            }}
                        >
                            Create account
                        </Link>
                    </p>

                    <div style={{
                        borderTop: "1px solid #edf1f2",
                        paddingTop: "20px",
                        marginTop: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        color: "#94a4aa",
                        fontSize: "12px"
                    }}>
                        <Activity size={15} color="#0ba99a" />
                        Private and secure health tracking
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 700px) {
                    .login-responsive-placeholder {
                        display: none;
                    }
                }
                @media (max-width: 700px) {
                    div[style*="grid-template-columns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default Login;
