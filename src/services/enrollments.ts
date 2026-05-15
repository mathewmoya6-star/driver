import { supabase } from './supabase';
import type { Enrollment, LessonProgress } from '../types';

export const enrollmentService = {
  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, course:courses(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data as Enrollment[];
  },
  
  async enrollInCourse(userId: string, courseId: string, paymentId?: string): Promise<Enrollment> {
    const { data, error } = await supabase
      .from('enrollments')
      .insert([{
        user_id: userId,
        course_id: courseId,
        status: 'active',
      }])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    // Update course enrolled count
    await supabase.rpc('increment_course_enrollments', { course_id: courseId });
    
    return data as Enrollment;
  },
  
  async getLessonProgress(enrollmentId: string): Promise<LessonProgress[]> {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*, lesson:lessons(*)')
      .eq('enrollment_id', enrollmentId);
    
    if (error) throw new Error(error.message);
    return data as LessonProgress[];
  },
  
  async markLessonComplete(enrollmentId: string, lessonId: string, quizScore?: number): Promise<void> {
    const { error } = await supabase
      .from('lesson_progress')
      .upsert({
        enrollment_id: enrollmentId,
        lesson_id: lessonId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        quiz_score: quizScore,
      });
    
    if (error) throw new Error(error.message);
    
    // Update overall course progress
    await this.updateCourseProgress(enrollmentId);
  },
  
  async updateCourseProgress(enrollmentId: string): Promise<void> {
    const { data: totalLessons } = await supabase
      .from('lessons')
      .select('id', { count: 'exact' })
      .eq('course_id', 
        (await supabase.from('enrollments').select('course_id').eq('id', enrollmentId).single()).data?.course_id
      );
    
    const { data: completedLessons } = await supabase
      .from('lesson_progress')
      .select('id', { count: 'exact' })
      .eq('enrollment_id', enrollmentId)
      .eq('is_completed', true);
    
    const progress = totalLessons?.count 
      ? Math.round((completedLessons?.count || 0) / totalLessons.count * 100)
      : 0;
    
    const { error } = await supabase
      .from('enrollments')
      .update({ progress })
      .eq('id', enrollmentId);
    
    if (error) throw new Error(error.message);
    
    // If course is completed, generate certificate
    if (progress === 100) {
      await this.generateCertificate(enrollmentId);
    }
  },
  
  async generateCertificate(enrollmentId: string): Promise<void> {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('user_id, course_id')
      .eq('id', enrollmentId)
      .single();
    
    if (!enrollment) return;
    
    const certificateNumber = `MD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const verificationCode = Math.random().toString(36).substr(2, 16).toUpperCase();
    
    const { error } = await supabase
      .from('certificates')
      .insert([{
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        certificate_number: certificateNumber,
        verification_code: verificationCode,
        issued_at: new Date().toISOString(),
      }]);
    
    if (error) throw new Error(error.message);
  },
  
  async getCertificate(courseId: string, userId: string) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },
};
