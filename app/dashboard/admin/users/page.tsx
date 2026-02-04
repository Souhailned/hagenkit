import { Suspense } from "react";
import { getUsers } from "@/app/actions/admin/users";
import { UsersDataTable } from "@/components/admin/users-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UserPlus } from "@phosphor-icons/react/dist/ssr";
import { UserCreateDialog } from "@/components/admin/user-create-dialog";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";

export const metadata = {
  title: "User Management | Admin",
  description: "Manage users and their permissions",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    role?: string;
    status?: string;
  }>;
}

async function UsersContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize) : 10;
  const search = params.search;
  const sortBy = params.sortBy;
  const sortOrder = params.sortOrder;
  const role = params.role;
  const status = params.status;

  const result = await getUsers({
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    role,
    status,
  });

  if (!result.success || !result.data) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{result.error || "Failed to load users"}</p>
        </div>
      </div>
    );
  }

  return (
    <UsersDataTable
      data={result.data.users}
      pageCount={result.data.pageCount}
      total={result.data.total}
    />
  );
}

export default function UsersPage(props: PageProps) {
  return (
    <ContentCard>
      <ContentCardHeader
        title="User Management"
        actions={
          <UserCreateDialog>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" weight="bold" />
              Add User
            </Button>
          </UserCreateDialog>
        }
      />
      <ContentCardBody className="p-4">
        <Suspense
          fallback={
            <DataTableSkeleton
              columnCount={9}
              rowCount={4}
              filterCount={2}
              withViewOptions={true}
              withPagination={true}
              cellRenderer={(rowIndex, colIndex) => {
                if (colIndex === 0) {
                  return (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[200px]" />
                      </div>
                    </div>
                  );
                }
                return <Skeleton className="h-4 w-full" />;
              }}
            />
          }
        >
          <UsersContent searchParams={props.searchParams} />
        </Suspense>
      </ContentCardBody>
    </ContentCard>
  );
}
