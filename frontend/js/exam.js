// Complete exam system with timer, randomization, scoring
class ExamSystem {
    constructor() {
        this.currentExam = null;
        this.timerInterval = null;
    }
    
    // Start a new exam
    startExam(mode, questionPool = null) {
        const allQuestions = window.appState.getState('allContent')?.questions || [];
        let questions = [];
        
        if (mode === 'mock') {
            // NTSA full mock test: 30 random questions
            questions = this.getRandomQuestions(allQuestions, 30);
        } else if (mode === 'timed') {
            // Timed practice: 20 questions, 30 minutes
            questions = this.getRandomQuestions(allQuestions, 20);
        } else {
            // Practice mode: 10 questions
            questions = this.getRandomQuestions(allQuestions, 10);
        }
        
        const timeLimit = mode === 'mock' ? 1800 : (mode === 'timed' ? 1800 : 0); // 30 minutes
        
        this.currentExam = {
            mode: mode,
            questions: questions,
            answers: new Array(questions.length).fill(null),
            startTime: Date.now(),
            timeLimit: timeLimit,
            timeRemaining: timeLimit
        };
        
        window.appState.setState('examMode', mode);
        window.appState.setState('examQuestions', questions);
        window.appState.setState('examAnswers', this.currentExam.answers);
        window.appState.setState('examTimeRemaining', timeLimit);
        
        if (timeLimit > 0) {
            this.startTimer();
        }
        
        this.renderExam();
    }
    
    getRandomQuestions(pool, count) {
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }
    
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            if (this.currentExam && this.currentExam.timeRemaining > 0) {
                this.currentExam.timeRemaining--;
                window.appState.setState('examTimeRemaining', this.currentExam.timeRemaining);
                
                if (this.currentExam.timeRemaining <= 0) {
                    this.submitExam();
                }
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    answerQuestion(index, selectedOption) {
        if (!this.currentExam) return;
        
        const isCorrect = selectedOption === this.currentExam.questions[index].correct;
        this.currentExam.answers[index] = {
            selected: selectedOption,
            isCorrect: isCorrect,
            questionId: this.currentExam.questions[index].id
        };
        
        window.appState.setState('examAnswers', [...this.currentExam.answers]);
        this.renderExam();
    }
    
    calculateScore() {
        if (!this.currentExam) return 0;
        
        const correct = this.currentExam.answers.filter(a => a && a.isCorrect).length;
        const total = this.currentExam.questions.length;
        return {
            correct: correct,
            total: total,
            percentage: Math.round((correct / total) * 100),
            passed: (correct / total) >= 0.7 // 70% to pass
        };
    }
    
    async submitExam() {
        this.stopTimer();
        
        const score = this.calculateScore();
        const timeSpent = Math.floor((Date.now() - this.currentExam.startTime) / 1000);
        
        const examResult = {
            mode: this.currentExam.mode,
            date: new Date().toISOString(),
            score: score,
            timeSpent: timeSpent,
            questions: this.currentExam.questions.map((q, i) => ({
                id: q.id,
                correct: q.correct,
                userAnswer: this.currentExam.answers[i]?.selected,
                isCorrect: this.currentExam.answers[i]?.isCorrect
            }))
        };
        
        // Save to progress
        const progress = window.appState.getState('userProgress');
        if (!progress.quizHistory) progress.quizHistory = [];
        progress.quizHistory.push(examResult);
        
        // Save answers for practice tracking
        this.currentExam.answers.forEach(answer => {
            if (answer) {
                const existingIndex = progress.answers.findIndex(a => a.id === answer.questionId);
                if (existingIndex >= 0) {
                    progress.answers[existingIndex] = answer;
                } else {
                    progress.answers.push(answer);
                }
            }
        });
        
        window.appState.setState('userProgress', progress);
        
        if (window.authManager?.saveUserProgress) {
            await window.authManager.saveUserProgress();
        }
        
        this.showResults(score);
        this.currentExam = null;
        window.appState.setState('examMode', null);
    }
    
    showResults(score) {
        const passed = score.passed;
        const message = passed 
            ? `🎉 Congratulations! You passed with ${score.percentage}% (${score.correct}/${score.total})`
            : `📚 You scored ${score.percentage}% (${score.correct}/${score.total}). Keep practicing!`;
        
        window.showToast(message, passed ? 'success' : 'warning');
        
        // Show detailed results modal
        this.showResultsModal(score);
    }
    
    showResultsModal(score) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-card" style="max-width: 500px;">
                <h2>${score.passed ? '✅ Exam Completed!' : '📋 Exam Results'}</h2>
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 3rem; font-weight: 800; color: #d4af37;">${score.percentage}%</div>
                    <div style="font-size: 1.2rem;">${score.correct} / ${score.total} correct</div>
                    <div style="margin-top: 10px; padding: 10px; background: #1a1a22; border-radius: 12px;">
                        <i class="fas fa-clock"></i> Time spent: ${Math.floor(score.timeSpent / 60)}:${(score.timeSpent % 60).toString().padStart(2, '0')}
                    </div>
                </div>
                <div style="margin: 20px 0;">
                    <h3>Recommendation:</h3>
                    <p>${score.passed ? 'You are ready for the real NTSA driving test!' : 'Review the units you struggled with and try again.'}</p>
                </div>
                <button onclick="this.closest('.modal-overlay').remove(); window.navigateTo('learner');" style="width:100%; background:#d4af37; color:#000; padding:12px; border:none; border-radius:40px; cursor:pointer;">Continue Learning</button>
                <button onclick="this.closest('.modal-overlay').remove(); window.examSystem.startExam('mock');" style="width:100%; margin-top:10px; background:transparent; border:1px solid #d4af37; color:#d4af37; padding:12px; border-radius:40px; cursor:pointer;">Take Another Mock Test</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    renderExam() {
        const container = document.getElementById('examContainer');
        if (!container || !this.currentExam) return;
        
        const score = this.calculateScore();
        const timeDisplay = this.currentExam.timeLimit > 0 
            ? `${Math.floor(this.currentExam.timeRemaining / 60)}:${(this.currentExam.timeRemaining % 60).toString().padStart(2, '0')}`
            : 'Untimed';
        
        container.innerHTML = `
            <div class="exam-header">
                <div class="exam-info">
                    <span class="exam-badge">${this.currentExam.mode.toUpperCase()} MODE</span>
                    <span class="exam-timer"><i class="fas fa-clock"></i> ${timeDisplay}</span>
                    <span class="exam-progress">${this.currentExam.answers.filter(a => a).length}/${this.currentExam.questions.length} answered</span>
                </div>
                <div class="exam-score">Score: ${score.percentage}%</div>
            </div>
            <div class="exam-questions">
                ${this.currentExam.questions.map((q, idx) => `
                    <div class="exam-question-card ${this.currentExam.answers[idx] ? 'answered' : ''}">
                        <div class="question-number">Question ${idx + 1} of ${this.currentExam.questions.length}</div>
                        <div class="question-text">${q.text}</div>
                        <div class="question-options">
                            ${q.options.map((opt, optIdx) => {
                                const isSelected = this.currentExam.answers[idx]?.selected === optIdx;
                                const isCorrect = this.currentExam.answers[idx]?.isCorrect && isSelected;
                                return `
                                    <div class="exam-option ${isSelected ? (isCorrect ? 'correct' : 'wrong') : ''}" 
                                         onclick="window.examSystem.answerQuestion(${idx}, ${optIdx})">
                                        <span class="option-letter">${String.fromCharCode(65 + optIdx)}</span>
                                        <span class="option-text">${opt}</span>
                                        ${isSelected ? `<i class="fas fa-${isCorrect ? 'check-circle' : 'times-circle'}"></i>` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="exam-actions">
                <button class="btn-outline" onclick="window.examSystem.stopTimer(); window.navigateTo('learner');">Cancel Exam</button>
                <button class="btn" onclick="window.examSystem.submitExam()">Submit Exam</button>
            </div>
        `;
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// Initialize
window.examSystem = new ExamSystem();
