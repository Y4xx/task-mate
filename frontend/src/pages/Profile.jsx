import { useEffect, useState } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userStats, setUserStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        publicTasks: 0
    });

    const navigate = useNavigate();

    const getProfile = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get("/auth/profile");
            setUser(res.data.user);
            setError("");
        } catch (err) {
            console.error("Not logged in");
            setError("Failed to load profile. Please login again.");
            navigate("/login");
        } finally {
            setIsLoading(false);
        }
    };

    const getUserStats = async () => {
        try {
            const res = await axios.get("/tasks");
            const tasks = res.data;
            
            setUserStats({
                totalTasks: tasks.length,
                completedTasks: tasks.filter(task => task.isCompleted).length,
                pendingTasks: tasks.filter(task => !task.isCompleted).length,
                publicTasks: tasks.filter(task => task.isPublic).length
            });
        } catch (err) {
            console.error("Failed to fetch user stats");
        }
    };

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await axios.post("/auth/logout");
            localStorage.removeItem("token");
            navigate("/login");
        } catch (err) {
            console.error("Logout failed");
            setError("Failed to logout. Please try again.");
        } finally {
            setIsLoggingOut(false);
            setShowLogoutModal(false);
        }
    };

    const confirmLogout = () => {
        setShowLogoutModal(true);
    };

    const getInitials = (firstname, lastname) => {
        return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
    };

    const formatJoinDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    useEffect(() => {
        getProfile();
        getUserStats();
    }, []);

    // Loading component
    const LoadingSpinner = () => (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
            </div>
        </div>
    );

    // Logout Confirmation Modal
    const LogoutModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                </div>
                <p className="text-gray-600 mb-6">Are you sure you want to logout? You'll need to sign in again to access your tasks.</p>
                <div className="flex gap-3">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex-1 bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoggingOut ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging out...
                            </div>
                        ) : (
                            "Yes, Logout"
                        )}
                    </button>
                    <button
                        onClick={() => setShowLogoutModal(false)}
                        disabled={isLoggingOut}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600">Failed to load profile</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your account settings and view your activity</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-blue-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <div className="flex items-center mb-6">
                                    <div className="h-20 w-20 bg-blue-800 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                                        {getInitials(user.fullname.firstname, user.fullname.lastname)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {user.fullname.firstname} {user.fullname.lastname}
                                        </h2>
                                        <p className="text-gray-600">{user.email}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Member since {formatJoinDate(user.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <p className="text-gray-900">{user.fullname.firstname}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <p className="text-gray-900">{user.fullname.lastname}</p>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <p className="text-gray-900">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <p className="text-gray-900 font-mono text-sm">{user._id}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats and Actions */}
                    <div className="space-y-6">
                        {/* Task Statistics */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Statistics</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                                <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-700">Total Tasks</span>
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">{userStats.totalTasks}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-green-100 rounded-lg mr-3">
                                                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-700">Completed</span>
                                        </div>
                                        <span className="text-lg font-semibold text-green-600">{userStats.completedTasks}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                                <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-700">Pending</span>
                                        </div>
                                        <span className="text-lg font-semibold text-yellow-600">{userStats.pendingTasks}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                                <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-700">Public</span>
                                        </div>
                                        <span className="text-lg font-semibold text-purple-600">{userStats.publicTasks}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/create-task')}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Create New Task
                                    </button>
                                    <button
                                        onClick={() => navigate('/my-tasks')}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                    >
                                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        View My Tasks
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Logout Section */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                                <button
                                    onClick={confirmLogout}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && <LogoutModal />}
        </div>
    );
};

export default Profile;