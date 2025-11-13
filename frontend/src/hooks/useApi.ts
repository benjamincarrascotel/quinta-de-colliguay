import { useState, useEffect, useCallback } from 'react';
import type { ApiError } from '@/types/index';

// ============================================
// USE API - Hook abstracto genérico para llamadas API
// Maneja loading, error y data states automáticamente
// ============================================

export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  autoFetch?: boolean; // Fetch automático al montar
}

export interface UseApiResult<T, P extends any[] = any[]> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  execute: (...params: P) => Promise<void>;
  reset: () => void;
}

export function useApi<T, P extends any[] = any[]>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T, P> {
  const { onSuccess, onError, autoFetch = false } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (...params: P) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...params);
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        onError?.(apiError);
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // Auto-fetch si está habilitado
  useEffect(() => {
    if (autoFetch) {
      // @ts-ignore - Complex generic type for empty parameters
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    isSuccess: !!data && !error,
    execute,
    reset,
  };
}

// ============================================
// USE MUTATION - Variante específica para operaciones de escritura
// ============================================

export interface UseMutationOptions<T> extends UseApiOptions<T> {
  successMessage?: string;
}

export function useMutation<T, P extends any[] = any[]>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseMutationOptions<T> = {}
) {
  return useApi(apiFunction, options);
}

// ============================================
// USE QUERY - Variante específica para operaciones de lectura con caché
// ============================================

export interface UseQueryOptions<T> extends UseApiOptions<T> {
  cacheTime?: number; // Tiempo de caché en ms
  refetchInterval?: number; // Auto-refetch cada X ms
  enabled?: boolean; // Habilitar/deshabilitar query
}

export function useQuery<T>(
  _queryKey: string,
  apiFunction: () => Promise<T>,
  options: UseQueryOptions<T> = {}
): UseApiResult<T, []> & { refetch: () => Promise<void> } {
  const { cacheTime = 5 * 60 * 1000, refetchInterval, enabled = true } = options;

  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);

  const result = useApi<T, []>(apiFunction, {
    ...options,
    autoFetch: false,
  });

  const refetch = useCallback(async () => {
    await result.execute();
    setCacheTimestamp(Date.now());
  }, [result]);

  // Auto-fetch inicial si está habilitado
  useEffect(() => {
    if (enabled) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(refetch, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, refetch]);

  // Cache invalidation
  useEffect(() => {
    if (cacheTime && cacheTimestamp > 0) {
      const timeout = setTimeout(() => {
        result.reset();
      }, cacheTime);
      return () => clearTimeout(timeout);
    }
  }, [cacheTime, cacheTimestamp, result]);

  return {
    ...result,
    refetch,
  };
}
