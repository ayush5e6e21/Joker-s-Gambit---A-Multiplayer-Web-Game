import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';


interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to backend
        // In production, we use the environment variable. In development, we fallback to localhost:3001
        // or the environment variable if set in .env
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        console.log('Connecting to backend at:', backendUrl);

        const socketInstance = io(backendUrl, {
            transports: ['websocket'],
            autoConnect: true,
        });

        socketInstance.on('connect', () => {
            console.log('Connected to server:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
