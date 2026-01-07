import React, { useEffect, useState } from 'react';
import { getSystemSettings, updateSystemSettings } from '../services/db';
import { SystemSettings } from '../types';
import { Input } from '../components/Input';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSystemSettings().then(setSettings);
  }, []);

  const handleChange = (field: keyof SystemSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await updateSystemSettings(settings);
    setSaving(false);
    alert('Settings updated successfully!');
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">System Configuration</h1>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
                label="Academic Session" 
                value={settings.session_year} 
                onChange={(e) => handleChange('session_year', e.target.value)}
                helperText="Current academic year (e.g., 2025/2026)"
            />
            <Input 
                label="Clearance Fee (₦)" 
                type="number"
                value={settings.clearance_fee} 
                onChange={(e) => handleChange('clearance_fee', parseInt(e.target.value))}
            />
            <Input 
                label="Payment Deadline" 
                type="date"
                value={settings.payment_deadline} 
                onChange={(e) => handleChange('payment_deadline', e.target.value)}
            />
        </div>

        <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Paystack Integration (Live Keys)</h3>
            <div className="grid gap-4">
                <Input 
                    label="Public Key" 
                    value={settings.paystack_public_key} 
                    onChange={(e) => handleChange('paystack_public_key', e.target.value)}
                    helperText="Enter your Live Public Key (pk_live_...)"
                />
            </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Toggles</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <span className="font-medium text-gray-700 block">Enable Payments</span>
                        <span className="text-sm text-gray-500">Allow students to make new payments</span>
                    </div>
                    <button 
                        onClick={() => handleChange('payments_enabled', !settings.payments_enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.payments_enabled ? 'bg-green-600' : 'bg-gray-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${settings.payments_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <span className="font-medium text-gray-700 block">Enable Submissions</span>
                        <span className="text-sm text-gray-500">Allow students to submit final clearance forms</span>
                    </div>
                    <button 
                         onClick={() => handleChange('submissions_enabled', !settings.submissions_enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.submissions_enabled ? 'bg-green-600' : 'bg-gray-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${settings.submissions_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </div>

        <div className="pt-6">
            <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center justify-center"
            >
                {saving ? 'Saving...' : 'Save Configuration'}
            </button>
        </div>
      </div>
    </div>
  );
};