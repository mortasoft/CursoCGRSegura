import React from 'react';

import { getFileUrl } from '../../../utils/imageUtils';

export default function ImageActivity({ item, data }) {
    const imgSrc = getFileUrl(data.file_url || data.url);
    return (
        <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                <img src={imgSrc} alt={data.alt_text || item.title} className="w-full h-auto max-h-[600px] object-contain mx-auto" />
            </div>
        </div>
    );
}
