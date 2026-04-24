import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Room, 
  RoomEvent, 
  Track, 
  RemoteTrack, 
  RemoteTrackPublication, 
  RemoteParticipant, 
  Participant, 
  ConnectionState 
} from 'livekit-client';
import { Mic, MicOff, PhoneOff, Loader2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TranscriptMessage {
  sender: string;
  text: string;
  timestamp: number;
  startMs?: number;
}

interface LiveAvatarProps {
  language?: string;
  onSessionEnd?: (messages: TranscriptMessage[]) => void;
  onClose?: () => void;
}

export default function LiveAvatarChat({ language = "de", onSessionEnd, onClose }: LiveAvatarProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'finished'>('idle');
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const roomRef = useRef<Room | null>(null);
  
  const sessionStartTimeRef = useRef<number>(0);
  const messagesRef = useRef<TranscriptMessage[]>([]);

  const handleTrackSubscribed = useCallback(
    (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log("Track subscribed:", track.kind, "from:", participant.identity);

      if (track.kind === Track.Kind.Video && videoRef.current) {
        track.attach(videoRef.current);
        console.log("Video track attached");
      } else if (track.kind === Track.Kind.Audio && audioContainerRef.current) {
        const trackId = `${participant.identity}-${track.sid}`;

        let audioEl = audioElementsRef.current.get(trackId);
        if (!audioEl) {
          audioEl = document.createElement("audio");
          audioEl.autoplay = true;
          audioEl.setAttribute("playsinline", "true");
          audioEl.id = trackId;
          audioContainerRef.current.appendChild(audioEl);
          audioElementsRef.current.set(trackId, audioEl);
        }

        track.attach(audioEl);
        audioEl.play().catch(err => console.log("Audio autoplay blocked:", err.message));
      }
    },
    []
  );

  const handleTrackUnsubscribed = useCallback(
    (track: RemoteTrack, publication?: RemoteTrackPublication, participant?: RemoteParticipant) => {
      track.detach();
      console.log("Track unsubscribed:", track.kind);

      if (track.kind === Track.Kind.Audio && participant && track.sid) {
        const trackId = `${participant.identity}-${track.sid}`;
        const audioEl = audioElementsRef.current.get(trackId);
        if (audioEl) {
          audioEl.remove();
          audioElementsRef.current.delete(trackId);
        }
      }
    },
    []
  );

  const handleParticipantConnected = useCallback((participant: RemoteParticipant) => {
    console.log("Participant connected:", participant.identity);

    participant.trackPublications.forEach((publication) => {
      if (publication.track && publication.isSubscribed) {
        if (publication.track.kind === Track.Kind.Video && videoRef.current) {
          publication.track.attach(videoRef.current);
        } else if (publication.track.kind === Track.Kind.Audio && audioContainerRef.current) {
          const track = publication.track;
          const trackId = `${participant.identity}-${track.sid}`;

          let audioEl = audioElementsRef.current.get(trackId);
          if (!audioEl) {
            audioEl = document.createElement("audio");
            audioEl.autoplay = true;
            audioEl.setAttribute("playsinline", "true");
            audioEl.id = trackId;
            audioContainerRef.current.appendChild(audioEl);
            audioElementsRef.current.set(trackId, audioEl);
          }

          track.attach(audioEl);
          audioEl.play().catch(err => console.log("Audio autoplay blocked:", err.message));
        }
      }
    });
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log("Room disconnected");
  }, []);

  const handleConnectionStateChanged = useCallback((state: ConnectionState) => {
    console.log("Connection state changed:", state);
    if (state === ConnectionState.Disconnected) {
      console.log("Connection lost");
    }
  }, []);

  const handleActiveSpeakersChanged = useCallback(
    (speakers: Participant[]) => {
      if (!roomRef.current) return;

      const localIdentity = roomRef.current.localParticipant.identity;
      const avatarIsSpeaking = speakers.some(
        (speaker) => speaker.identity !== localIdentity
      );

      console.log("Active speakers changed, avatar speaking:", avatarIsSpeaking);

      setIsAvatarTalking((prevTalking) => {
        if (avatarIsSpeaking && !prevTalking) {
          console.log("Avatar started speaking - muting user mic");
          roomRef.current?.localParticipant.setMicrophoneEnabled(false);
          setIsMuted(true);
          return true;
        } else if (!avatarIsSpeaking && prevTalking) {
          console.log("Avatar stopped speaking - unmuting user mic");
          roomRef.current?.localParticipant.setMicrophoneEnabled(true);
          setIsMuted(false);
          return false;
        }
        return prevTalking;
      });
    },
    []
  );

  const handleDataReceived = useCallback(
    (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const message = new TextDecoder().decode(payload);
        console.log("Data received:", message, "from:", participant?.identity);
        
        const data = JSON.parse(message);
        
        if (data.type === "avatar_start_talking" || data.type === "agent_start_talking") {
          console.log("Avatar started talking - muting user");
          setIsAvatarTalking(true);
          if (roomRef.current) {
            roomRef.current.localParticipant.setMicrophoneEnabled(false);
            setIsMuted(true);
          }
        } else if (data.type === "avatar_stop_talking" || data.type === "agent_stop_talking") {
          console.log("Avatar stopped talking - unmuting user");
          setIsAvatarTalking(false);
          if (roomRef.current) {
            roomRef.current.localParticipant.setMicrophoneEnabled(true);
            setIsMuted(false);
          }
        }
        
        if (data.event_type === 'avatar.transcription' && data.text) {
          const msg: TranscriptMessage = {
            sender: 'avatar',
            text: data.text,
            timestamp: Date.now(),
            startMs: Date.now() - sessionStartTimeRef.current,
          };
          messagesRef.current = [...messagesRef.current, msg];
          setMessages(prev => [...prev, msg]);
        } else if (data.event_type === 'user.transcription' && data.text) {
          const msg: TranscriptMessage = {
            sender: 'user',
            text: data.text,
            timestamp: Date.now(),
            startMs: Date.now() - sessionStartTimeRef.current,
          };
          messagesRef.current = [...messagesRef.current, msg];
          setMessages(prev => [...prev, msg]);
        }
      } catch (e) {
        console.log("Non-JSON data received");
      }
    },
    []
  );

  const startSession = async () => {
    setStatus('connecting');
    setError(null);
    setMessages([]);
    messagesRef.current = [];
    
    try {
      const tokenRes = await fetch('/api/liveavatar/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      
      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        throw new Error(err.details || err.error || 'Failed to get session token');
      }
      
      const tokenData = await tokenRes.json();
      const { session_id, session_token } = tokenData;
      
      if (!session_id || !session_token) {
        throw new Error('Invalid token response from server');
      }
      
      setSessionId(session_id);
      setSessionToken(session_token);
      
      console.log('LiveAvatar token received:', session_id);

      const startRes = await fetch('/api/liveavatar/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token }),
      });
      
      if (!startRes.ok) {
        const err = await startRes.json();
        throw new Error(err.details || err.error || 'Failed to start session');
      }
      
      const startData = await startRes.json();
      console.log('LiveAvatar session started:', startData);
      
      const { livekit_url, livekit_client_token } = startData.data || {};
      
      if (!livekit_url || !livekit_client_token) {
        throw new Error('Missing LiveKit connection data');
      }

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.on(RoomEvent.Disconnected, handleDisconnected);
      room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
      room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.on(RoomEvent.DataReceived, handleDataReceived);
      room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakersChanged);

      await room.connect(livekit_url, livekit_client_token);
      
      await room.localParticipant.setMicrophoneEnabled(false);
      setIsMuted(true);

      roomRef.current = room;
      
      console.log('Connected to LiveKit room');
      
      sessionStartTimeRef.current = Date.now();
      setStatus('active');
      
    } catch (error: any) {
      console.error('Failed to start session:', error);
      setError(error.message || 'Failed to connect');
      setStatus('idle');
      cleanup();
    }
  };

  const toggleMute = async () => {
    if (isAvatarTalking) return;
    
    if (roomRef.current) {
      const newMuted = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!newMuted);
      setIsMuted(newMuted);
    }
  };

  const cleanup = () => {
    audioElementsRef.current.forEach((audioEl) => {
      audioEl.remove();
    });
    audioElementsRef.current.clear();
    
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
  };

  const finishSession = async () => {
    if (status !== 'active' || !sessionId || !sessionToken) return;

    try {
      await fetch('/api/liveavatar/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: sessionId,
          session_token: sessionToken 
        }),
      });

      await fetch(`/api/liveavatar/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: sessionToken }),
      });

      if (messagesRef.current.length > 0) {
        try {
          await fetch(`/api/liveavatar/sessions/${sessionId}/transcript`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language,
              messages: messagesRef.current,
            }),
          });
        } catch (e) {
          console.error('Failed to save video transcript:', e);
        }
      }

      console.log('LiveAvatar session finished');
      
      if (onSessionEnd) {
        onSessionEnd([...messagesRef.current]);
      }
      
    } catch (error) {
      console.error('Failed to finish session:', error);
    } finally {
      cleanup();
      setStatus('finished');
    }
  };

  const handleClose = () => {
    if (status === 'active') {
      finishSession();
    }
    cleanup();
    onClose?.();
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          {status === 'active' && (
            <span className="flex items-center gap-2 text-white text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live-Gespräch
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClose}
          className="text-white hover:bg-white/20 rounded-full"
        >
          <X size={24} />
        </Button>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            status === 'active' ? 'opacity-100' : 'opacity-0'
          )}
        />
        
        <div ref={audioContainerRef} className="hidden" />
        
        {/* States */}
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-gray-900 to-black"
            >
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <Mic size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Maria</h2>
              <p className="text-gray-400 mb-8 max-w-[280px]">
                Bereit, Ihre Fragen in Echtzeit zu beantworten
              </p>
              <Button 
                onClick={startSession}
                className="h-14 px-8 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-black"
              >
                Gespräch starten
              </Button>
              
              {error && (
                <div className="mt-6 flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </motion.div>
          )}
          
          {status === 'connecting' && (
            <motion.div 
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black"
            >
              <Loader2 size={48} className="text-primary animate-spin mb-4" />
              <p className="text-white font-medium">Verbindung wird hergestellt...</p>
            </motion.div>
          )}
          
          {status === 'finished' && (
            <motion.div 
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-gray-900 to-black"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Gespräch beendet</h2>
              <p className="text-gray-400 mb-6">Danke für das Gespräch!</p>
              <Button 
                onClick={handleClose}
                variant="secondary"
                className="rounded-xl"
              >
                Schließen
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      {status === 'active' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent"
        >
          {/* Avatar Speaking Indicator */}
          {isAvatarTalking && (
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Maria spricht...
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleMute}
              disabled={isAvatarTalking}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                isMuted 
                  ? "bg-white/20 text-white" 
                  : "bg-primary text-black",
                isAvatarTalking && "opacity-50 cursor-not-allowed"
              )}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button
              onClick={finishSession}
              className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
