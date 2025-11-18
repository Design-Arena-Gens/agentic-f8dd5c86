'use client';

import { useState } from 'react';
import axios from 'axios';

interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

export default function Home() {
  const [formUrl, setFormUrl] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [autoFillLoading, setAutoFillLoading] = useState(false);

  const parseGoogleForm = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setFormFields([]);
    setFormData({});

    try {
      const response = await axios.post('/api/parse-form', { url: formUrl });
      setFormFields(response.data.fields);
      setSuccess('Form parsed successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to parse form');
    } finally {
      setLoading(false);
    }
  };

  const autoFillForm = async () => {
    setAutoFillLoading(true);
    try {
      const response = await axios.post('/api/auto-fill', { fields: formFields });
      setFormData(response.data.data);
      setSuccess('Form auto-filled with sample data!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to auto-fill form');
    } finally {
      setAutoFillLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const submitForm = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/submit-form', {
        url: formUrl,
        data: formData,
        fields: formFields
      });
      setSuccess('Form submitted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Google Forms Filler</h1>
          <p className="text-gray-600 mb-8">Automatically fill out Google Forms with ease</p>

          {/* URL Input Section */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Google Form URL
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/e/..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <button
                onClick={parseGoogleForm}
                disabled={loading || !formUrl}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Parsing...' : 'Parse Form'}
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Form Fields */}
          {formFields.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Form Fields</h2>
                <button
                  onClick={autoFillForm}
                  disabled={autoFillLoading}
                  className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {autoFillLoading ? 'Filling...' : 'Auto-Fill'}
                </button>
              </div>

              {formFields.map((field) => (
                <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="Enter your answer"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      rows={4}
                      placeholder="Enter your answer"
                    />
                  )}

                  {field.type === 'email' && (
                    <input
                      type="email"
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="your.email@example.com"
                    />
                  )}

                  {field.type === 'radio' && field.options && (
                    <div className="space-y-2">
                      {field.options.map((option, idx) => (
                        <label key={idx} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={field.id}
                            value={option}
                            checked={formData[field.id] === option}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="w-4 h-4 text-indigo-600"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === 'checkbox' && field.options && (
                    <div className="space-y-2">
                      {field.options.map((option, idx) => (
                        <label key={idx} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            value={option}
                            checked={(formData[field.id] || []).includes(option)}
                            onChange={(e) => {
                              const current = formData[field.id] || [];
                              const updated = e.target.checked
                                ? [...current, option]
                                : current.filter((v: string) => v !== option);
                              handleInputChange(field.id, updated);
                            }}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === 'select' && field.options && (
                    <select
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select an option</option>
                      {field.options.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

              <button
                onClick={submitForm}
                disabled={loading}
                className="w-full px-6 py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                {loading ? 'Submitting...' : 'Submit Form'}
              </button>
            </div>
          )}

          {/* Instructions */}
          {formFields.length === 0 && !loading && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How to use:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Paste a Google Forms URL in the field above</li>
                <li>Click "Parse Form" to extract the form fields</li>
                <li>Fill out the form manually or click "Auto-Fill" for sample data</li>
                <li>Click "Submit Form" to send your responses</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
