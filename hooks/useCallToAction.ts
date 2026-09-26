'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { z } from 'zod';
import { ctaService } from '@/services/ctaService';
import type { CtaRegistrationResponse } from '@/types/cta';

export const ctaFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export type CtaFormValues = z.infer<typeof ctaFormSchema>;

export interface UseCallToActionReturn {
  form: ReturnType<typeof useForm<CtaFormValues>>;
  isSubmitting: boolean;
  isSuccess: boolean;
  responseMessage: string | null;
  error: string | null;
  onSubmit: (_values: CtaFormValues) => Promise<void>;
  resetForm: () => void;
}

export function useCallToAction(): UseCallToActionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CtaFormValues>({
    resolver: zodResolver(ctaFormSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const onSubmit = useCallback(
    async (values: CtaFormValues) => {
      setIsSubmitting(true);
      setError(null);
      setResponseMessage(null);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response: CtaRegistrationResponse =
          await ctaService.registerEmail(values, controller.signal);

        setIsSuccess(true);
        setResponseMessage(response.message);
        form.reset();
      } catch (err: unknown) {
        if (axios.isCancel(err)) return;

        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Something went wrong. Please try again.';
        setError(message);
        setIsSuccess(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form],
  );

  const resetForm = useCallback(() => {
    setIsSuccess(false);
    setResponseMessage(null);
    setError(null);
    form.reset();
  }, [form]);

  return {
    form,
    isSubmitting,
    isSuccess,
    responseMessage,
    error,
    onSubmit,
    resetForm,
  };
}
