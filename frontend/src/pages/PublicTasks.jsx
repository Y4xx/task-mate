import { useEffect, useState } from "react";
import axios from "../axios";

const PublicTasks = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBy, setFilterBy] = useState("all"); // 'all', 'completed', 'pending'

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoadingUsers(true);
                const res = await axios.get("/tasks/public");
                setUsers(res.data);
                setError("");
            } catch (err) {
                console.error("Error fetching users:", err);
                setError(err.response?.data?.message || "Failed to fetch users");
            } finally {
                setIsLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    const fetchTasks = async (userId) => {
        try {
            setIsLoadingTasks(true);
            const res = await axios.get(`/tasks/public/${userId}`);
            setTasks(res.data);
            setSelectedUser(userId);
            setError("");
        } catch (err) {
            console.error("Error fetching tasks:", err);
            setError(err.response?.data?.message || "Failed to fetch tasks");
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const getSelectedUserName = () => {
        const user = users.find(u => u._id === selectedUser);
        return user ? `${user.fullname.firstname} ${user.fullname.lastname}` : "";
    };

    const filteblueTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterBy === "all" || 
                             (filterBy === "completed" && task.isCompleted) ||
                             (filterBy === "pending" && !task.isCompleted);
        
        return matchesSearch && matchesFilter;
    });

    const getTaskStats = (tasks) => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.isCompleted).length;
        const pending = total - completed;
        return { total, completed, pending };
    };

    const stats = getTaskStats(tasks);

    // Loading component
    const LoadingSpinner = ({ size = "md" }) => (
        <div className="flex justify-center items-center py-8">
            <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${
                size === "sm" ? "h-8 w-8" : "h-12 w-12"
            }`}></div>
        </div>
    );

    // Error component
    const ErrorMessage = ({ message }) => (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-blue-700 text-sm">{message}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Public Tasks</h1>
                    <p className="text-gray-600">Explore tasks shablue by other users</p>
                </div>

                {/* Error Message */}
                {error && <ErrorMessage message={error} />}

                {/* Users Section */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a User</h2>
                        
                        {isLoadingUsers ? (
                            <LoadingSpinner size="sm" />
                        ) : users.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-gray-500">No users with public tasks found</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {users.map((user) => (
                                    <button
                                        key={user._id}
                                        onClick={() => fetchTasks(user._id)}
                                        className={`px-4 py-2 rounded-md transition-colors font-medium ${
                                            selectedUser === user._id
                                                ? "bg-blue-800 text-white shadow-md"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {user.fullname.firstname} {user.fullname.lastname}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tasks Section */}
                {selectedUser && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6">
                            {/* Tasks Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {getSelectedUserName()}'s Public Tasks
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {stats.total} total tasks
                                    </p>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            {tasks.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-blue-600">Total</p>
                                                <p className="text-xl font-semibold text-blue-900">{stats.total}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-green-600">Completed</p>
                                                <p className="text-xl font-semibold text-green-900">{stats.completed}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-yellow-100 rounded-lg">
                                                <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-yellow-600">Pending</p>
                                                <p className="text-xl font-semibold text-yellow-900">{stats.pending}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Search and Filter */}
                            {tasks.length > 0 && (
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <input
                                                type="text"
                                                placeholder="Search tasks..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <select 
                                        value={filterBy} 
                                        onChange={(e) => setFilterBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Tasks</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            )}

                            {/* Tasks Grid */}
                            {isLoadingTasks ? (
                                <LoadingSpinner />
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="text-gray-500 text-lg">No public tasks available</p>
                                    <p className="text-gray-400 text-sm mt-1">This user hasn't shablue any tasks yet</p>
                                </div>
                            ) : filteblueTasks.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No tasks match your current filters</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteblueTasks.map((task, index) => (
                                        <div 
                                            key={task._id || index}
                                            className={`bg-gray-50 rounded-lg p-6 border-l-4 hover:shadow-md transition-shadow duration-300 ${
                                                task.isCompleted ? 'border-green-500' : 'border-yellow-500'
                                            }`}
                                        >
                                            <div className="mb-4">
                                                <h3 className={`text-lg font-semibold mb-2 ${
                                                    task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                                                }`}>
                                                    {task.title}
                                                </h3>
                                                <p className={`text-sm ${
                                                    task.isCompleted ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                    {task.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    task.isCompleted 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {task.isCompleted ? (
                                                        <>
                                                            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Completed
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Pending
                                                        </>
                                                    )}
                                                </span>

                                                <div className="flex items-center text-xs text-gray-500">
                                                    <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Public
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicTasks;