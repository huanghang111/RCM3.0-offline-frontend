import {ComponentRef} from '@angular/core';

export class DashboardElement {
    id: number;
    type: string;
    location?: string;
    dataRef?: any;
    element?: ComponentRef<any>;

    constructor(params: any) {
        this.id = params.id ? params.id : null;
        this.type = params.type ? params.type : null;
        this.location = params.location ? params.location : null;
        this.dataRef = params.dataRef ? params.dataRef : null;
        this.element = params.element ? params.element : null;

    }

    public static convertListDashboardElement(elements: DashboardElement[]) {
        const result: DashboardElement[] = [];

        let tempItem;
        for (const element of elements) {
            tempItem = new DashboardElement({
                id: element.id,
                type: element.type,
                location: element.location,
                dataRef: element.dataRef
            });
            result.push(tempItem);
        }
        return result;
    }
}
