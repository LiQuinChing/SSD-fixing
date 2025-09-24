import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { message } from "antd";

const RAW_BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
const BASE_URL = (RAW_BASE || '').replace(/\/$/, '');

const userSignup = () => {
    const { login } = useAuth();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);


    const registerUser = async (values) => {
        if (values.password !== values.passwordConfirm) {
            return setError("Passwords are not the same");
        }

        try {
            setError(null);
            setLoading(true);
            const response = await fetch(`${BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();
            if (response.status === 201) {
                message.success(data.message);
                if (login) {
                    login(data.token, data.user)
                }
            } else if (response.status === 400) {
                setError(data.message || "Registration failed due to invalid data");
            } else {
                message.error('Registration Failed');
            }

        } catch (error) {
            message.error("Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, registerUser };
};

export default userSignup;