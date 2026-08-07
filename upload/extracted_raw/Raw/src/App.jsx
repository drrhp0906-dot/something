import React, { useState, useRef, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import HandOverlay from './components/HandOverlay';
import VirtualCursor from './components/VirtualCursor';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useHandTracking } from './hooks/useHandTracking';
import { parseCommand } from './utils/commandParser';

export default function App() {
  const videoRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: null, y: null });
  const [isPinching, setIsPinching] = useState(false);

  const [widgets, setWidgets] = useState([
    { id: 'w1', title: 'System Status', type: 'stat' },
    { id: 'w2', title: 'Revenue Chart', type: 'chart' },
  ]);
  
  const [layout, setLayout] = useState([
    { i: 'w1', x: 0, y: 0, w: 3, h: 4 },
    { i: 'w2', x: 3, y: 0, w: 4, h: 6 },
  ]);

  // Voice Command Handler
  const handleVoiceCommand = useCallback((transcript) => {
    const message = parseCommand(transcript, widgets, setWidgets);
    console.log(message);
    // Optional: trigger a text-to-speech response here
  }, [widgets]);

  const { isListening, startListening, stopListening } = useVoiceRecognition(handleVoiceCommand);

  // Hand Tracking Handlers
  const handleHandMove = useCallback((x, y) => {
    setCursorPos({ x, y });
    // Dispatch native mouse move for react-grid-layout to recognize
    const el = document.elementFromPoint(x, y);
    if (el) {
      const event = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: x,
        clientY: y
      });
      el.dispatchEvent(event);
    }
  }, []);

  const handlePinch = useCallback((pinching, x, y) => {
    setIsPinching(pinching);
    const el = document.elementFromPoint(x, y);
    if (el) {
      // Simulate mouse down or up based on pinch state
      const eventType = pinching ? 'mousedown' : 'mouseup';
      const event = new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
      });
      el.dispatchEvent(event);
    }
  }, []);

  const { isCameraOn, startCamera, stopCamera } = useHandTracking(videoRef, handleHandMove, handlePinch);

  return (
    <div>
      <div className="status-bar">
        <span>VOICE: {isListening ? <span className="listening">LISTENING</span> : 'IDLE'}</span>
        <span>HAND CAM: {isCameraOn ? <span className="listening">ACTIVE</span> : 'OFF'}</span>
        <button onClick={isListening ? stopListening : startListening}>
          {isListening ? 'Stop Voice' : 'Start Voice'}
        </button>
        <button onClick={isCameraOn ? stopCamera : startCamera}>
          {isCameraOn ? 'Stop Camera' : 'Start Camera'}
        </button>
      </div>

      <Dashboard widgets={widgets} layout={layout} setLayout={setLayout} />
      
      <HandOverlay videoRef={videoRef} />
      <VirtualCursor x={cursorPos.x} y={cursorPos.y} isPinching={isPinching} />
    </div>
  );
}