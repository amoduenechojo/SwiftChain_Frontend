import { useQuery } from '@tanstack/react-query';
import { deliveryWorkflowService } from '@/services/deliveryWorkflowService';
import type { Delivery } from '@/types/delivery';

export function useWorkflowCards() {
  return useQuery<Delivery[], Error>({
    queryKey: ['workflow-cards'],
    queryFn: () => deliveryWorkflowService.getWorkflowCards(),
  });
}


// random
