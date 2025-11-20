import { ProductionCenter } from '@/types';
import { ProductionCenterDeleteDialog } from './ProductionCenterDeleteDialog';
import { ProductionCenterViewDialog } from './ProductionCenterViewDialog';

interface ProductionCentersTableActionsProps {
    productionCenter: ProductionCenter;
}

export function ProductionCentersTableActions({ productionCenter }: ProductionCentersTableActionsProps) {
    if (!productionCenter) {
        return null;
    }

    return (
        <div className="flex h-full w-full items-center justify-center gap-2">
            <ProductionCenterViewDialog productionCenter={productionCenter} />
            <ProductionCenterDeleteDialog productionCenter={productionCenter} />
        </div>
    );
}
