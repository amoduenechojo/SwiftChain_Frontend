'use client';

// The dynamic breadcrumb implementation now lives in components/shared/BreadcrumbNav.
// Re-exported here under its original name/path for backward compatibility.
import { BreadcrumbNav } from '@/components/shared/BreadcrumbNav';

export const Breadcrumbs = BreadcrumbNav;

export default Breadcrumbs;
