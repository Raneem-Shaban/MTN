// src/pages/users/UserDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/constants';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaBuilding, FaUserTie, FaTasks, FaStar, FaFileAlt } from 'react-icons/fa';

const UserDetails = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(res.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch user details');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId, navigate]);

    if (loading)
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="loader"></div>
            </div>
        );
    if (!user) return null;

    const Card = ({ title, children }) => (
        <div className="bg-[var(--color-white)] rounded-xl shadow-md p-4 sm:p-6 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-3 lg:space-y-4 border-[var(--color-border)] w-full overflow-hidden">
            <h3 className="text-lg sm:text-xl md:text-lg lg:text-xl font-bold text-[var(--color-primary)] mb-2">{title}</h3>
            {children}
        </div>
    );

    const InfoItem = ({ icon: Icon, label, value }) => (
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Icon className="text-[var(--color-text-accent)] min-w-[20px] md:min-w-[22px]" />
            <p className="text-xs sm:text-sm md:text-base break-words">
                <span className="font-semibold">{label}:</span> <span className="text-[var(--color-text-main)]">{value || '-'}</span>
            </p>
        </div>
    );

    const Avatar = ({ url, alt }) =>
        url ? (
            <img src={url} alt={alt} className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full object-cover border-[var(--color-border)]" />
        ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-[var(--color-light-gray)] flex items-center justify-center text-[var(--color-text-muted)]">
                <FaUser size={20} />
            </div>
        );

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-5 lg:p-6 my-20 max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl font-bold text-[var(--color-text-main)] mb-6">
                User Details: {user.name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-6 lg:gap-6">
                {/* Basic Info */}
                <Card title="Basic Info">
                    <InfoItem icon={FaUser} label="Name" value={user.name} />
                    <InfoItem icon={FaEnvelope} label="Email" value={user.email} />
                    <InfoItem icon={FaUserTie} label="Position" value={user.position} />
                    <InfoItem icon={FaUserTie} label="Role" value={user.role?.name || 'Unknown'} />
                    <InfoItem icon={FaUserTie} label="Status" value={user.status === 1 ? 'Active' : 'Blocked'} />
                    <InfoItem icon={FaUserTie} label="Email Verified" value={user.email_verified_at ? 'Yes' : 'No'} />
                </Card>

                {/* Section & Delegation */}
                <Card title="Section & Delegation">
                    <InfoItem icon={FaBuilding} label="Section" value={user.section?.name || 'Unknown'} />
                    <InfoItem icon={FaBuilding} label="Division" value={user.section?.division || 'Unknown'} />
                    <InfoItem icon={FaBuilding} label="Delegation" value={user.delegation?.name || 'None'} />
                </Card>

                {/* Tasks */}
                <Card title="Tasks">
                    <InfoItem icon={FaTasks} label="Owned Tasks" value={user.owned_tasks?.length || 0} />
                    <InfoItem icon={FaTasks} label="Delegated Tasks" value={user.delegated_tasks?.length || 0} />
                </Card>

                {/* Ratings */}
                <Card title="Ratings">
                    {user.ratings && user.ratings.length > 0 ? (
                        <div className="grid gap-4 grid-cols-1 mt-4">
                            {user.ratings.map((rate) => (
                                <div
                                    key={rate.id}
                                    className="bg-[var(--color-white)] rounded-2xl shadow-sm hover:shadow-md transition p-4 flex flex-col border border-[var(--color-border)] w-full overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 mb-2 min-w-0">
                                        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-secondary)] font-bold text-lg overflow-hidden">
                                            {rate.user_id?.toString().charAt(0) || "U"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1 mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={`text-sm md:text-base ${i < rate.score ? "text-yellow-400" : "text-gray-300"}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs md:text-sm text-[var(--color-text-muted)] truncate block">
                                                {rate.user?.name || `User #${rate.user_id}`} • {new Date(rate.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-[var(--color-text-main)] text-sm md:text-base bg-[var(--color-surface)] rounded-xl p-3 italic mt-1 flex-1 break-words whitespace-pre-wrap">
                                        “{rate.feedback_text || "No feedback provided"}”
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--color-text-muted)] text-xs sm:text-sm md:text-base">No ratings available</p>
                    )}
                </Card>

                {/* Inquiries */}
                <Card title="Inquiries">
                    {user.inquiries?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                            {user.inquiries.map((inq) => (
                                <div
                                    key={inq.id}
                                    className="bg-[var(--color-white)] rounded-xl shadow-sm hover:shadow-md transition p-5 border border-[var(--color-border)] w-full overflow-hidden"
                                >
                                    <p className="font-semibold text-[var(--color-primary)] mb-2 text-sm sm:text-base">
                                        {inq.title}
                                    </p>
                                    <p className="text-[var(--color-text-main)] text-xs sm:text-sm md:text-base mb-2 whitespace-pre-wrap break-words">
                                        Response: <span className="italic">{inq.response || 'No response yet'}</span>
                                    </p>
                                    <p className="text-[var(--color-text-muted)] text-xs sm:text-sm">
                                        Status ID: <span className="font-medium">{inq.cur_status_id}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--color-text-muted)] text-xs sm:text-sm md:text-base">No inquiries available</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default UserDetails;
