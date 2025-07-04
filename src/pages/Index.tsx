import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cpu, 
  HardDrive, 
  Thermometer, 
  Battery, 
  Sun, 
  Wifi, 
  Camera, 
  Mic, 
  Glasses,
  Brain,
  Zap,
  Network,
  Settings,
  Shield,
  FileText
} from 'lucide-react';
import VoiceAgent from '@/components/VoiceAgent';
import ClusterManager from '@/components/ClusterManager';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAgentStore } from '@/store/agentStore';

interface SystemStatus {
  cpu: number;
  memory: number;
  temperature: number;
  battery: number;
  solar: number;
  wifi: boolean;
  camera: boolean;
  microphone: boolean;
  smartGlasses: boolean;
}

const Index = () => {
  const {
    systemStatus,
    agentActive,
    currentMode,
    auditLogs,
    setSystemStatus,
    setAgentActive,
    setCurrentMode
  } = useAgentStore();

  useEffect(() => {
    // Simulate real-time system monitoring
    const interval = setInterval(() => {
      setSystemStatus({
        cpu: Math.max(20, Math.min(90, systemStatus.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(95, systemStatus.memory + (Math.random() - 0.5) * 5)),
        temperature: Math.max(40, Math.min(70, systemStatus.temperature + (Math.random() - 0.5) * 3)),
        battery: Math.max(0, Math.min(100, systemStatus.battery - 0.1)),
        solar: Math.max(0, Math.min(100, systemStatus.solar + (Math.random() - 0.5) * 20)),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [systemStatus, setSystemStatus]);

  const connectSmartGlasses = () => {
    console.log('Attempting to connect smart glasses...');
    setSystemStatus({ smartGlasses: !systemStatus.smartGlasses });
  };

  const toggleAgent = () => {
    setAgentActive(!agentActive);
    console.log(`Agent ${!agentActive ? 'activated' : 'deactivated'}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Devonn.ai Agent Nexus</h1>
            <p className="text-muted-foreground">Jetson Nano 2GB + Orin Nano Cluster Control</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={agentActive ? "default" : "secondary"} className="text-lg px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              {agentActive ? 'Agent Active' : 'Agent Standby'}
            </Badge>
            <Button onClick={toggleAgent} size="lg">
              {agentActive ? 'Deactivate' : 'Activate'} Agent
            </Button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Cpu className="w-6 h-6 text-blue-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{systemStatus.cpu}%</p>
                  <p className="text-xs text-muted-foreground">CPU</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <HardDrive className="w-6 h-6 text-green-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{systemStatus.memory}%</p>
                  <p className="text-xs text-muted-foreground">Memory</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Thermometer className="w-6 h-6 text-red-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{systemStatus.temperature}°C</p>
                  <p className="text-xs text-muted-foreground">Temp</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Battery className="w-6 h-6 text-orange-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{systemStatus.battery}%</p>
                  <p className="text-xs text-muted-foreground">Battery</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Sun className="w-6 h-6 text-yellow-500" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{systemStatus.solar}%</p>
                  <p className="text-xs text-muted-foreground">Solar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Wifi className={`w-6 h-6 ${systemStatus.wifi ? 'text-green-500' : 'text-red-500'}`} />
                <div className="text-right">
                  <p className="text-lg font-bold">{systemStatus.wifi ? 'ON' : 'OFF'}</p>
                  <p className="text-xs text-muted-foreground">WiFi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Camera className={`w-6 h-6 ${systemStatus.camera ? 'text-green-500' : 'text-red-500'}`} />
                <div className="text-right">
                  <p className="text-lg font-bold">{systemStatus.camera ? 'ON' : 'OFF'}</p>
                  <p className="text-xs text-muted-foreground">Camera</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer" onClick={connectSmartGlasses}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Glasses className={`w-6 h-6 ${systemStatus.smartGlasses ? 'text-green-500' : 'text-gray-400'}`} />
                <div className="text-right">
                  <p className="text-lg font-bold">{systemStatus.smartGlasses ? 'CONN' : 'DISC'}</p>
                  <p className="text-xs text-muted-foreground">Glasses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Control Tabs */}
        <Tabs value={currentMode} onValueChange={(value: any) => setCurrentMode(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Voice Agent
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Visual Agent
            </TabsTrigger>
            <TabsTrigger value="cluster" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Cluster Manager
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security & Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice">
            <ErrorBoundary>
              <VoiceAgent isActive={agentActive} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="visual">
            <ErrorBoundary>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Visual Processing Agent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-muted-foreground">Camera feed will appear here</p>
                        <p className="text-sm text-muted-foreground">Object detection and AR overlay ready</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">Start Object Detection</Button>
                      <Button variant="outline">Enable AR Overlay</Button>
                      <Button variant="outline">Smart Glasses View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="cluster">
            <ErrorBoundary>
              <ClusterManager />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="security">
            <ErrorBoundary>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Audit Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {auditLogs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No audit logs yet
                        </p>
                      ) : (
                        auditLogs.map((log, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                            <div>
                              <p className="font-medium">{log.action}</p>
                              <p className="text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-xs">
                                {JSON.stringify(log.details).slice(0, 50)}...
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ErrorBoundary>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <Settings className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm">System Config</span>
                </div>
              </Button>
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <Network className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm">Network Scan</span>
                </div>
              </Button>
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <Brain className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm">AI Models</span>
                </div>
              </Button>
              <Button variant="outline" className="h-16">
                <div className="text-center">
                  <Glasses className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm">AR Setup</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
