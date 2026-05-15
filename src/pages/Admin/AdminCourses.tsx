import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

interface Course {
    id: string;
    title: string;
    slug: string;
    type: 'free' | 'premium';
    price: number;
    is_published: boolean;
    enrolled_count: number;
    created_at: string;
}

const AdminCourses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error loading courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (courseId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('courses')
                .update({ is_published: !currentStatus })
                .eq('id', courseId);

            if (error) throw error;

            toast.success(`Course ${!currentStatus ? 'published' : 'unpublished'}`);
            loadCourses();
        } catch (error) {
            console.error('Error toggling publish:', error);
            toast.error('Failed to update course');
        }
    };

    const deleteCourse = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId);

            if (error) throw error;

            toast.success('Course deleted');
            loadCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error('Failed to delete course');
        }
    };

    return (
        <div className="admin-courses">
            <div className="admin-header">
                <div className="container">
                    <div className="header-actions">
                        <h1>
                            <i className="fas fa-book"></i>
                            Course Management
                        </h1>
                        <button 
                            className="btn btn-primary"
                            onClick={() => {
                                setEditingCourse(null);
                                setShowModal(true);
                            }}
                        >
                            <i className="fas fa-plus"></i>
                            Add Course
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : (
                    <div className="courses-grid admin-grid">
                        {courses.map(course => (
                            <div key={course.id} className="course-card">
                                <div className="course-header">
                                    <h3>{course.title}</h3>
                                    <span className={`course-type ${course.type}`}>
                                        {course.type === 'free' ? 'FREE' : `KES ${course.price}`}
                                    </span>
                                </div>
                                <div className="course-stats">
                                    <span>
                                        <i className="fas fa-users"></i>
                                        {course.enrolled_count} enrolled
                                    </span>
                                    <span>
                                        <i className="fas fa-calendar"></i>
                                        {new Date(course.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="course-actions">
                                    <button 
                                        className={`publish-btn ${course.is_published ? 'published' : 'draft'}`}
                                        onClick={() => togglePublish(course.id, course.is_published)}
                                    >
                                        <i className={`fas ${course.is_published ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                        {course.is_published ? 'Published' : 'Draft'}
                                    </button>
                                    <button 
                                        className="edit-btn"
                                        onClick={() => {
                                            setEditingCourse(course);
                                            setShowModal(true);
                                        }}
                                    >
                                        <i className="fas fa-edit"></i>
                                        Edit
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => deleteCourse(course.id)}
                                    >
                                        <i className="fas fa-trash"></i>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Course Modal */}
            {showModal && (
                <CourseModal 
                    course={editingCourse}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        loadCourses();
                    }}
                />
            )}
        </div>
    );
};

const CourseModal: React.FC<{ course: any; onClose: () => void; onSave: () => void }> = ({ 
    course, 
    onClose, 
    onSave 
}) => {
    const [formData, setFormData] = useState({
        title: course?.title || '',
        description: course?.description || '',
        type: course?.type || 'free',
        price: course?.price || 0,
        category: course?.category || '',
        duration: course?.duration || '',
        level: course?.level || 'beginner'
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const slug = formData.title.toLowerCase().replace(/ /g, '-');
            
            if (course) {
                // Update existing course
                const { error } = await supabase
                    .from('courses')
                    .update({ ...formData, slug })
                    .eq('id', course.id);

                if (error) throw error;
                toast.success('Course updated');
            } else {
                // Create new course
                const { error } = await supabase
                    .from('courses')
                    .insert([{ ...formData, slug }]);

                if (error) throw error;
                toast.success('Course created');
            }

            onSave();
        } catch (error) {
            console.error('Error saving course:', error);
            toast.error('Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal active">
            <div className="modal-content">
                <h2>{course ? 'Edit Course' : 'Add New Course'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'free' | 'premium' })}
                            >
                                <option value="free">Free</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                        {formData.type === 'premium' && (
                            <div className="form-group">
                                <label>Price (KES)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        )}
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Level</label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Duration (weeks)</label>
                        <input
                            type="text"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Course'}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCourses;
