import React from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { QuizSkeleton } from '../components/skeletons/QuizSkeleton';
import QuizIntro from '../components/quiz/QuizIntro';
import QuizResults from '../components/quiz/QuizResults';
import QuizReview from '../components/quiz/QuizReview';
import QuizTake from '../components/quiz/QuizTake';

export default function QuizView() {
    const {
        quizData,
        loading,
        currentQuestionIndex,
        answers,
        results,
        submitting,
        showIntro,
        sessionSeed,
        handleStart,
        handleReplay,
        handleRetry,
        handleOptionSelect,
        nextQuestion,
        prevQuestion,
        handleSubmit,
        id,
        navigate
    } = useQuiz();

    if (loading) {
        return <QuizSkeleton />;
    }

    if (!quizData) return null;

    const { quiz, questions } = quizData;
    const totalPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);

    // View: Results
    if (results) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
                <QuizResults 
                    results={results}
                    quiz={quiz}
                    questions={questions}
                    userAnswers={answers}
                    onBack={() => {
                        localStorage.removeItem(`quiz_intro_${id}`);
                        navigate(-1);
                    }}
                    onRetry={handleRetry}
                    onReplay={handleReplay}
                />
                
                <QuizReview 
                    results={results}
                    questions={questions}
                    userAnswers={answers}
                />
            </div>
        );
    }

    // View: Intro
    if (showIntro) {
        return (
            <QuizIntro 
                quiz={quiz}
                totalPoints={totalPoints}
                questionsCount={questions.length}
                onStart={handleStart}
                onBack={() => {
                    localStorage.removeItem(`quiz_intro_${id}`);
                    navigate(-1);
                }}
            />
        );
    }

    // View: Taking Quiz
    return (
        <QuizTake 
            quiz={quiz}
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            onOptionSelect={handleOptionSelect}
            onNext={nextQuestion}
            onPrev={prevQuestion}
            onSubmit={handleSubmit}
            submitting={submitting}
            attemptsMade={quizData.attemptsMade}
            sessionSeed={sessionSeed}
            onBack={() => {
                localStorage.removeItem(`quiz_intro_${id}`);
                navigate(-1);
            }}
        />
    );
}
