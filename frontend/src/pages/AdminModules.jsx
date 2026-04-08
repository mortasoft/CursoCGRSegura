import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminModules } from '../hooks/useAdminModules';

// Components
import ConfirmModal from '../components/ConfirmModal';
import { ModuleCardSkeleton } from '../components/skeletons/DashboardSkeletons';
import AdminModulesHeader from '../components/admin/modules/AdminModulesHeader';
import AdminModulesSearch from '../components/admin/modules/AdminModulesSearch';
import ModuleCard from '../components/admin/modules/ModuleCard';
import ModuleModal from '../components/admin/modules/ModuleModal';
import LessonModal from '../components/admin/modules/LessonModal';
import ResourceModal from '../components/admin/modules/ResourceModal';

export default function AdminModules() {
    const navigate = useNavigate();
    const {
        modules,
        fullModules,
        loading,
        searchTerm,
        setSearchTerm,
        isModuleModalOpen,
        setIsModuleModalOpen,
        editingModule,
        moduleFormData,
        setModuleFormData,
        handleOpenModuleModal,
        handleSaveModule,
        handleTogglePublish,
        confirmDeleteModule,
        expandedModule,
        toggleModuleExpansion,
        moduleLessons,
        moduleResources,
        contentLoading,
        itemToDelete,
        setItemToDelete,
        isLessonModalOpen,
        setIsLessonModalOpen,
        editingLesson,
        lessonFormData,
        setLessonFormData,
        handleOpenLessonModal,
        handleSaveLesson,
        confirmDeleteLesson,
        toggleLessonOptional,
        isResourceModalOpen,
        setIsResourceModalOpen,
        editingResource,
        resourceFormData,
        setResourceFormData,
        handleOpenResourceModal,
        handleSaveResource,
        confirmDeleteResource,
        handleReorderLessons
    } = useAdminModules();

    const [deleteType, setDeleteType] = useState(null); // 'module', 'lesson', 'resource'

    const handleDeleteClick = (item, type) => {
        setItemToDelete(item);
        setDeleteType(type);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        
        if (deleteType === 'module') {
            await confirmDeleteModule(itemToDelete.id);
        } else if (deleteType === 'lesson') {
            await confirmDeleteLesson(itemToDelete.id, expandedModule);
        } else if (deleteType === 'resource') {
            await confirmDeleteResource(itemToDelete.id, expandedModule);
        }
        
        setItemToDelete(null);
        setDeleteType(null);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto">
            {/* Header section with stats & search */}
            <AdminModulesHeader 
                totalModules={fullModules.length}
                publishedModules={fullModules.filter(m => m.is_published).length}
                draftModules={fullModules.filter(m => !m.is_published).length}
                onNewModule={() => handleOpenModuleModal()}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            {/* Modules Grid */}
            {loading ? (
                <div className="grid grid-cols-1 gap-8">
                    <ModuleCardSkeleton />
                    <ModuleCardSkeleton />
                    <ModuleCardSkeleton />
                    <ModuleCardSkeleton />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {modules.map((module) => (
                        <ModuleCard 
                            key={module.id}
                            module={module}
                            expandedModule={expandedModule}
                            onToggleExpansion={toggleModuleExpansion}
                            onTogglePublish={handleTogglePublish}
                            onEditModule={handleOpenModuleModal}
                            onDeleteModule={(m) => handleDeleteClick(m, 'module')}
                            lessons={moduleLessons}
                            resources={moduleResources}
                            contentLoading={contentLoading}
                            onNewLesson={handleOpenLessonModal}
                            onEditLesson={(mid, l) => handleOpenLessonModal(mid, l)}
                            onDeleteLesson={(l) => handleDeleteClick(l, 'lesson')}
                            onToggleLessonOptional={toggleLessonOptional}
                            onOpenLessonEditor={(id) => navigate(`/admin/lessons/${id}/editor`)}
                            onReorderLessons={handleReorderLessons}
                            onNewResource={handleOpenResourceModal}
                            onEditResource={(mid, r) => handleOpenResourceModal(mid, r)}
                            onDeleteResource={(r) => handleDeleteClick(r, 'resource')}
                        />
                    ))}
                </div>
            )}

            {/* --- MODALES --- */}

            <ModuleModal 
                isOpen={isModuleModalOpen}
                onClose={() => setIsModuleModalOpen(false)}
                editingModule={editingModule}
                formData={moduleFormData}
                setFormData={setModuleFormData}
                onSave={handleSaveModule}
            />

            <LessonModal 
                isOpen={isLessonModalOpen}
                onClose={() => setIsLessonModalOpen(false)}
                editingLesson={editingLesson}
                formData={lessonFormData}
                setFormData={setLessonFormData}
                onSave={handleSaveLesson}
            />

            <ResourceModal 
                isOpen={isResourceModalOpen}
                onClose={() => setIsResourceModalOpen(false)}
                editingResource={editingResource}
                formData={resourceFormData}
                setFormData={setResourceFormData}
                onSave={handleSaveResource}
            />

            {/* Confirmacion de Eliminacion */}
            {itemToDelete && (
                <ConfirmModal
                    isOpen={!!itemToDelete}
                    onClose={() => setItemToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title={`Eliminar ${deleteType === 'module' ? 'Módulo' : deleteType === 'lesson' ? 'Lección' : 'Recurso'}`}
                    message={`¿Estás seguro de que deseas eliminar este ${deleteType === 'module' ? 'módulo' : deleteType === 'lesson' ? 'lección' : 'recurso'}? Esta acción no se puede deshacer.`}
                />
            )}
        </div>
    );
}
