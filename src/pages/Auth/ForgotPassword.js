import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/constants';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/forget_password`, { email });

            if (response.data.status === 200) {
                toast.success('Verification code sent successfully');
                navigate('/verify-code', { state: { email } });
            } else {
                toast.error(response.data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        }

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-primary)]">
            <div className='w-full max-w-6xl mx-auto rounded-lg overflow-hidden '>
                <div className="flex flex-col min-h-[80vh] md:flex-row bg-white m-8">
                    <div className="md:w-1/4 flex flex-col items-center justify-center bg-[var(--color-surface)] p-8 shadow-md">
                        <h1 className="text-3xl font-semibold text-gray-800 mb-2">Train Track</h1>
                        <img
                            src="/assets/img/mtn-logo.svg"
                            alt="MTN Logo"
                            className="w-30 h-32 object-contain shadow-lg"
                        />
                    </div>

                    <div className="flex-1 flex items-center justify-center bg-white p-6">
                        <div className="w-full max-w-md">
                            <h2 className="text-2xl font-semibold mb-6">Forgot Password</h2>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 bg-[var(--color-secondary)] text-white rounded-md hover:bg-[var(--color-secondary-hover)] transition-colors"
                                >
                                    Send Reset Link
                                </button>
                            </form>

                            <div className="mt-4 text-center">
                                <a href="/login" className="text-sm text-gray-600 hover:underline">
                                    Back to login
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
