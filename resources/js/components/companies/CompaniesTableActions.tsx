import { Company } from '@/types';
import { CompanyDeleteDialog } from './CompanyDeleteDialog';
import { CompanyViewDialog } from './CompanyViewDialog';

interface CompaniesTableActionsProps {
    company: Company;
}

export function CompaniesTableActions({ company }: CompaniesTableActionsProps) {
    return (
        <div className="flex h-full w-full items-center justify-center gap-2">
            <CompanyViewDialog company={company} />
            <CompanyDeleteDialog company={company} />
        </div>
    );
}
