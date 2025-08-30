import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/constants';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { isAuthenticated } = useSelector(state => state.auth);

    
    useEffect(() => {
        if (isAuthenticated) navigate('/home');
    }, [isAuthenticated, navigate]);

    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (isLoading) return;

        if (!email || !password) {
            toast.error("Please enter both email and password.");
            return;
        }

        if (!validateEmail(email)) {
            toast.error("Invalid email format.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/login`,
                { email, password },
                {
                    withCredentials: true,
                    validateStatus: (status) => status < 500
                }
            );

            if (response.status >= 200 && response.status < 300) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);

                dispatch(login({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id || null,
                    role_name: user.position || '',
                    token: token
                }));

                toast.success("Login successful!");
                navigate('/home');
            } else {
                toast.error(response.data?.message || "Authentication failed");
            }

        } catch (error) {
            console.error("Login error:", error);
            if (error.response) {
                const { status, data } = error.response;
                if (status === 401) {
                    toast.error("Invalid credentials");
                } else {
                    toast.error(data.message || `Server error (${status})`);
                }
            } else if (error.request) {
                toast.error("No response from server");
            } else {
                toast.error("Request setup error");
            }
        } finally {
            setIsLoading(false);
        }
    }, [email, password, isLoading, dispatch, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-primary)]">
            <div className='w-full max-w-6xl mx-auto rounded-lg overflow-hidden'>
                <div className="flex flex-col min-h-[80vh] md:flex-row bg-[var(--color-bg)] m-8">
                    <div className="md:w-1/4 flex flex-col items-center justify-center bg-[var(--color-surface)] p-8 shadow-md">
                        <h1 className="text-3xl font-semibold text-[var(--color-text-main)] mb-2">Welcome to</h1>
                        <h2 className="text-4xl font-bold text-[var(--color-primary)] mb-6">Train Track</h2>
                        <img
                            src="/assets/img/mtn-logo.svg"
                            alt="MTN Logo"
                            className="w-30 h-32 object-contain shadow-lg"
                        />
                    </div>

                    <div className="flex-1 flex items-center justify-center bg-[var(--color-bg)] p-6">
                        <div className="w-full max-w-md">
                            <h2 className="text-2xl font-semibold text-[var(--color-text-main)] text-start mb-6">Sign in</h2>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-main)]">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-main)]">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="mt-1 block w-full px-4 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] pr-10"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => !prev)}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--color-text-accent)] hover:text-[var(--color-text-main)] focus:outline-none"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    <div className="text-right mt-1">
                                        <Link to="/forgot-password" className="text-sm text-[var(--color-text-accent)] hover:underline">
                                            Forgot Password
                                        </Link>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-2 px-4 bg-[var(--color-secondary)] text-[var(--color-white)] rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--color-secondary-hover)]'}`}
                                >
                                    {isLoading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </form>

                            <div className="mt-4 text-center">
                                <button onClick={() => navigate('/guest-inquiries')} type="button" className="text-sm text-[var(--color-text-accent)] hover:underline">
                                    Browse as a guest
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}