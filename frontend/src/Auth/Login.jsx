import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Flex, Form, Input, Spin, Typography } from "antd";
import loginImage from "../assets/login.jpg";
import userLogin from "../hooks/userLogin";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); //get login() from context
  const { error, loading, loginUser } = userLogin();
  const [googleError, setGoogleError] = useState("");

  const handleLogin = async (values) => {
    await loginUser(values);
  };

  const handleGoogleSuccess = async (credential) => {
    const base = import.meta.env.VITE_API_BASE || "http://localhost:5555/api";
    try {
      setGoogleError(""); // Clear any previous errors
      console.log("Sending credential to backend:", credential);

      const resp = await fetch(`${base}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      console.log("Response status:", resp.status);

      // const data = await resp.json();
      if (!resp.ok) {
        // console.error("Google auth failed:", data?.message || resp.status);
        // return;
        const errorText = await resp.text();
        console.error(
          "Google auth failed with status:",
          resp.status,
          errorText
        );

        let errorMessage = "Google authentication failed";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If not JSON, use the text as error message
          errorMessage = errorText || errorMessage;
        }

        setGoogleError(errorMessage);
        return;
      }
      const data = await resp.json();
      console.log("Google auth successful:", data);

      // Save authentication data
      if (data?.token && data?.user) {
        authLogin(data.token, data.user);
        // optional: if you keep your old keys too, keep them in sync:
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // ✅ navigate after state is set
        navigate(data.user.role === "admin" ? "/AdminDashboard" : "/profile");
      } else {
        setGoogleError("No authentication token received");
      }
    } catch (error) {
      console.error("Google auth error:", error);
      setGoogleError(`Authentication failed: ${error.message}`);
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google Login Component Error:", error);
    setGoogleError("Google login failed. Please try again.");
  };

  return (
    <div className="px-44 py-16">
      <Card className="form-container">
        <Flex gap="large" align="center">
          {/* Image */}
          <Flex flex={1}>
            <img src={loginImage} alt="Login" className="auth-image" />
          </Flex>
          {/* form */}
          <Flex vertical flex={1}>
            <Typography.Title level={3} strong className="title">
              Sign In
            </Typography.Title>
            <Typography.Text type="secondary" className="slogan">
              Unlock you world!
            </Typography.Text>

            {/* NEW: Google button */}
            <div style={{ marginBottom: 16 }}>
              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </div>

            <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please enter your Email!",
                  },
                  {
                    type: "email",
                    message: "The input is not a valid email!",
                  },
                ]}
              >
                <Input size="large" placeholder="Enter your email" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please enter your Password!",
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your password"
                />
              </Form.Item>
              {error && (
                <Alert
                  description={error}
                  type="error"
                  showIcon
                  closable
                  className="alert"
                />
              )}
              <Form.Item>
                <Button
                  type={`${loading ? "" : "primary"}`}
                  htmlType="submit"
                  size="large"
                  className="btn bg-blue-500"
                >
                  {loading ? <Spin /> : "Sign In"}
                </Button>
              </Form.Item>
              <Form.Item>
                <Link to="/signup">
                  <Button size="large" className="btn">
                    Create an account
                  </Button>
                </Link>
              </Form.Item>
            </Form>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};

export default Login;
