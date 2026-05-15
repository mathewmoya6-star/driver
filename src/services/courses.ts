import { supabase } from './supabase';
import type { Course, Lesson, PaginatedResponse } from '../types';

export const courseService = {
  async getCourses(params?: {
    category?: string;
    type?: 'free' | 'premium';
    level?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Course>> {
    let query = supabase
      .from('courses')
      .select('*, instructor:profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('is_published', true);
    
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    
    if (params?.type) {
      query = query.eq('type', params.type);
    }
    
    if (params?.level) {
      query = query.eq('level', params.level);
    }
    
    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to).order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) throw new Error(error.message);
    
    return {
      data: data as Course[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },
  
  async getCourseBySlug(slug: string): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructor:profiles(*)')
      .eq('slug', slug)
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Course not found');
    
    return data as Course;
  },
  
  async getCourseLessons(courseId: string, userId?: string): Promise<Lesson[]> {
    let query = supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_number', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    
    return data as Lesson[];
  },
  
  async getFeaturedCourses(limit: number = 6): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('enrolled_count', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(error.message);
    return data as Course[];
  },
  
  async getCourseStats(courseId: string): Promise<{
    totalLessons: number;
    totalDuration: number;
    averageRating: number;
    totalStudents: number;
  }> {
    const [lessonsResult, enrollmentsResult] = await Promise.all([
      supabase.from('lessons').select('video_duration', { count: 'exact' }).eq('course_id', courseId),
      supabase.from('enrollments').select('id', { count: 'exact' }).eq('course_id', courseId),
    ]);
    
    const totalDuration = lessonsResult.data?.reduce((sum, l) => sum + (l.video_duration || 0), 0) || 0;
    
    return {
      totalLessons: lessonsResult.count || 0,
      totalDuration,
      averageRating: 4.5, // TODO: Calculate from reviews
      totalStudents: enrollmentsResult.count || 0,
    };
  },
};
