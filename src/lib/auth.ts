// Authentication System for Case Investigation Manager

import { User, AuditLog } from '@/types';

const STORAGE_KEYS = {
  CURRENT_USER: 'cim_current_user',
  USERS: 'cim_users',
  AUDIT_LOGS: 'cim_audit_logs'
};

// Default admin user
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  email: 'admin@cim.gov',
  role: 'admin',
  firstName: 'System',
  lastName: 'Administrator',
  createdAt: new Date('2024-01-01'),
  lastLogin: undefined,
  isActive: true
};

export class AuthService {
  
  static initializeSystem() {
    // Initialize with default admin if no users exist
    const existingUsers = this.getAllUsers();
    if (existingUsers.length === 0) {
      this.seedDefaultAdmin();
    }
  }

  static seedDefaultAdmin() {
    const users = [DEFAULT_ADMIN];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    console.log('🔐 Default admin seeded: admin / Admin@123');
  }

  static async login(username: string, password: string): Promise<User> {
    const users = this.getAllUsers();
    
    // Check for default admin
    if (username === 'admin' && password === 'Admin@123') {
      const admin = users.find(u => u.username === 'admin') || DEFAULT_ADMIN;
      admin.lastLogin = new Date();
      
      // Update users array
      const updatedUsers = users.filter(u => u.id !== admin.id);
      updatedUsers.push(admin);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      
      // Set current user
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(admin));
      
      // Log the login
      this.logActivity(admin.id, 'LOGIN', 'user', admin.id, { username });
      
      return admin;
    }

    // Check for other users with hashed passwords (in real app)
    const user = users.find(u => u.username === username && u.isActive);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // For demo purposes, accept any password for non-admin users
    // In production, implement proper password hashing
    user.lastLogin = new Date();
    
    const updatedUsers = users.filter(u => u.id !== user.id);
    updatedUsers.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    
    this.logActivity(user.id, 'LOGIN', 'user', user.id, { username });
    
    return user;
  }

  static logout() {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.logActivity(currentUser.id, 'LOGOUT', 'user', currentUser.id, {});
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  static getCurrentUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userData) return null;
    
    try {
      const user = JSON.parse(userData);
      // Convert date strings back to Date objects
      user.createdAt = new Date(user.createdAt);
      if (user.lastLogin) user.lastLogin = new Date(user.lastLogin);
      return user;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static hasRole(requiredRole: User['role']): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const roleHierarchy = {
      viewer: 1,
      analyst: 2,
      investigator: 3,
      admin: 4
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  static getAllUsers(): User[] {
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!usersData) return [];
    
    try {
      const users = JSON.parse(usersData);
      return users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
      }));
    } catch {
      return [];
    }
  }

  static createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getAllUsers();
    
    // Check if username already exists
    if (users.some(u => u.username === userData.username)) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.logActivity(currentUser.id, 'CREATE', 'user', newUser.id, { 
        username: newUser.username, 
        role: newUser.role 
      });
    }
    
    return newUser;
  }

  static updateUser(userId: string, updates: Partial<User>): User {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.logActivity(currentUser.id, 'UPDATE', 'user', userId, updates);
    }
    
    return updatedUser;
  }

  static deleteUser(userId: string): void {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
    
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.logActivity(currentUser.id, 'DELETE', 'user', userId, {});
    }
  }

  static logActivity(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    details: Record<string, any>
  ): void {
    const logs = this.getAuditLogs();
    
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date(),
      ipAddress: 'localhost' // In production, get real IP
    };

    logs.push(newLog);
    
    // Keep only last 1000 logs to prevent storage overflow
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  static getAuditLogs(): AuditLog[] {
    const logsData = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!logsData) return [];
    
    try {
      const logs = JSON.parse(logsData);
      return logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    } catch {
      return [];
    }
  }
}
