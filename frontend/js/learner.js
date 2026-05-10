// Complete unit-lesson-quiz system
class LearnerManager {
    constructor() {
        this.currentUnit = null;
        this.currentLesson = null;
        this.currentQuiz = null;
        this.quizAnswers = [];
    }
    
    async loadUnits() {
        const supabase = await window.getSupabase();
        
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('units')
                    .select('*, lessons(*)')
                    .order('order_number');
                
                if (data) {
                    window.appState.setState('allContent', {
                        ...window.appState.getState('allContent'),
                        units: data
                    });
                    return;
                }
            } catch (e) {}
        }
        
        // Fallback to local data
        this.loadLocalUnits();
    }
    
    loadLocalUnits() {
        const localUnits = [
            { id: 1, title: "Introduction to Driving in Kenya", description: "Licensing categories, NTSA roles", order_number: 1, lessons: [
                { id: 101, title: "NTSA Overview", content: "The National Transport and Safety Authority...", duration: "10 min", type: "lesson" },
                { id: 102, title: "Driver Licensing Categories", content: "Different classes of licenses in Kenya...", duration: "15 min", type: "lesson" },
                { id: 103, title: "Unit 1 Quiz", content: "Test your knowledge", duration: "5 min", type: "quiz", questions: [/* quiz questions */] }
            ]},
            { id: 2, title: "The Highway Code & Traffic Signs", description: "Regulatory, warning signs, road markings", order_number: 2, lessons: [] }
        ];
        
        window.appState.setState('allContent', {
            ...window.appState.getState('allContent'),
            units: localUnits
        });
    }
    
    openUnit(unitId) {
        const units = window.appState.getState('allContent').units;
        this.currentUnit = units.find(u => u.id === unitId);
        window.appState.setState('currentUnit', this.currentUnit);
        this.renderUnitPage();
    }
    
    renderUnitPage() {
        const container = document.getElementById('unitViewContainer');
        if (!container || !this.currentUnit) return;
        
        const progress = this.getUnitProgress(this.currentUnit.id);
        
        container.innerHTML = `
            <div class="unit-header">
                <button class="back-btn" onclick="window.learnerManager.backToModules()"><i class="fas fa-arrow-left"></i> Back to Units</button>
                <h1>${this.currentUnit.title}</h1>
                <p>${this.currentUnit.description}</p>
                <div class="unit-progress">Overall Progress: ${progress.completed}/${progress.total} lessons</div>
            </div>
            <div class="lessons-list">
                ${this.currentUnit.lessons.map(lesson => `
                    <div class="lesson-card ${this.isLessonCompleted(this.currentUnit.id, lesson.id) ? 'completed' : ''}" 
                         onclick="window.learnerManager.openLesson(${lesson.id})">
                        <div class="lesson-icon">
                            <i class="fas fa-${lesson.type === 'quiz' ? 'question-circle' : 'book-open'}"></i>
                        </div>
                        <div class="lesson-info">
                            <h3>${lesson.title}</h3>
                            <p>${lesson.duration} • ${lesson.type === 'quiz' ? 'Quiz' : 'Lesson'}</p>
                        </div>
                        <div class="lesson-status">
                            ${this.isLessonCompleted(this.currentUnit.id, lesson.id) ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-arrow-right"></i>'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        window.appState.setState('currentPage', 'unit');
        document.getElementById('unitView').style.display = 'block';
        document.getElementById('learnerView').style.display = 'none';
    }
    
    openLesson(lessonId) {
        this.currentLesson = this.currentUnit.lessons.find(l => l.id === lessonId);
        
        if (this.currentLesson.type === 'quiz') {
            this.startQuiz();
        } else {
            this.renderLesson();
        }
    }
    
    renderLesson() {
        const container = document.getElementById('lessonViewContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="lesson-header">
                <button class="back-btn" onclick="window.learnerManager.backToUnit()"><i class="fas fa-arrow-left"></i> Back to Unit</button>
                <h1>${this.currentLesson.title}</h1>
            </div>
            <div class="lesson-content">
                <div class="content-text">
                    ${this.currentLesson.content || '<p>Content loading...</p>'}
                </div>
                <div class="lesson-navigation">
                    <button class="btn" onclick="window.learnerManager.markLessonComplete()">Mark as Complete</button>
                </div>
            </div>
        `;
        
        document.getElementById('lessonView').style.display = 'block';
        document.getElementById('unitView').style.display = 'none';
    }
    
    startQuiz() {
        const questions = this.currentLesson.questions || this.getDefaultQuizQuestions();
        this.quizAnswers = new Array(questions.length).fill(null);
        this.renderQuiz(questions);
    }
    
    renderQuiz(questions) {
        const container = document.getElementById('quizViewContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="quiz-header">
                <button class="back-btn" onclick="window.learnerManager.backToUnit()"><i class="fas fa-arrow-left"></i> Back to Unit</button>
                <h1>${this.currentLesson.title}</h1>
            </div>
            <div class="quiz-questions">
                ${questions.map((q, idx) => `
                    <div class="quiz-question-card">
                        <div class="question-number">Question ${idx + 1}</div>
                        <div class="question-text">${q.text}</div>
                        <div class="question-options">
                            ${q.options.map((opt, optIdx) => `
                                <div class="quiz-option ${this.quizAnswers[idx] === optIdx ? 'selected' : ''}" 
                                     onclick="window.learnerManager.answerQuizQuestion(${idx}, ${optIdx})">
                                    ${String.fromCharCode(65 + optIdx)}. ${opt}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="quiz-actions">
                <button class="btn" onclick="window.learnerManager.submitQuiz()">Submit Quiz</button>
            </div>
        `;
        
        document.getElementById('quizView').style.display = 'block';
        document.getElementById('unitView').style.display = 'none';
        document.getElementById('lessonView').style.display = 'none';
    }
    
    answerQuizQuestion(questionIndex, optionIndex) {
        this.quizAnswers[questionIndex] = optionIndex;
        this.renderQuiz(this.currentLesson.questions);
    }
    
    async submitQuiz() {
        const questions = this.currentLesson.questions;
        let correct = 0;
        
        this.quizAnswers.forEach((answer, idx) => {
            if (answer === questions[idx].correct) correct++;
        });
        
        const score = (correct / questions.length) * 100;
        const passed = score >= 70;
        
        // Mark lesson as completed
        await this.markLessonComplete(true);
        
        // Save quiz result
        const progress = window.appState.getState('userProgress');
        if (!progress.quizHistory) progress.quizHistory = [];
        progress.quizHistory.push({
            lessonId: this.currentLesson.id,
            unitId: this.currentUnit.id,
            score: score,
            passed: passed,
            date: new Date().toISOString()
        });
        
        window.appState.setState('userProgress', progress);
        
        if (window.authManager?.saveUserProgress) {
            await window.authManager.saveUserProgress();
        }
        
        window.showToast(`Quiz complete! You scored ${score}%`, passed ? 'success' : 'warning');
        this.backToUnit();
    }
    
    async markLessonComplete(skipToast = false) {
        const progress = window.appState.getState('userProgress');
        const unitId = this.currentUnit.id;
        const lessonId = this.currentLesson.id;
        
        if (!progress.units[unitId]) progress.units[unitId] = { completedLessons: [], score: 0 };
        if (!progress.units[unitId].completedLessons.includes(lessonId)) {
            progress.units[unitId].completedLessons.push(lessonId);
        }
        
        progress.units[unitId].score = (progress.units[unitId].completedLessons.length / this.currentUnit.lessons.length) * 100;
        
        window.appState.setState('userProgress', progress);
        
        if (window.authManager?.saveUserProgress) {
            await window.authManager.saveUserProgress();
        }
        
        if (!skipToast) window.showToast('Lesson completed!', 'success');
        this.backToUnit();
    }
    
    isLessonCompleted(unitId, lessonId) {
        const progress = window.appState.getState('userProgress');
        return progress.units[unitId]?.completedLessons?.includes(lessonId) || false;
    }
    
    getUnitProgress(unitId) {
        const progress = window.appState.getState('userProgress');
        const unit = this.currentUnit;
        const completed = progress.units[unitId]?.completedLessons?.length || 0;
        return { completed, total: unit.lessons.length };
    }
    
    backToUnit() {
        document.getElementById('lessonView').style.display = 'none';
        document.getElementById('quizView').style.display = 'none';
        document.getElementById('unitView').style.display = 'block';
        this.renderUnitPage();
    }
    
    backToModules() {
        document.getElementById('unitView').style.display = 'none';
        document.getElementById('learnerView').style.display = 'block';
        this.currentUnit = null;
        window.appState.setState('currentUnit', null);
        window.renderLearnerModules();
    }
    
    getDefaultQuizQuestions() {
        return [
            { text: "What is the maximum speed limit in a built-up area?", options: ["40 km/h", "50 km/h", "60 km/h", "70 km/h"], correct: 1 },
            { text: "When should you use hazard lights?", options: ["Parking illegally", "Warning of obstruction", "In heavy rain", "During overtaking"], correct: 1 },
            { text: "What does a STOP sign require?", options: ["Slow down", "Stop completely", "Yield to left", "Continue if clear"], correct: 1 }
        ];
    }
}

window.learnerManager = new LearnerManager();
