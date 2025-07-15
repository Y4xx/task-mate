import axios from "../axios";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState('date');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'completed', 'pending'
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [toggleLoading, setToggleLoading] = useState(null);

    const navigate = useNavigate();

    const getTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/tasks");
            setTasks(response.data);
        } catch (err) {
            console.error("Error fetching tasks: ", err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTask = async (taskId) => {
        try {
            setToggleLoading(taskId);
            await axios.patch(`/tasks/${taskId}/toggle`);
            getTasks();
        } catch (err) {
            console.error("Error toggling task: ", err);
        } finally {
            setToggleLoading(null);
        }
    };

    const deleteTask = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                setDeleteLoading(taskId);
                await axios.delete(`/tasks/${taskId}`);
                getTasks();
            } catch (err) {
                console.error("Error deleting task: ", err);
            } finally {
                setDeleteLoading(null);
            }
        }
    };

    useEffect(() => {
        getTasks();
    }, []);

    const sortTasks = (tasks) => {
        switch (sortBy) {
            case 'status':
                return [...tasks].sort((a, b) => a.isCompleted - b.isCompleted);
            case 'public':
                return [...tasks].sort((a, b) => b.isPublic - a.isPublic);
            case 'title':
                return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
            default:
                return [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    };

    const filterTasks = (tasks) => {
        switch (filterBy) {
            case 'completed':
                return tasks.filter(task => task.isCompleted);
            case 'pending':
                return tasks.filter(task => !task.isCompleted);
            default:
                return tasks;
        }
    };

    const searchTasks = (tasks) => {
        return tasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const processedTasks = sortTasks(filterTasks(searchTasks(tasks)));

    const getTaskStats = () => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.isCompleted).length;
        const pending = total - completed;
        return { total, completed, pending };
    };

    const stats = getTaskStats();

    // Loading component
    const LoadingSpinner = () => (
        <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    // Empty state component
    const EmptyState = () => (
        <div className="text-center py-16">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first task.</p>
            <Link 
                to="/create-task"
                className="inline-flex items-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Task
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
                            <p className="text-gray-600 mt-1">Manage and track your personal tasks</p>
                        </div>
                        <Link 
                            to="/create-task"
                            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Task
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    {tasks.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Completed</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Pending</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <LoadingSpinner />
                ) : tasks.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Filters and Search */}
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Search */}
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

                                {/* Filter */}
                                <select 
                                    value={filterBy} 
                                    onChange={(e) => setFilterBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Tasks</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                </select>

                                {/* Sort */}
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="date">Sort by Date</option>
                                    <option value="title">Sort by Title</option>
                                    <option value="status">Sort by Status</option>
                                    <option value="public">Sort by Visibility</option>
                                </select>
                            </div>
                        </div>

                        {/* Tasks Grid */}
                        {processedTasks.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No tasks match your current filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {processedTasks.map((task) => (
                                    <div
                                        key={task._id}
                                        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
                                            task.isCompleted ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'
                                        }`}
                                    >
                                        <div className="p-6">
                                            {/* Task Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className={`text-lg font-semibold ${
                                                    task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                                                }`}>
                                                    {task.title}
                                                </h3>
                                                <div className="flex space-x-1">
                                                    {task.isPublic && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Public
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Task Description */}
                                            <p className={`text-sm mb-4 ${
                                                task.isCompleted ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {task.description}
                                            </p>

                                            {/* Status Badge */}
                                            <div className="mb-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    task.isCompleted 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {task.isCompleted == true ? (
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
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => navigate(`/edit-task/${task._id}`)}
                                                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                >
                                                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => toggleTask(task._id)}
                                                    disabled={toggleLoading === task._id}
                                                    className={`flex items-center px-3 py-1 text-sm text-white rounded-md transition-colors ${
                                                        task.isPublic 
                                                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                                                            : 'bg-green-600 hover:bg-green-700'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {toggleLoading === task._id ? (
                                                        <svg className="animate-spin mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    )}
                                                    {task.isPublic ? 'Mark private' : 'Mark public'}
                                                </button>

                                                <button
                                                    onClick={() => deleteTask(task._id)}
                                                    disabled={deleteLoading === task._id}
                                                    className="flex items-center px-3 py-1 text-sm bg-blue-800 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {deleteLoading === task._id ? (
                                                        <svg className="animate-spin mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyTasks;