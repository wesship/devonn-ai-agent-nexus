
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: PluginPermission[];
  triggers: PluginTrigger[];
}

export interface PluginPermission {
  type: 'voice' | 'system' | 'network' | 'storage' | 'camera' | 'microphone';
  description: string;
}

export interface PluginTrigger {
  type: 'voice_command' | 'system_event' | 'schedule' | 'sensor_data';
  pattern?: string;
  schedule?: string;
  conditions?: Record<string, any>;
}

export interface PluginContext {
  executeCommand: (command: string) => Promise<any>;
  getSystemStatus: () => Promise<any>;
  sendNotification: (message: string, type?: 'info' | 'warning' | 'error') => void;
  storeData: (key: string, value: any) => Promise<void>;
  retrieveData: (key: string) => Promise<any>;
  log: (message: string, level?: 'debug' | 'info' | 'warn' | 'error') => void;
}

export abstract class BasePlugin {
  protected manifest: PluginManifest;
  protected context: PluginContext;

  constructor(manifest: PluginManifest, context: PluginContext) {
    this.manifest = manifest;
    this.context = context;
  }

  abstract onActivate(): Promise<void>;
  abstract onDeactivate(): Promise<void>;
  abstract onTrigger(trigger: PluginTrigger, data: any): Promise<any>;

  getManifest(): PluginManifest {
    return this.manifest;
  }

  protected async requestPermission(permission: PluginPermission): Promise<boolean> {
    // In a real implementation, this would show a permission dialog
    console.log(`Plugin ${this.manifest.name} requesting permission: ${permission.type}`);
    return true;
  }
}

export class PluginManager {
  private plugins: Map<string, BasePlugin> = new Map();
  private activePlugins: Set<string> = new Set();

  async loadPlugin(plugin: BasePlugin): Promise<boolean> {
    try {
      const manifest = plugin.getManifest();
      
      // Validate plugin
      if (this.plugins.has(manifest.id)) {
        throw new Error(`Plugin ${manifest.id} already loaded`);
      }

      this.plugins.set(manifest.id, plugin);
      console.log(`Plugin ${manifest.name} loaded successfully`);
      return true;
    } catch (error) {
      console.error('Failed to load plugin:', error);
      return false;
    }
  }

  async activatePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`Plugin ${pluginId} not found`);
      return false;
    }

    try {
      await plugin.onActivate();
      this.activePlugins.add(pluginId);
      console.log(`Plugin ${pluginId} activated`);
      return true;
    } catch (error) {
      console.error(`Failed to activate plugin ${pluginId}:`, error);
      return false;
    }
  }

  async deactivatePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`Plugin ${pluginId} not found`);
      return false;
    }

    try {
      await plugin.onDeactivate();
      this.activePlugins.delete(pluginId);
      console.log(`Plugin ${pluginId} deactivated`);
      return true;
    } catch (error) {
      console.error(`Failed to deactivate plugin ${pluginId}:`, error);
      return false;
    }
  }

  async triggerPlugins(trigger: PluginTrigger, data: any): Promise<void> {
    for (const pluginId of this.activePlugins) {
      const plugin = this.plugins.get(pluginId);
      if (plugin) {
        const manifest = plugin.getManifest();
        const matchingTriggers = manifest.triggers.filter(t => t.type === trigger.type);
        
        for (const pluginTrigger of matchingTriggers) {
          try {
            await plugin.onTrigger(pluginTrigger, data);
          } catch (error) {
            console.error(`Plugin ${pluginId} trigger failed:`, error);
          }
        }
      }
    }
  }

  getLoadedPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values()).map(p => p.getManifest());
  }

  getActivePlugins(): PluginManifest[] {
    return Array.from(this.activePlugins)
      .map(id => this.plugins.get(id))
      .filter(p => p)
      .map(p => p!.getManifest());
  }
}

export const pluginManager = new PluginManager();
