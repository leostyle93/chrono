import React from 'react';
import { useTimelineStore } from '../store/timelineStore';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { formatEventDate } from '../utils/time';

const EventViewerModal: React.FC = () => {
  const { viewerModalState, closeViewerModal } = useTimelineStore();
  const { event } = viewerModalState;
  const { textColor } = useThemeStore();
  const { language } = useLanguageStore();

  if (!event) return null;

  const getYoutubeEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      let videoId = null;

      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        if (urlObj.pathname === '/watch') {
          videoId = urlObj.searchParams.get('v');
        } else if (urlObj.pathname.startsWith('/embed/')) {
          videoId = urlObj.pathname.substring(7);
        }
      } 
      else if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      }
      
      if (videoId) {
        const queryIndex = videoId.indexOf('?');
        if (queryIndex !== -1) {
          videoId = videoId.substring(0, queryIndex);
        }
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (e) {
      console.error('Invalid YouTube URL:', url, e);
      return null;
    }
  };

  const getGmapsSearchUrl = (query: string): string => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };
  
  const getGmapsEmbedUrl = (query: string): string => {
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=7&ie=UTF8&iwloc=&output=embed`;
  };
  
  const youtubeEmbedUrl = event.youtubeUrl ? getYoutubeEmbedUrl(event.youtubeUrl) : null;
  const gmapsEmbedUrl = event.gmapsQuery ? getGmapsEmbedUrl(event.gmapsQuery) : null;
  const hasMedia = !!youtubeEmbedUrl || !!event.imageUrl;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeViewerModal}>
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl border border-gray-700 overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
        style={{ color: textColor }}
      >
        <div className="flex-grow overflow-y-auto">
          <div className="relative bg-gray-900">
            <div className="absolute top-3 right-3 z-20">
              <button onClick={closeViewerModal} className="text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition-colors text-2xl">&times;</button>
            </div>
            
            {youtubeEmbedUrl && (
              <div className="aspect-video bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={youtubeEmbedUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.title} className="w-full max-h-[50vh] object-cover" />
            )}

            {!hasMedia && (
              <div className="h-16 flex items-center p-6">
                 <h2 className="text-3xl font-bold">{event.title}</h2>
              </div>
            )}
          </div>

          <div className="p-6">
            {hasMedia && (
              <h2 className="text-3xl font-bold">{event.title}</h2>
            )}
            <p className="text-lg text-cyan-400 font-semibold mb-4">{formatEventDate(event, language)}</p>
            
            {event.mainText || event.description ? (
              <p className="whitespace-pre-wrap">{event.mainText || event.description}</p>
            ) : (
              <p className="text-gray-400 italic">No description available.</p>
            )}

            {gmapsEmbedUrl && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-2 text-gray-300">Location</h3>
                <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-600">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="Google Maps"
                    scrolling="no"
                    src={gmapsEmbedUrl}
                  ></iframe>
                </div>
              </div>
            )}

            {(event.articleUrl || event.gmapsQuery) && (
              <div className="flex gap-4 mt-6 border-t border-gray-700 pt-4">
                {event.articleUrl && (
                  <a 
                    href={event.articleUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors text-center flex-1"
                  >
                    Read More
                  </a>
                )}
                {event.gmapsQuery && (
                  <a 
                    href={getGmapsSearchUrl(event.gmapsQuery)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-colors text-center flex-1"
                  >
                    View on Map
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventViewerModal;