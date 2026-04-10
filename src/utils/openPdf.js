/**
 * openPdf — Secure PDF viewer utility
 *
 * Fetches a PDF through our backend proxy (JWT-authenticated),
 * creates a temporary blob URL, and opens it in a new tab.
 *
 * Usage:
 *   import { openPdf } from '../utils/openPdf';
 *   <button onClick={() => openPdf(`/files/question-paper/${exam._id}`)}>View</button>
 */

import api from '../api/axios';

/**
 * @param {string} apiPath - Relative API path, e.g. '/files/question-paper/abc123'
 * @param {Function} [setLoading] - Optional state setter to show a loading spinner
 */
export async function openPdf(apiPath, setLoading) {
  if (setLoading) setLoading(true);
  try {
    const response = await api.get(apiPath, { responseType: 'blob' });
    const blob     = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl  = URL.createObjectURL(blob);

    const win = window.open(blobUrl, '_blank');
    if (!win) {
      // Popup blocked — create a temporary link and click it
      const link = document.createElement('a');
      link.href     = blobUrl;
      link.target   = '_blank';
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Revoke blob URL after 2 minutes to free memory
    setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000);
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to load PDF. Please try again.';
    alert(msg);
  } finally {
    if (setLoading) setLoading(false);
  }
}
