import { useState } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";


const CreateTask = () => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        isPublic: false
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? e.target.checked : value
        }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError("Title is requiblue");
            return false;
        }
        if (!formData.description.trim()) {
            setError("Description is requiblue");
            return false;
        }
        if (formData.title.length > 100) {
            setError("Title must be less than 100 characters");
            return false;
        }
        if (formData.description.length > 500) {
            setError("Description must be less than 500 characters");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError("");

        try {
            await axios.post("/tasks", formData);
            setShowSuccess(true);

            // Navigate after showing success message
            setTimeout(() => {
                navigate("/my-tasks");
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create task. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/my-tasks");
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Task Created!</h2>
                    <p className="text-gray-600">blueirecting to your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <Link to="/my-tasks" className="flex space-x-2 items-center mb-4">
                    <ArrowLeft className="size-5 text-blue-800" />
                    <span className="text-blue-800">Back</span>
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Task</h1>
                    <p className="text-gray-600">Add a new task to your task manager</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Title Field */}
                    <div className="mb-6">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Task Title
                            <span className="text-red-500"> *</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter task title (e.g., Go to gym)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.title.length}/100 characters
                        </p>
                    </div>

                    {/* Description Field */}
                    <div className="mb-6 ">
                        <span className="flex space-x-1">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <span className="text-red-500"> *</span>
                        </span>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe your task in detail (e.g., Go to gym and workout for 2 hours focusing on cardio and strength training)"
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.description.length}/500 characters
                        </p>
                    </div>

                    {/* Public Toggle */}
                    <div className="mb-8">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isPublic"
                                name="isPublic"
                                checked={formData.isPublic}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-800 focus:ring-blue-800 border-gray-300 rounded"
                                disabled={isLoading}
                            />
                            <label htmlFor="isPublic" className="ml-3 block text-sm text-gray-700">
                                Make this task public
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-7">
                            Public tasks can be viewed by other users
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-blue-800 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </div>
                            ) : (
                                "Create Task"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTask;