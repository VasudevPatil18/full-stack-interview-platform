import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN servers for production
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password'
    // }
  ],
};

export function useWebRTC(session, user, isHost, isParticipant) {
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [remoteUser, setRemoteUser] = useState(null);

  const peerConnection = useRef(null);
  const screenStream = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!session || !user || (!isHost && !isParticipant)) return;

    const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const socketInstance = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      
      // Join room
      socketInstance.emit('join-room', {
        roomId: session._id,
        userId: user._id,
        userName: user.name,
      });
    });

    socketInstance.on('existing-users', (users) => {
      console.log('Existing users:', users);
      if (users.length > 0) {
        setRemoteUser(users[0]);
        // Create offer to existing user
        createOffer(users[0].socketId);
      }
      setIsConnecting(false);
    });

    socketInstance.on('user-joined', (userData) => {
      console.log('User joined:', userData);
      setRemoteUser(userData);
      toast.success(`${userData.userName} joined the call`);
    });

    socketInstance.on('user-left', (userData) => {
      console.log('User left:', userData);
      setRemoteUser(null);
      setRemoteStream(null);
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      toast.info(`${userData.userName} left the call`);
    });

    socketInstance.on('offer', async ({ offer, from, userName }) => {
      console.log('Received offer from:', userName);
      await handleOffer(offer, from);
    });

    socketInstance.on('answer', async ({ answer, from }) => {
      console.log('Received answer from:', from);
      await handleAnswer(answer);
    });

    socketInstance.on('ice-candidate', async ({ candidate, from }) => {
      console.log('Received ICE candidate from:', from);
      await handleIceCandidate(candidate);
    });

    socketInstance.on('chat-message', (data) => {
      setChatMessages((prev) => [...prev, data]);
    });

    socketInstance.on('user-audio-toggle', ({ userId, enabled }) => {
      console.log(`User ${userId} ${enabled ? 'enabled' : 'disabled'} audio`);
    });

    socketInstance.on('user-video-toggle', ({ userId, enabled }) => {
      console.log(`User ${userId} ${enabled ? 'enabled' : 'disabled'} video`);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session, user, isHost, isParticipant]);

  // Get local media stream
  useEffect(() => {
    const getLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        setIsConnecting(false);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast.error('Failed to access camera/microphone');
        setIsConnecting(false);
      }
    };

    if (session && user && (isHost || isParticipant)) {
      getLocalStream();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [session, user, isHost, isParticipant]);

  // Create peer connection
  const createPeerConnection = useCallback((remoteSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote track');
      setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: remoteSocketId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'failed') {
        toast.error('Connection failed. Please refresh.');
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [localStream, socket]);

  // Create offer
  const createOffer = useCallback(async (remoteSocketId) => {
    if (!socket || !localStream) return;

    const pc = createPeerConnection(remoteSocketId);
    
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socket.emit('offer', {
        offer,
        to: remoteSocketId,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [socket, localStream, createPeerConnection]);

  // Handle offer
  const handleOffer = useCallback(async (offer, remoteSocketId) => {
    if (!socket || !localStream) return;

    const pc = createPeerConnection(remoteSocketId);
    
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socket.emit('answer', {
        answer,
        to: remoteSocketId,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, [socket, localStream, createPeerConnection]);

  // Handle answer
  const handleAnswer = useCallback(async (answer) => {
    if (!peerConnection.current) return;
    
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (candidate) => {
    if (!peerConnection.current) return;
    
    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        if (socket && session) {
          socket.emit('toggle-audio', {
            roomId: session._id,
            enabled: audioTrack.enabled,
          });
        }
      }
    }
  }, [localStream, socket, session]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        if (socket && session) {
          socket.emit('toggle-video', {
            roomId: session._id,
            enabled: videoTrack.enabled,
          });
        }
      }
    }
  }, [localStream, socket, session]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      
      screenStream.current = stream;
      
      // Replace video track
      if (peerConnection.current && localStream) {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnection.current
          .getSenders()
          .find((s) => s.track?.kind === 'video');
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }
      
      setIsScreenSharing(true);
      
      if (socket && session) {
        socket.emit('start-screen-share', { roomId: session._id });
      }
      
      // Handle screen share stop
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast.error('Failed to start screen sharing');
    }
  }, [socket, session, localStream]);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((track) => track.stop());
      
      // Restore camera video
      if (peerConnection.current && localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        const sender = peerConnection.current
          .getSenders()
          .find((s) => s.track?.kind === 'video');
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }
      
      setIsScreenSharing(false);
      
      if (socket && session) {
        socket.emit('stop-screen-share', { roomId: session._id });
      }
    }
  }, [socket, session, localStream]);

  // Send chat message
  const sendMessage = useCallback((message) => {
    if (socket && session && user) {
      socket.emit('chat-message', {
        roomId: session._id,
        message,
        userName: user.name,
      });
    }
  }, [socket, session, user]);

  // Leave call
  const leaveCall = useCallback(() => {
    if (socket && session) {
      socket.emit('leave-room', { roomId: session._id });
    }
    
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((track) => track.stop());
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
    }
  }, [socket, session, localStream]);

  return {
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    chatMessages,
    isConnecting,
    remoteUser,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    sendMessage,
    leaveCall,
  };
}
