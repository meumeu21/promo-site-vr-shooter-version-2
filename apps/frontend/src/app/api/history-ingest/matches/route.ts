import { NextRequest, NextResponse } from 'next/server';
import { forwardHistoryIngestToBackend, getOrCreateRequestId, HistoryIngestGatewayError, readGatewayJsonBody, REQUEST_ID_HEADER, requireGatewayAuth, requireGatewayRequestContentType } from '@/lib/history-ingest-gateway';
const GATEWAY_SEMANTIC_BLOCK = 'M-FRONTEND::HISTORY_INGEST_GATEWAY';
const buildJsonError = (status: number, error: string, requestId: string, code?: string): NextResponse => {
  const response = NextResponse.json(code ? {
    error,
    code
  } : {
    error
  }, {
    status
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  response.headers.set('x-grace-semantic-block', GATEWAY_SEMANTIC_BLOCK);
  return response;
};
const buildSuccessResponse = (requestId: string, externalMatchId: string): NextResponse => {
  const response = NextResponse.json({
    ok: true,
    imported: true,
    externalMatchId
  }, {
    status: 201
  });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  response.headers.set('x-grace-semantic-block', GATEWAY_SEMANTIC_BLOCK);
  return response;
};
export const POST = async (request: NextRequest) => {
  const requestId = getOrCreateRequestId(request);
  try {
    requireGatewayAuth(request);
    requireGatewayRequestContentType(request);
    const payload = await readGatewayJsonBody(request);
    await forwardHistoryIngestToBackend(payload, requestId);
    return buildSuccessResponse(requestId, payload.externalMatchId);
  } catch (error) {
    if (error instanceof HistoryIngestGatewayError) {
      return buildJsonError(error.status, error.message, requestId, error.code);
    }
    return buildJsonError(500, 'Internal Server Error', requestId, 'gateway_internal_error');
  }
};
