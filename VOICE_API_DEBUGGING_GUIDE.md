# Voice API Integration - Debugging Guide

## Issue Identified and Fixed

The voice API call in the new wf-nfw-ui was not working despite being identical to the old app. The issue was with how FormData was being sent to the LLM service.

## Root Cause

### The Problem with FormData Content-Type

When using axios with FormData objects, **you must NOT manually set the `Content-Type` header**. Here's why:

```javascript
// ❌ WRONG - Causes the request to fail
const response = await axios.post(url, formData, {
  headers: {
    'Content-Type': 'multipart/form-data', // No boundary!
  },
});

// ✅ CORRECT - Let axios set the Content-Type automatically
const response = await axios.post(url, formData);
```

When you manually set `'Content-Type': 'multipart/form-data'`, axios uses that header as-is. However, multipart/form-data requires a `boundary` parameter to separate file parts. The correct Content-Type header should look like:

```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
```

When you let axios handle it automatically, it:
1. Detects that data is a FormData object
2. Generates a unique boundary
3. Sets the complete Content-Type header with the boundary

## Solution Implemented

### 1. Fixed apiClient.js postFormData method

```javascript
// BEFORE (Broken)
async postFormData(url, formData, config = {}) {
  const response = await this.instance.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data', // ❌ No boundary
    },
  });
  return response.data;
}

// AFTER (Fixed)
async postFormData(url, formData, config = {}) {
  const { headers = {}, ...restConfig } = config;
  
  // Remove Content-Type header - let axios set it with proper boundary
  const { 'Content-Type': _, ...safeHeaders } = headers;
  
  const response = await this.instance.post(url, formData, {
    ...restConfig,
    headers: safeHeaders,
  });
  return response.data;
}
```

**Key change**: We now explicitly remove any manually-set Content-Type header and let axios auto-detect and properly configure it for FormData.

### 2. Enhanced Debugging Logging

Added comprehensive logging at multiple levels:

#### In voiceService.js
```javascript
console.log('[VoiceService] Starting audio processing');
console.log('[VoiceService] AudioBlob info:', { size, type });
console.log('[VoiceService] Sending request to /process-audio');
console.log('[VoiceService] Success response received:', response);
console.log('[VoiceService] Error during processing:', error);
```

#### In apiClient.js postFormData
```javascript
console.log('[ApiClient] postFormData called for:', url);
console.log('[ApiClient] Safe headers:', safeHeaders);
console.log('[ApiClient] Making POST request to:', baseURL + url);
console.log('[ApiClient] Response received:', status, data);
console.log('[ApiClient] Request error:', error.message);
```

#### In VoiceInputPanel.jsx
```javascript
console.log('Starting audio processing...');
console.log('Audio blob size:', audioBlob.size, 'bytes');
console.log('Audio blob type:', audioBlob.type);
console.log('Full response:', response);
console.error('Error object:', err);
console.error('Error response:', err?.response);
console.error('Error config:', err?.config);
```

## Debugging the API Call

When the voice feature isn't working, check the browser console (F12) for logged messages:

### Expected Success Flow
```
[VoiceService] Starting audio processing
[VoiceService] AudioBlob info: {size: 12345, type: 'audio/webm'}
[VoiceService] FormData prepared, file size: 12345
[VoiceService] Sending request to /process-audio
[ApiClient] postFormData called for: /process-audio
[ApiClient] Safe headers: {...}
[ApiClient] Making POST request to: http://localhost:8000/process-audio
[ApiClient] Response received: 200 {...}
[VoiceService] Success response received: {...}
=== LLM API Response ===
Full response: {...}
Transcript: "spoken text..."
Metadata: {items: [...]}
```

### Common Errors and Fixes

#### Error 1: Network Error / CORS Error
```
Error message: "Network error - no response received"
Solution: Check if LLM service is running on http://localhost:8000
Fix: npm run dev in wf-nfw-llm-services folder
```

#### Error 2: 400 Bad Request
```
Error response: 400 {detail: "Invalid file format"}
Solution: Ensure audio blob is valid webm format
Check: Audio blob size > 0, type includes 'audio'
```

#### Error 3: 500 Server Error
```
Error response: 500 {error: "Processing failed"}
Solution: Check LLM service logs for detailed error
Fix: Review LLM service implementation
```

#### Error 4: FormData Content-Type Error
```
Symptom: Request is sent but LLM service doesn't receive file properly
Cause: Manually set Content-Type without boundary
Fix: Already applied - use postFormData method properly
```

## Files Modified

1. **wf-nfw-ui/src/services/api/apiClient.js**
   - Fixed postFormData to not force Content-Type header
   - Added detailed logging for debugging

2. **wf-nfw-ui-Nargis/src/services/api/apiClient.js**
   - Applied same fix for consistency

3. **wf-nfw-ui/src/services/api/voiceService.js**
   - Added logging to track audio processing flow

4. **wf-nfw-ui/src/components/driver/VoiceInputPanel.jsx**
   - Enhanced error logging and debugging
   - Better error message extraction

## Environment Configuration

Ensure .env file has correct LLM service URL:

```env
VITE_LLM_SERVICE_URL=http://localhost:8000
VITE_BACKEND_SERVICE_URL=https://wf-nfw-services-two.vercel.app
```

For production (Vercel), use:
```env
VITE_LLM_SERVICE_URL=https://wf-nfw-llm-services.vercel.app
VITE_BACKEND_SERVICE_URL=https://wf-nfw-services-two.vercel.app
```

## Testing the Fix

1. Ensure LLM service is running
2. Open browser DevTools (F12)
3. Go to driver dashboard
4. Click on a task to open modal
5. Click on "Tap to speak" mic button
6. Speak some food items (e.g., "5 kg biryani, 10 rotis")
7. Check console logs for the flow
8. Verify items appear in the list

## References

- [Axios FormData Documentation](https://axios-http.com/docs/post_example)
- [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [Multipart Form Data](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST#example)
