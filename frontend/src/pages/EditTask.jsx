import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axios";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";


function EditTask() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        isCompleted: false,
        isPublic: false
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch task data on mount
    useEffect(() => {
        const fetchTask = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`/tasks/${id}`);
                
                if (res.data.task) {
                    setFormData(res.data.task);
                } else if (res.data) {
                    // Handle different response structures
                    setFormData(res.data);
                }
                setError("");
            } catch (err) {
                console.error("Error fetching task:", err);
                if (err.response?.status === 404) {
                    setError("Task not found");
                } else if (err.response?.status === 403) {
                    setError("You don't have permission to edit this task");
                } else {
                    setError(err.response?.data?.message || "Failed to load task");
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchTask();
        }
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        // Clear validation errors when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
        if (error) setError("");
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.title.trim()) {
            errors.title = "Title is required";
        } else if (formData.title.length > 100) {
            errors.title = "Title must be less than 100 characters";
        }

        if (!formData.description.trim()) {
            errors.description = "Description is required";
        } else if (formData.description.length > 500) {
            errors.description = "Description must be less than 500 characters";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        setError("");

        try {
            await axios.put(`/tasks/${id}`, {
                title: formData.title.trim(),
                description: formData.description.trim(),
                isCompleted: formData.isCompleted,
                isPublic: formData.isPublic
            });

            setShowSuccess(true);
            
            // Navigate after showing success message
            setTimeout(() => {
                navigate("/my-tasks");
            }, 1500);
        } catch (err) {
            console.error("Error updating task:", err);
            setError(err.response?.data?.message || "Failed to update task. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate("/my-tasks");
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading task...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !formData.title) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <svg className="mx-auto h-16 w-16 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={handleCancel}
                            className="bg-blue-800 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="mb-4">
                            <svg className="mx-auto h-16 w-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Task Updated!</h2>
                        <p className="text-gray-600">Redirecting to your tasks...</p>
                    </div>
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Task</h1>
                    <p className="text-gray-600">Make changes to your task</p>
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
                                <p className="text-blue-700 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Title Field */}
                    <div className="mb-6">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Task Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                                validationErrors.title
                                    ? 'border-blue-300 focus:ring-blue-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Enter task title"
                            disabled={isSubmitting}
                        />
                        {validationErrors.title && (
                            <p className="mt-1 text-sm text-blue-600">{validationErrors.title}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.title.length}/100 characters
                        </p>
                    </div>

                    {/* Description Field */}
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-vertical ${
                                validationErrors.description
                                    ? 'border-blue-300 focus:ring-blue-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Describe your task"
                            disabled={isSubmitting}
                        />
                        {validationErrors.description && (
                            <p className="mt-1 text-sm text-blue-600">{validationErrors.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.description.length}/500 characters
                        </p>
                    </div>

                    {/* Status Toggle */}
                    <div className="mb-6">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isCompleted"
                                name="isCompleted"
                                checked={formData.isCompleted}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="isCompleted" className="ml-3 block text-sm text-gray-700">
                                Mark as completed
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-7">
                            Check this box if you've completed this task
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
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isSubmitting}
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
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-800 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </div>
                            ) : (
                                "Update Task"
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTask;