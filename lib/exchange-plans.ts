// Helper functions for exchange plans

export interface ExchangePlan {
  id?: number;
  user_id?: number;
  university_id?: number;
  plan_name?: string;
  university_name: string;
  country?: string;
  semester?: string;
  exchange_year?: number;
  duration?: number;
  selected_courses?: any[];
  notes?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'completed';
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SavedCourse {
  course_code: string;
  course_name: string;
  ects_points?: number;
  semester?: string;
  replaces_course_code?: string;
  replaces_course_name?: string;
  notes?: string;
}

// Save a new exchange plan
export async function saveExchangePlan(plan: ExchangePlan): Promise<any> {
  const response = await fetch('/api/exchange-plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save plan');
  }

  return response.json();
}

// Update an existing plan
export async function updateExchangePlan(planId: number, updates: Partial<ExchangePlan>): Promise<any> {
  const response = await fetch(`/api/exchange-plans?id=${planId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update plan');
  }

  return response.json();
}

// Get all plans for current user
export async function getUserPlans(): Promise<any> {
  const response = await fetch('/api/exchange-plans');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch plans');
  }

  return response.json();
}

// Get a specific plan
export async function getPlan(planId: number): Promise<any> {
  const response = await fetch(`/api/exchange-plans?id=${planId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch plan');
  }

  return response.json();
}

// Delete a plan
export async function deletePlan(planId: number): Promise<any> {
  const response = await fetch(`/api/exchange-plans?id=${planId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete plan');
  }

  return response.json();
}
