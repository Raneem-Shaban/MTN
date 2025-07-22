import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
// import axios from '../../utils/axiosConfig';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/constants';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';


export default function Login() {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
            const response = await axios.post(`${API_BASE_URL}/api/login`, {
                email,
                password
            }, {
                withCredentials: true,
            });

            const { token, user } = response.data;
            console.log("Login response:", response.data);
            localStorage.setItem('token', token);

            dispatch(login({
                id: user.id,
                name: user.name,
                email: user.email,
                role_id: user.role_id || null,
                role_name: user.position || '',
                token: token
            }));
            console.log("User logged in with token:", token);

            toast.success("Login successful!");
            navigate('/');

        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An error occurred while logging in.");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-primary)]">
            <div className='w-full max-w-6xl mx-auto rounded-lg overflow-hidden '>
                <div className="flex flex-col min-h-[80vh] md:flex-row bg-white m-8">
                    {/* Left Section */}
                    <div className="md:w-1/4 flex flex-col items-center justify-center bg-[var(--color-surface)] p-8 shadow-md">
                        <h1 className="text-3xl font-semibold text-gray-800 mb-2">Welcome to</h1>
                        <h2 className="text-4xl font-bold text-[var(--color-primary)] mb-6">Train Track</h2>
                        <img
                            src="/assets/img/mtn-logo.svg"
                            alt="MTN Logo"
                            className="w-30 h-32 object-contain shadow-lg"
                        />
                    </div>

                    {/* Right Section */}
                    <div className="flex-1 flex items-center justify-center bg-white p-6">
                        <div className="w-full max-w-md">
                            <h2 className="text-2xl font-semibold text-start mb-6">Sign in</h2>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    <div className="text-right mt-1">
                                        <Link to="/forgot-password" className="text-sm text-gray-500 hover:underline">
                                            Forgot Password
                                        </Link>
                                    </div>
                                </div>



                                {error && (
                                    <div className="text-red-500 text-sm">{error}</div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 bg-[var(--color-secondary)] text-white rounded-md hover:bg-[var(--color-secondary-hover)] transition-colors"
                                >
                                    Sign in
                                </button>
                            </form>


                            <div className="mt-4 text-center">
                                <a href="#" className="text-sm text-gray-600 hover:underline">
                                    Browse as a guest
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
