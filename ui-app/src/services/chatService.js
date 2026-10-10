const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function sendChatMessage(requestData, history = []) {
  let payload;

  if (typeof requestData === 'object' && requestData !== null) {
    payload = {
      message: requestData.message || requestData.text || '',
      history: (requestData.history || history).map(h => ({ role: h.role, content: h.content })),
      orderDetail: requestData.orderDetail || null,
      startDate: requestData.startDate || null,
      endDate: requestData.endDate || null,
      timezone: requestData.timezone || null,
      selectedClusters: requestData.selectedClusters || []
    };
  } else {
    payload = {
      message: String(requestData),
      history: history.map(h => ({ role: h.role, content: h.content }))
    };
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.title || errorDetail;
    } catch (e) {
      // JSON parse failed, ignore
    }
    throw new Error(errorDetail);
  }

  return await response.json();
}
