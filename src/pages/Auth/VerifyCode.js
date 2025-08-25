import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/constants';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export default function VerifyCode() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';
    const [codeArray, setCodeArray] = useState(['', '', '', '', '']);
    const inputRefs = useRef([]);

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!combinedCode || combinedCode.length < 5) {
            toast.error('Please enter the full code');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/check_forget_code`, {
                email,
                code: combinedCode
            });

            if (response.data.status === 200) {
                toast.success('Code verified successfully');
                navigate('/reset-password', {
                    state: {
                        email,
                        code: combinedCode
                    }
                });
            } else {
                toast.error(response.data.message || 'Invalid code');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        }
    };

    const handleInputChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return; 

        const updated = [...codeArray];
        updated[index] = value;
        setCodeArray(updated);

        if (value && index < codeArray.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !codeArray[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const combinedCode = codeArray.join('');

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
                            <h2 className="text-2xl font-semibold mb-6">Enter Verification Code</h2>
                            <form className="space-y-4" onSubmit={handleVerify}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                                    <div className="flex gap-2">
                                        {codeArray.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                type="text"
                                                value={digit}
                                                onChange={(e) => handleInputChange(idx, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                                maxLength={1}
                                                ref={(el) => inputRefs.current[idx] = el}
                                                className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onPaste={(e) => {
                                                    if (idx !== 0) return; 

                                                    const paste = e.clipboardData.getData('text');
                                                    if (!/^\d+$/.test(paste)) return;

                                                    const digits = paste.slice(0, codeArray.length).split('');
                                                    const updated = [...codeArray];
                                                    digits.forEach((d, i) => {
                                                        updated[i] = d;
                                                    });
                                                    setCodeArray(updated);

                                                    const lastIndex = digits.length >= codeArray.length ? codeArray.length - 1 : digits.length;
                                                    setTimeout(() => {
                                                        inputRefs.current[lastIndex]?.focus();
                                                    }, 0);
                                                }}
                                            />
                                        ))}

                                    </div>
                                </div>


                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 bg-[var(--color-secondary)] text-white rounded-md hover:bg-[var(--color-secondary-hover)] transition-colors"
                                >
                                    Verify Code
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
