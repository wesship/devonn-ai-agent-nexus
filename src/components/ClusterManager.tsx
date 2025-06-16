
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, HardDrive, Thermometer, Wifi, Zap, Users, Activity } from 'lucide-react';

interface ClusterNode {
  id: string;
  name: string;
  type: 'jetson-nano-2gb' | 'orin-nano';
  ip: string;
  status: 'online' | 'offline' | 'busy';
  cpu: number;
  memory: number;
  temperature: number;
  power: number;
  workload?: string;
  lastSeen: string;
}

const ClusterManager = () => {
  const [nodes, setNodes] = useState<ClusterNode[]>([
    {
      id: 'node-1',
      name: 'Jetson-Primary',
      type: 'jetson-nano-2gb',
      ip: '192.168.1.100',
      status: 'online',
      cpu: 45,
      memory: 78,
      temperature: 52,
      power: 85,
      workload: 'Voice Processing',
      lastSeen: new Date().toISOString(),
    },
    {
      id: 'node-2',
      name: 'Orin-Worker-1',
      type: 'orin-nano',
      ip: '192.168.1.101',
      status: 'online',
      cpu: 32,
      memory: 56,
      temperature: 48,
      power: 92,
      workload: 'Vision Processing',
      lastSeen: new Date().toISOString(),
    },
  ]);

  const [isScanning, setIsScanning] = useState(false);

  const scanForNodes = async () => {
    setIsScanning(true);
    console.log('Scanning for cluster nodes...');
    
    // Simulate network scan
    setTimeout(() => {
      console.log('Network scan completed');
      setIsScanning(false);
    }, 3000);
  };

  const getNodeSpecs = (type: string) => {
    switch (type) {
      case 'jetson-nano-2gb':
        return {
          cpu: 'Quad-core ARM Cortex-A57',
          gpu: '128-core Maxwell',
          memory: '2GB LPDDR4',
          ai: 'Medium AI workloads',
        };
      case 'orin-nano':
        return {
          cpu: '6-core ARM Cortex-A78AE',
          gpu: '1024-core Ampere',
          memory: '8GB LPDDR5',
          ai: 'Heavy AI workloads',
        };
      default:
        return { cpu: 'Unknown', gpu: 'Unknown', memory: 'Unknown', ai: 'Unknown' };
    }
  };

  const distributeWorkload = (workload: string) => {
    console.log(`Distributing workload: ${workload}`);
    // Find best available node based on current load
    const availableNodes = nodes.filter(node => node.status === 'online');
    const leastLoaded = availableNodes.reduce((prev, current) => 
      (prev.cpu + prev.memory) < (current.cpu + current.memory) ? prev : current
    );
    
    console.log(`Assigning to node: ${leastLoaded.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Cluster Manager</h2>
        <div className="flex gap-2">
          <Button onClick={scanForNodes} disabled={isScanning}>
            {isScanning ? 'Scanning...' : 'Scan Network'}
          </Button>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Users className="w-4 h-4 mr-1" />
            {nodes.length} Nodes
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nodes">Node Details</TabsTrigger>
          <TabsTrigger value="workloads">Workload Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {nodes.map((node) => (
              <Card key={node.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm">{node.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {node.type === 'jetson-nano-2gb' ? 'Jetson Nano 2GB' : 'Orin Nano'}
                      </p>
                    </div>
                    <Badge 
                      variant={node.status === 'online' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {node.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center">
                        <Cpu className="w-3 h-3 mr-1" />
                        CPU
                      </span>
                      <span>{node.cpu}%</span>
                    </div>
                    <Progress value={node.cpu} className="h-1" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center">
                        <HardDrive className="w-3 h-3 mr-1" />
                        Memory
                      </span>
                      <span>{node.memory}%</span>
                    </div>
                    <Progress value={node.memory} className="h-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <Thermometer className="w-3 h-3 mr-1" />
                      {node.temperature}°C
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {node.power}%
                    </div>
                  </div>

                  {node.workload && (
                    <div className="text-xs p-2 bg-blue-50 rounded">
                      <Activity className="w-3 h-3 inline mr-1" />
                      {node.workload}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nodes" className="space-y-4">
          {nodes.map((node) => {
            const specs = getNodeSpecs(node.type);
            return (
              <Card key={node.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      {node.name}
                      <Badge variant="outline">{node.ip}</Badge>
                    </CardTitle>
                    <Badge variant={node.status === 'online' ? 'default' : 'destructive'}>
                      {node.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Hardware Specs</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>CPU:</strong> {specs.cpu}</p>
                        <p><strong>GPU:</strong> {specs.gpu}</p>
                        <p><strong>Memory:</strong> {specs.memory}</p>
                        <p><strong>AI Capability:</strong> {specs.ai}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Current Status</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>CPU Usage</span>
                            <span>{node.cpu}%</span>
                          </div>
                          <Progress value={node.cpu} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Memory Usage</span>
                            <span>{node.memory}%</span>
                          </div>
                          <Progress value={node.memory} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="workloads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workload Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => distributeWorkload('Voice Processing')}
                    className="h-20"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Voice Processing</div>
                      <div className="text-xs">Whisper.cpp + TTS</div>
                    </div>
                  </Button>
                  <Button 
                    onClick={() => distributeWorkload('Vision Processing')}
                    className="h-20"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Vision Processing</div>
                      <div className="text-xs">YOLO + OpenCV</div>
                    </div>
                  </Button>
                  <Button 
                    onClick={() => distributeWorkload('LLM Inference')}
                    className="h-20"
                  >
                    <div className="text-center">
                      <div className="font-semibold">LLM Inference</div>
                      <div className="text-xs">Local Language Model</div>
                    </div>
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Active Workloads</h4>
                  {nodes
                    .filter(node => node.workload)
                    .map(node => (
                      <div key={node.id} className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2">
                        <span>{node.workload}</span>
                        <span className="text-sm text-muted-foreground">
                          → {node.name} ({node.type})
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClusterManager;
