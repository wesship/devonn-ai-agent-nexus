
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bluetooth, 
  Glasses,
  Zap,
  MessageSquare,
  Settings
} from 'lucide-react';

interface VoiceAgentProps {
  isActive: boolean;
}

interface VoiceCommand {
  id: string;
  timestamp: string;
  command: string;
  confidence: number;
  status: 'processing' | 'completed' | 'failed';
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ isActive }) => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [ohoConnected, setOhoConnected] = useState(false);
  const [whisperStatus, setWhisperStatus] = useState<'idle' | 'processing' | 'ready'>('idle');
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [currentCommand, setCurrentCommand] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Simulate real-time audio level monitoring when listening
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  useEffect(() => {
    // Initialize Whisper status when agent becomes active
    if (isActive) {
      setWhisperStatus('ready');
      console.log('Voice Agent activated - Whisper.cpp ready');
    } else {
      setWhisperStatus('idle');
      stopListening();
    }
  }, [isActive]);

  const startListening = async () => {
    if (!isActive) return;
    
    try {
      console.log('Starting voice listening...');
      setIsListening(true);
      setWhisperStatus('processing');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create audio context for level monitoring
      audioContextRef.current = new AudioContext();
      const analyser = audioContextRef.current.createAnalyser();
      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      // Simulate voice command detection
      setTimeout(() => {
        if (isListening) {
          simulateVoiceCommand();
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsListening(false);
      setWhisperStatus('ready');
    }
  };

  const stopListening = () => {
    console.log('Stopping voice listening...');
    setIsListening(false);
    setWhisperStatus('ready');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const simulateVoiceCommand = () => {
    const commands = [
      'transfer files',
      'activate cluster',
      'check system status',
      'start visual agent',
      'connect smart glasses',
      'run network scan'
    ];
    
    const command = commands[Math.floor(Math.random() * commands.length)];
    const newCommand: VoiceCommand = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      command,
      confidence: Math.random() * 30 + 70, // 70-100% confidence
      status: 'processing'
    };
    
    setCurrentCommand(command);
    setCommandHistory(prev => [newCommand, ...prev.slice(0, 4)]);
    
    // Simulate command processing via Flask API
    console.log(`Voice command detected: "${command}"`);
    console.log('Sending to Flask API: http://localhost:5001/command');
    
    // Simulate MQTT publish
    setTimeout(() => {
      console.log(`MQTT published: jetson/voice -> "${command}"`);
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === newCommand.id 
            ? { ...cmd, status: 'completed' } 
            : cmd
        )
      );
      
      if (ttsEnabled) {
        console.log(`TTS Response: "Command ${command} executed"`);
      }
    }, 2000);
    
    stopListening();
  };

  const connectOhoGlasses = () => {
    console.log('Attempting to connect OhO Smart Glasses via Bluetooth...');
    setOhoConnected(!ohoConnected);
    
    if (!ohoConnected) {
      console.log('Bluetooth pairing sequence initiated');
      console.log('Setting OhO as audio input/output device');
    }
  };

  const toggleTTS = () => {
    setTtsEnabled(!ttsEnabled);
    console.log(`TTS ${!ttsEnabled ? 'enabled' : 'disabled'}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Whisper Voice Agent
            <Badge variant={isActive ? "default" : "secondary"}>
              {whisperStatus}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Audio Level Monitor */}
          {isListening && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Audio Level</span>
                <span className="text-sm font-mono">{audioLevel.toFixed(0)}%</span>
              </div>
              <Progress value={audioLevel} className="h-2" />
            </div>
          )}

          {/* Current Command */}
          {currentCommand && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Last Command</p>
              <p className="font-medium">"{currentCommand}"</p>
            </div>
          )}

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={isListening ? stopListening : startListening}
              disabled={!isActive}
              variant={isListening ? "destructive" : "default"}
              className="h-12"
            >
              {isListening ? (
                <><MicOff className="w-4 h-4 mr-2" />Stop Listening</>
              ) : (
                <><Mic className="w-4 h-4 mr-2" />Start Listening</>
              )}
            </Button>

            <Button 
              onClick={connectOhoGlasses}
              variant={ohoConnected ? "default" : "outline"}
              className="h-12"
            >
              <Glasses className="w-4 h-4 mr-2" />
              {ohoConnected ? 'OhO Connected' : 'Connect OhO'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Audio Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Bluetooth className={`w-4 h-4 ${ohoConnected ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className="text-sm">OhO Audio I/O</span>
              </div>
              <Badge variant={ohoConnected ? "default" : "secondary"}>
                {ohoConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {ttsEnabled ? (
                  <Volume2 className="w-4 h-4 text-green-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm">TTS Response</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTTS}
              >
                {ttsEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Command History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {commandHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No voice commands detected yet
              </p>
            ) : (
              commandHistory.map((cmd) => (
                <div key={cmd.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">"{cmd.command}"</p>
                    <p className="text-xs text-muted-foreground">
                      {cmd.timestamp} • {cmd.confidence.toFixed(1)}% confidence
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(cmd.status)}`} />
                    <Badge variant="outline" className="text-xs">
                      {cmd.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Plugin System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-sm font-medium">Flask API</p>
              <p className="text-xs text-muted-foreground">:5001/command</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-sm font-medium">MQTT Broker</p>
              <p className="text-xs text-muted-foreground">jetson/voice</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2" />
              <p className="text-sm font-medium">Node-RED</p>
              <p className="text-xs text-muted-foreground">Plugin Ready</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAgent;
