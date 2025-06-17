
export class SecurityService {
  private static instance: SecurityService;
  private encryptionKey: CryptoKey | null = null;

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  async generateEncryptionKey(): Promise<CryptoKey> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    this.encryptionKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    return this.encryptionKey;
  }

  async encryptData(data: string): Promise<{ encrypted: string; iv: string }> {
    const key = await this.generateEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoder.encode(data)
    );

    return {
      encrypted: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join(''),
      iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
    };
  }

  async decryptData(encryptedData: string, ivHex: string): Promise<string> {
    const key = await this.generateEncryptionKey();
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const encrypted = new Uint8Array(encryptedData.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  sanitizeInput(input: string): string {
    // Basic XSS prevention
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  validateCommand(command: string): boolean {
    // Basic command validation
    const allowedPatterns = [
      /^(start|stop|activate|deactivate|connect|disconnect)/i,
      /^(transfer|move|copy|backup)/i,
      /^(scan|search|find|locate)/i,
      /^(check|status|monitor)/i
    ];

    return allowedPatterns.some(pattern => pattern.test(command));
  }

  hashSensitiveData(data: string): string {
    // Simple hash for logging without exposing sensitive data
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}

export const securityService = SecurityService.getInstance();
