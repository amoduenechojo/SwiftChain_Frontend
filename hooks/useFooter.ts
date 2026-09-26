import { useMutation, useQuery } from '@tanstack/react-query';
import {
  footerService,
  type FooterContent,
} from '@/services/footerService';

export const FOOTER_QUERY_KEY = ['footer'] as const;

export interface UseFooterReturn {
  content: FooterContent | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * useFooter — fetches global footer content (link sections) from the backend API.
 */
export function useFooter(): UseFooterReturn {
  const { data, isLoading, isError, error } = useQuery<FooterContent, Error>({
    queryKey: FOOTER_QUERY_KEY,
    queryFn: () => footerService.getFooterContent(),
  });

  return {
    content: data,
    isLoading,
    isError,
    error: error ?? null,
  };
}

export interface UseNewsletterSubscribeReturn {
  subscribe: (_email: string) => Promise<{ success: boolean }>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * useNewsletterSubscribe — submits an email address to the newsletter
 * subscription endpoint and exposes pending/success/error state for the form.
 */
export function useNewsletterSubscribe(): UseNewsletterSubscribeReturn {
  const mutation = useMutation<{ success: boolean }, Error, string>({
    mutationFn: (email: string) => footerService.subscribeToNewsletter(email),
  });

  return {
    subscribe: (email: string) => mutation.mutateAsync(email),
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error ?? null,
    reset: mutation.reset,
  };
}
