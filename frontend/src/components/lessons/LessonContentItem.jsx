import { useRef, useCallback, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useSoundStore } from '../../store/soundStore';

// Activities Imports
import TextActivity from './activities/TextActivity';
import VideoActivity from './activities/VideoActivity';
import ImageActivity from './activities/ImageActivity';
import FileActivity from './activities/FileActivity';
import LinkActivity from './activities/LinkActivity';
import HeadingActivity from './activities/HeadingActivity';
import BulletsActivity from './activities/BulletsActivity';
import NoteActivity from './activities/NoteActivity';
import TaskActivity from './activities/TaskActivity';
import ConfirmationActivity from './activities/ConfirmationActivity';
import InteractiveInputActivity from './activities/InteractiveInputActivity';
import PasswordTesterActivity from './activities/PasswordTesterActivity';
import MultipleChoiceActivity from './activities/MultipleChoiceActivity';
import MfaDefenderActivity from './activities/MfaDefenderActivity';
import HackNeighborGame from './activities/HackNeighborGame';
import CategorizationActivity from './activities/CategorizationActivity';
import DataTetrisActivity from './activities/DataTetrisActivity';
import ForumActivity from './activities/ForumActivity/ForumActivity';
import TermsTrapActivity from './activities/TermsTrapActivity';
import DriveAuditorActivity from './activities/DriveAuditorActivity';
const API_URL = import.meta.env.VITE_API_URL;

export default function LessonContentItem({
    item,
    user,
    ytApiLoaded,
    markVideoAsWatched,
    markLinkAsVisited,
    handleResourceDownload,
    handleAssignmentUpload,
    uploadingAssignment,
    watchedVideos,
    visitedLinks,
    navigate,
    onEnded
}) {
    const playSound = useSoundStore(state => state.playSound);
    const lastTimeRef = useRef(0);
    const onEndedRef = useRef(onEnded);

    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);

    const playSuccess = useCallback(() => playSound('/sounds/exito.mp3'), [playSound]);
    const playError = useCallback(() => playSound('/sounds/gato-error.mp3'), [playSound]);

    let data = item.data || {};

    // Safety check: if data is a string, try to parse it
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.error("Error parsing content data:", e);
        }
    }

    // Deep safety check: if data.text is also stringified JSON
    if (data.text && typeof data.text === 'string' && data.text.startsWith('{"')) {
        try {
            const inner = JSON.parse(data.text);
            if (inner.text) data.text = inner.text;
        } catch (e) { }
    }

    const commonProps = { item, data, playSuccess, playError, markLinkAsVisited, visitedLinks };

    switch (item.content_type) {
        case 'text':
            return <TextActivity data={data} />;

        case 'video':
            return (
                <VideoActivity 
                    {...commonProps} 
                    watchedVideos={watchedVideos} 
                    markVideoAsWatched={markVideoAsWatched} 
                    ytApiLoaded={ytApiLoaded} 
                    lastTimeRef={lastTimeRef} 
                    onEndedRef={onEndedRef}
                    API_URL={API_URL} 
                />
            );

        case 'image':
            return <ImageActivity item={item} data={data} API_URL={API_URL} />;

        case 'file':
            return <FileActivity item={item} data={data} API_URL={API_URL} handleResourceDownload={handleResourceDownload} visitedLinks={visitedLinks} />;

        case 'link':
            return <LinkActivity {...commonProps} />;

        case 'heading':
            return <HeadingActivity data={data} />;

        case 'bullets':
            return <BulletsActivity data={data} />;

        case 'note':
            return <NoteActivity item={item} data={data} />;

        case 'quiz':
        case 'survey':
        case 'assignment':
            return (
                <TaskActivity 
                    item={item} 
                    data={data} 
                    navigate={navigate} 
                    handleAssignmentUpload={handleAssignmentUpload} 
                    uploadingAssignment={uploadingAssignment} 
                    API_URL={API_URL} 
                />
            );

        case 'confirmation':
            return <ConfirmationActivity {...commonProps} />;

        case 'interactive_input':
            return <InteractiveInputActivity {...commonProps} />;

        case 'password_tester':
            return <PasswordTesterActivity {...commonProps} />;

        case 'multiple_choice':
            return <MultipleChoiceActivity {...commonProps} />;

        case 'mfa_defender':
            return <MfaDefenderActivity {...commonProps} />;

        case 'hack_neighbor':
            return <HackNeighborGame {...commonProps} />;

        case 'categorization':
            return <CategorizationActivity {...commonProps} />;
            
        case 'data_tetris':
            return <DataTetrisActivity {...commonProps} />;

        case 'terms_trap':
            return <TermsTrapActivity {...commonProps} />;

        case 'drive_auditor':
            return <DriveAuditorActivity {...commonProps} />;

        case 'forum':
            return (
                <ForumActivity 
                    item={item} 
                    user={user} 
                    onComplete={(id) => {
                        // Solo llamamos handleComplete si no está en modo estudiante / no admin
                        // Para simplificar, la lógica de LessonView ya maneja qué pasa al completar
                        if (onEndedRef.current) onEndedRef.current(id);
                    }} 
                />
            );

        default:
            return (
                <div className="p-6 bg-slate-800/20 border border-white/5 rounded-2xl">
                    <p className="text-gray-500 italic">Contenido tipo "{item.content_type}" no soportado aún.</p>
                </div>
            );
    }
}
