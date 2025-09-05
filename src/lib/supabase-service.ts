import { supabase } from '@/integrations/supabase/client';

export class SupabaseService {
  // Cases
  static async getAllCases() {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createCase(caseData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('cases')
      .insert({
        ...caseData,
        created_by: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateCase(id: string, updates: any) {
    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteCase(id: string) {
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Victims
  static async getAllVictims() {
    const { data, error } = await supabase
      .from('victims')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createVictim(victimData: any) {
    const { data, error } = await supabase
      .from('victims')
      .insert(victimData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateVictim(id: string, updates: any) {
    const { data, error } = await supabase
      .from('victims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteVictim(id: string) {
    const { error } = await supabase
      .from('victims')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Suspects
  static async getAllSuspects() {
    const { data, error } = await supabase
      .from('suspects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createSuspect(suspectData: any) {
    const { data, error } = await supabase
      .from('suspects')
      .insert(suspectData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateSuspect(id: string, updates: any) {
    const { data, error } = await supabase
      .from('suspects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteSuspect(id: string) {
    const { error } = await supabase
      .from('suspects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Evidence
  static async getAllEvidence() {
    const { data, error } = await supabase
      .from('evidence')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createEvidence(evidenceData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('evidence')
      .insert({
        ...evidenceData,
        collected_by: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateEvidence(id: string, updates: any) {
    const { data, error } = await supabase
      .from('evidence')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteEvidence(id: string) {
    const { error } = await supabase
      .from('evidence')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Users
  static async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Audit Logs
  static async getAllAuditLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return data || [];
  }

  static async createAuditLog(logData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        ...logData,
        user_id: user.id
      });
    
    if (error) console.error('Audit log error:', error);
  }

  // Reports
  static async getAllReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('generated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createReport(reportData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...reportData,
        generated_by: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Dashboard Stats
  static async getDashboardStats() {
    const [casesResult, victimsResult, evidenceResult, auditResult] = await Promise.all([
      supabase.from('cases').select('status, priority'),
      supabase.from('victims').select('id'),
      supabase.from('evidence').select('type'),
      supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(10)
    ]);

    const cases = casesResult.data || [];
    const victims = victimsResult.data || [];
    const evidence = evidenceResult.data || [];
    const recentActivity = auditResult.data || [];

    const casesByStatus = cases.reduce((acc: any, c: any) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const casesByPriority = cases.reduce((acc: any, c: any) => {
      acc[c.priority] = (acc[c.priority] || 0) + 1;
      return acc;
    }, {});

    const evidenceByType = evidence.reduce((acc: any, e: any) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCases: cases.length,
      openCases: cases.filter((c: any) => c.status === 'open').length,
      closedCases: cases.filter((c: any) => c.status === 'closed').length,
      activeCases: cases.filter((c: any) => c.status === 'active').length,
      totalVictims: victims.length,
      totalEvidence: evidence.length,
      recentActivity,
      casesByStatus,
      casesByPriority,
      evidenceByType
    };
  }
}