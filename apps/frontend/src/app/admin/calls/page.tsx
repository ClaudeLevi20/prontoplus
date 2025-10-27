'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Call, DemoLead, CallStatus, LeadInterest } from '@/lib/api-types';

interface CallFilters {
  status?: CallStatus;
  direction?: 'INBOUND' | 'OUTBOUND';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface AnalyticsData {
  calls: {
    total: number;
    completed: number;
    averageDuration: number;
    completionRate: number;
  };
  leads: {
    totalLeads: number;
    capturedLeads: number;
    captureRate: number;
    interestBreakdown: {
      hot: number;
      warm: number;
      cold: number;
      unqualified: number;
    };
  };
}

export default function AdminCallsPage() {
  const [calls, setCalls] = useState<(Call & { demoLead?: DemoLead })[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CallFilters>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
  });
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  // Load calls and analytics
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [callsResponse, analyticsResponse] = await Promise.all([
        apiClient.calls.getAll(filters),
        apiClient.calls.getAnalytics({
          startDate: filters.startDate,
          endDate: filters.endDate,
        }),
      ]);

      setCalls(callsResponse.calls);
      setPagination({
        total: callsResponse.total,
        page: callsResponse.page,
        limit: callsResponse.limit,
      });
      setAnalytics(analyticsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<CallFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const updateLeadInterest = async (leadId: string, interestLevel: LeadInterest) => {
    try {
      await apiClient.leads.updateInterest(leadId, interestLevel);
      // Reload data to reflect changes
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead interest');
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeColor = (status: CallStatus): string => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ANSWERED':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'NO_ANSWER':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterestBadgeColor = (interest?: LeadInterest): string => {
    switch (interest) {
      case 'HOT':
        return 'bg-red-100 text-red-800';
      case 'WARM':
        return 'bg-yellow-100 text-yellow-800';
      case 'COLD':
        return 'bg-blue-100 text-blue-800';
      case 'UNQUALIFIED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Call Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor demo calls and lead capture performance</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Calls</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.calls.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completion Rate</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.calls.completionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg Duration</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatDuration(analytics.calls.averageDuration)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Lead Capture Rate</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.leads.captureRate.toFixed(1)}%</p>
            </div>
            
            {/* Add Lead Quality Distribution Card */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Lead Quality
              </h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">🔥 Hot</span>
                  <span className="font-bold text-red-600">
                    {analytics.leads.interestBreakdown.hot}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">⚡ Warm</span>
                  <span className="font-bold text-yellow-600">
                    {analytics.leads.interestBreakdown.warm}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">❄️ Cold</span>
                  <span className="font-bold text-blue-600">
                    {analytics.leads.interestBreakdown.cold}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value as CallStatus || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="INITIATED">Initiated</option>
                <option value="RINGING">Ringing</option>
                <option value="ANSWERED">Answered</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="BUSY">Busy</option>
                <option value="NO_ANSWER">No Answer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              <select
                value={filters.direction || ''}
                onChange={(e) => handleFilterChange({ direction: e.target.value as 'INBOUND' | 'OUTBOUND' || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Directions</option>
                <option value="INBOUND">Inbound</option>
                <option value="OUTBOUND">Outbound</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Calls Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Calls</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {call.phoneNumber || 'Unknown'}
                        </div>
                        {call.callerName && (
                          <div className="text-sm text-gray-500">{call.callerName}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(call.status)}`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(call.callDuration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(call.startedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {call.demoLead ? (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {call.demoLead.leadScore}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">/100</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {call.demoLead ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInterestBadgeColor(call.demoLead.interestLevel)}`}>
                          {call.demoLead.interestLevel || 'Not Set'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No Lead</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedCall(call)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View Details
                      </button>
                      {call.demoLead && (
                        <div className="inline-flex space-x-1">
                          <button
                            onClick={() => updateLeadInterest(call.demoLead!.id, 'HOT')}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Hot
                          </button>
                          <button
                            onClick={() => updateLeadInterest(call.demoLead!.id, 'WARM')}
                            className="text-yellow-600 hover:text-yellow-900 text-xs"
                          >
                            Warm
                          </button>
                          <button
                            onClick={() => updateLeadInterest(call.demoLead!.id, 'COLD')}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Cold
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call Details Modal */}
        {selectedCall && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Call Details</h3>
                  <button
                    onClick={() => setSelectedCall(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Caller</label>
                    <p className="text-sm text-gray-900">{selectedCall.phoneNumber || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedCall.status)}`}>
                      {selectedCall.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <p className="text-sm text-gray-900">{formatDuration(selectedCall.callDuration)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Started</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedCall.startedAt)}</p>
                  </div>
                </div>
                
                {selectedCall.recordingUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recording</label>
                    <audio controls className="w-full">
                      <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                {selectedCall.demoLead && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lead Information</label>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Name</label>
                          <p className="text-sm text-gray-900">{selectedCall.demoLead.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Email</label>
                          <p className="text-sm text-gray-900">{selectedCall.demoLead.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Practice</label>
                          <p className="text-sm text-gray-900">{selectedCall.demoLead.practiceName || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Interest Level</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInterestBadgeColor(selectedCall.demoLead.interestLevel)}`}>
                            {selectedCall.demoLead.interestLevel || 'Not Set'}
                          </span>
                        </div>
                      </div>
                      {selectedCall.demoLead.notes && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-600">Notes</label>
                          <p className="text-sm text-gray-900">{selectedCall.demoLead.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
