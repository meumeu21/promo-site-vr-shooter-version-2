import type { NextRequest } from 'next/server';
import type { HistoryIngestMatchRequest } from '@/types/api';
export const REQUEST_ID_HEADER = 'x-request-id';
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_BODY_LIMIT_BYTES = 256 * 1024;
const JSON_CONTENT_TYPE = 'application/json';
const GATEWAY_SECRET_HEADER = 'x-history-ingest-gateway-secret';
const BACKEND_TOKEN_HEADER = 'x-history-ingest-token';
const BACKEND_PATH = '/api/history-ingest/matches';
interface GatewayConfig {
  backendUrl: string;
  externalSecret: string;
  internalToken: string;
  timeoutMs: number;
  bodyLimitBytes: number;
}
export interface ForwardHistoryIngestResult {
  status: number;
  body: string;
  contentType: string | null;
}
const toGatewayUpstreamError = (status: number, body: string, contentType: string | null): HistoryIngestGatewayError | null => {
  if (status < 400) {
    return null;
  }
  if (contentType?.toLowerCase().startsWith(JSON_CONTENT_TYPE)) {
    try {
      const parsed = JSON.parse(body) as {
        error?: unknown;
        code?: unknown;
      };
      const error = typeof parsed.error === 'string' && parsed.error.trim() ? parsed.error : 'Upstream ingest failed';
      const code = typeof parsed.code === 'string' && parsed.code.trim() ? parsed.code : 'backend_error';
      return new HistoryIngestGatewayError(status, code, error);
    } catch {
      return new HistoryIngestGatewayError(status, 'backend_error', 'Upstream ingest failed');
    }
  }
  return new HistoryIngestGatewayError(status, 'backend_error', 'Upstream ingest failed');
};
export const getOrCreateRequestId = (request: NextRequest): string => {
  const headerValue = request.headers.get(REQUEST_ID_HEADER)?.trim();
  return headerValue || globalThis.crypto.randomUUID();
};
export class HistoryIngestGatewayError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'HistoryIngestGatewayError';
    this.status = status;
    this.code = code;
  }
}
const parsePositiveInteger = (rawValue: string | undefined, fallback: number): number => {
  if (!rawValue) return fallback;
  const value = Number.parseInt(rawValue, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};
const getGatewayConfig = (): GatewayConfig => {
  const backendUrl = process.env.BACKEND_URL?.trim();
  const externalSecret = process.env.HISTORY_INGEST_GATEWAY_SECRET?.trim();
  const internalToken = process.env.HISTORY_INGEST_BACKEND_TOKEN?.trim();
  if (!backendUrl) {
    throw new Error('Missing BACKEND_URL for history ingest gateway');
  }
  if (!externalSecret) {
    throw new Error('Missing HISTORY_INGEST_GATEWAY_SECRET for history ingest gateway');
  }
  if (!internalToken) {
    throw new Error('Missing HISTORY_INGEST_BACKEND_TOKEN for history ingest gateway');
  }
  return {
    backendUrl: backendUrl.replace(/\/+$/, ''),
    externalSecret,
    internalToken,
    timeoutMs: parsePositiveInteger(process.env.HISTORY_INGEST_GATEWAY_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    bodyLimitBytes: parsePositiveInteger(process.env.HISTORY_INGEST_GATEWAY_BODY_LIMIT_BYTES, DEFAULT_BODY_LIMIT_BYTES)
  };
};
export const requireGatewayAuth = (request: NextRequest): void => {
  const {
    externalSecret
  } = getGatewayConfig();
  const providedSecret = request.headers.get(GATEWAY_SECRET_HEADER)?.trim();
  if (!providedSecret || providedSecret !== externalSecret) {
    throw new HistoryIngestGatewayError(401, 'invalid_gateway_secret', 'Unauthorized');
  }
};
export const requireGatewayRequestContentType = (request: NextRequest): void => {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.startsWith(JSON_CONTENT_TYPE)) {
    throw new HistoryIngestGatewayError(415, 'unsupported_media_type', 'Content-Type must be application/json');
  }
};
const readBoundedText = async (request: NextRequest, bodyLimitBytes: number): Promise<string> => {
  const reader = request.body?.getReader();
  if (!reader) {
    throw new HistoryIngestGatewayError(400, 'invalid_json', 'Request body must be valid JSON');
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const {
      done,
      value
    } = await reader.read();
    if (done) {
      break;
    }
    if (!value) {
      continue;
    }
    total += value.byteLength;
    if (total > bodyLimitBytes) {
      throw new HistoryIngestGatewayError(413, 'payload_too_large', 'Payload too large');
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks.map(chunk => Buffer.from(chunk))));
};
export const readGatewayJsonBody = async (request: NextRequest): Promise<HistoryIngestMatchRequest> => {
  const {
    bodyLimitBytes
  } = getGatewayConfig();
  const body = await readBoundedText(request, bodyLimitBytes);
  try {
    return JSON.parse(body) as HistoryIngestMatchRequest;
  } catch {
    throw new HistoryIngestGatewayError(400, 'invalid_json', 'Request body must be valid JSON');
  }
};
export const forwardHistoryIngestToBackend = async (payload: HistoryIngestMatchRequest, requestId: string): Promise<ForwardHistoryIngestResult> => {
  const {
    backendUrl,
    internalToken,
    timeoutMs
  } = getGatewayConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${backendUrl}${BACKEND_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': JSON_CONTENT_TYPE,
        [BACKEND_TOKEN_HEADER]: internalToken,
        [REQUEST_ID_HEADER]: requestId,
        'x-history-ingest-via': 'frontend-gateway'
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: controller.signal
    });
    const result = {
      status: response.status,
      body: await response.text(),
      contentType: response.headers.get('content-type')
    };
    const upstreamError = toGatewayUpstreamError(result.status, result.body, result.contentType);
    if (upstreamError) {
      throw upstreamError;
    }
    return result;
  } catch (error) {
    const errorName = error instanceof Error ? error.name : typeof error === 'object' && error !== null && 'name' in error ? String((error as {
      name?: unknown;
    }).name) : '';
    if (errorName === 'AbortError') {
      throw new HistoryIngestGatewayError(504, 'backend_timeout', 'Upstream ingest timeout');
    }
    throw new HistoryIngestGatewayError(502, 'backend_unavailable', 'Upstream ingest unavailable');
  } finally {
    clearTimeout(timeout);
  }
};
export const historyIngestGatewayHeaders = {
  requestId: REQUEST_ID_HEADER,
  gatewaySecret: GATEWAY_SECRET_HEADER,
  backendToken: BACKEND_TOKEN_HEADER
} as const;
