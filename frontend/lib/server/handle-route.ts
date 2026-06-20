import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/server/api-response';

interface AppError extends Error {
  statusCode?: number;
  errors?: unknown;
}

export async function handleRoute(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    const error = err as AppError;
    const statusCode = error.statusCode ?? 500;
    const message = error.message ?? 'Internal Server Error';

    console.error(`[Error] ${statusCode} - ${message}`, error.stack);

    return jsonError(
      message,
      statusCode,
      error.errors ??
        (process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined),
    );
  }
}
