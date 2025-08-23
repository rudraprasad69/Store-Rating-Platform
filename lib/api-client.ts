// lib/api-client.ts

interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
  const response = await fetch('/api/database', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Something went wrong with the database query');
  }

  const data: QueryResult<T> = await response.json();
  return data;
}