export interface BreadcrumbItem {
  title: string;
  path: string;
  isCurrentPage: boolean;
}

export function useBreadcrumbs() {
  const route = useRoute();

  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const pathSegments = route.path.split('/').filter(Boolean);

    return pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const isCurrentPage = index === pathSegments.length - 1;

      // Convert slug to title (e.g., "get-started" -> "Get Started")
      const title = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return { title, path, isCurrentPage };
    });
  });

  return { breadcrumbs };
}
