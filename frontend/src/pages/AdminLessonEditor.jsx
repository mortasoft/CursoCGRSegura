import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useLessonEditor } from '../hooks/useLessonEditor';
import QuizEditorModal from '../components/QuizEditorModal';
import SurveyEditorModal from '../components/SurveyEditorModal';
import ConfirmModal from '../components/ConfirmModal';

// Components
import LessonEditorHeader from '../components/admin/lesson-editor/LessonEditorHeader';
import ContentTypeSelector from '../components/admin/lesson-editor/ContentTypeSelector';
import ContentItem from '../components/admin/lesson-editor/ContentItem';
import ContentEditorModal from '../components/admin/lesson-editor/ContentEditorModal';
import AssignmentReviewModal from '../components/admin/lesson-editor/AssignmentReviewModal';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminLessonEditor() {
    const { id: lessonId } = useParams();

    const {
        lesson,
        contents,
        loading,
        isModalOpen,
        setIsModalOpen,
        formData,
        setFormData,
        editingItem,
        itemToDelete,
        setItemToDelete,
        viewingAssignment,
        setViewingAssignment,
        assignmentSubmissions,
        isQuizEditorOpen,
        setIsQuizEditorOpen,
        activeQuizItem,
        setActiveQuizItem,
        isSurveyEditorOpen,
        setIsSurveyEditorOpen,
        activeSurveyItem,
        setActiveSurveyItem,
        handleOpenModal,
        handleSaveContent,
        confirmDelete,
        handleLinkResource,
        moveItem,
        fetchSubmissions,
        handleGradeSubmission
    } = useLessonEditor(lessonId);

    if (loading) return (
        <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Cargando Editor...</p>
        </div>
    );

    const totalPoints = contents.reduce((sum, item) => sum + (Number(item.points) || 0), 0);

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-fade-in px-4">
            <LessonEditorHeader
                lesson={lesson}
                totalPoints={totalPoints}
            />

            <ContentTypeSelector
                onSelect={handleOpenModal}
            />

            {/* Content List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between pl-2">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                        Contenido de la Lección
                    </h2>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-500 border border-white/5 font-black uppercase tracking-widest">
                        {contents.length} {contents.length === 1 ? 'Elemento' : 'Elementos'}
                    </span>
                </div>

                {contents.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/20 rounded-[3rem] border border-white/5 border-dashed flex flex-col items-center justify-center group hover:bg-slate-900/30 transition-all">
                        <div className="p-6 bg-slate-800/40 rounded-full mb-6 group-hover:scale-110 group-hover:bg-primary-500/10 transition-all border border-white/5 shadow-inner">
                            <Plus className="w-16 h-16 text-gray-700 group-hover:text-primary-500/50" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400 mb-2">Sin contenido arquitectónico</h3>
                        <p className="text-sm text-gray-600 max-w-xs font-medium uppercase tracking-wider">Añade elementos multimedia, evaluaciones o recursos arriba.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contents.map((item, index) => (
                            <ContentItem
                                key={item.id}
                                item={item}
                                index={index}
                                totalItems={contents.length}
                                onMove={moveItem}
                                onEdit={(item) => handleOpenModal(null, item)}
                                onDelete={setItemToDelete}
                                onConfigQuiz={(item) => {
                                    setActiveQuizItem(item);
                                    setIsQuizEditorOpen(true);
                                }}
                                onConfigSurvey={(item) => {
                                    setActiveSurveyItem(item);
                                    setIsSurveyEditorOpen(true);
                                }}
                                onViewSubmissions={fetchSubmissions}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ContentEditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                editingItem={editingItem}
                onSave={handleSaveContent}
            />

            <AssignmentReviewModal
                isOpen={!!viewingAssignment}
                onClose={() => setViewingAssignment(null)}
                assignment={viewingAssignment}
                submissions={assignmentSubmissions}
                onGrade={handleGradeSubmission}
                apiUrl={API_URL}
            />

            <QuizEditorModal
                isOpen={isQuizEditorOpen}
                onClose={(quizId) => handleLinkResource(quizId, 'quiz')}
                onQuizCreated={(quizId) => handleLinkResource(quizId, 'quiz', false)}
                quizId={activeQuizItem?.data ? (typeof activeQuizItem.data === 'string' ? JSON.parse(activeQuizItem.data).quiz_id : activeQuizItem.data.quiz_id) : undefined}
                moduleId={lesson?.module_id}
                lessonId={lessonId}
                title={activeQuizItem?.title}
            />

            <SurveyEditorModal
                isOpen={isSurveyEditorOpen}
                onClose={(surveyId) => handleLinkResource(surveyId, 'survey')}
                onSurveyCreated={(surveyId) => handleLinkResource(surveyId, 'survey', false)}
                surveyId={activeSurveyItem?.data ? (typeof activeSurveyItem.data === 'string' ? JSON.parse(activeSurveyItem.data).survey_id : activeSurveyItem.data.survey_id) : undefined}
                moduleId={lesson?.module_id}
                lessonId={lessonId}
                title={activeSurveyItem?.title}
            />

            <ConfirmModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Desmantelar Contenido"
                message="¿Estás seguro que deseas eliminar permanentemente este bloque educativo? Esta operación es irreversible y afectará el índice de progreso de los estudiantes activos."
                confirmText="Eliminar permanentemente"
                confirmColor="red"
            />
        </div>
    );
}
