export function audit(event: string, metadata: Record<string, unknown>): void {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...metadata,
  };
  if (process.env.NODE_ENV !== 'production') {
    console.log('[AUDIT]', JSON.stringify(entry));
  }
}
