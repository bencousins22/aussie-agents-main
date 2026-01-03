import { use, Suspense } from "react";
import { agentZeroApi, type ProjectsResponse, type MemoryDashboardResponse } from "../../lib/agentZeroApi";

type DataFetcherProps<T> = {
  promise: Promise<T>;
  children: (data: T) => React.ReactNode;
  fallback?: React.ReactNode;
};

export function DataFetcher<T>({ promise, children, fallback }: DataFetcherProps<T>) {
  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <DataFetcherContent promise={promise} children={children} />
    </Suspense>
  );
}

function DataFetcherContent<T>({ 
  promise, 
  children 
}: { 
  promise: Promise<T>; 
  children: (data: T) => React.ReactNode; 
}) {
  // React 19 use API for reading promises
  const data = use(promise);
  return <>{children(data)}</>;
}

// Example usage component for projects
export function ProjectsDataFetcher({ 
  children 
}: { 
  children: (projects: unknown[]) => React.ReactNode; 
}) {
  const projectsPromise = agentZeroApi.projects("list");
  
  return (
    <DataFetcher 
      promise={projectsPromise} 
      fallback={<div className="p-4 text-center text-white/60">Loading projects...</div>}
    >
      {(response: ProjectsResponse) => children(response?.data || [])}
    </DataFetcher>
  );
}

// Example usage component for memory search
export function MemorySearchFetcher({ 
  subdir, 
  query, 
  area, 
  children 
}: { 
  subdir: string; 
  query: string; 
  area: string; 
  children: (memories: unknown[]) => React.ReactNode; 
}) {
  const searchPromise = agentZeroApi.memoryDashboard("search", {
    memory_subdir: subdir,
    search: query,
    area,
    limit: 200,
    threshold: 0.6,
  });
  
  return (
    <DataFetcher 
      promise={searchPromise} 
      fallback={<div className="p-4 text-center text-white/60">Searching memories...</div>}
    >
      {(response: MemoryDashboardResponse) => children(response?.memories || [])}
    </DataFetcher>
  );
}