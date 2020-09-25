import {ComponentRef} from '@angular/core';

export interface IDocument {
    id?: string;
    title?: string;
    document?: any;
    image?: any;
}

export class Document implements IDocument {
    constructor(
        public id?: string,
        public title?: string,
        public document?: any,
        public image?: any,
    ) {
    }
}

export interface IProject {
    projectId?: string;
    name?: string;
    address?: string;
    time?: any;
    image?: any;
}

export class Project implements IProject {
    constructor(
        public projectId?: string,
        public name?: string,
        public address?: string,
        public time?: any,
        public image?: any,
    ) {
    }
}

export class Calculation {
    id?: string;
    newSignalName: string;
    methodOneId: string;
    signalOneId: string;
    methodTwoId: string;
    signalTwoId: string;
    outputSignalId: string;


    /**
     * Constructor
     *
     * @param calculation
     */
    constructor(calculation) {
        {
            this.id = calculation.id || 0;
            this.newSignalName = calculation.newSignalName || '';
            this.methodOneId = calculation.methodOneId || '';
            this.signalOneId = calculation.signalOneId || '';
            this.methodTwoId = calculation.methodTwoId || '';
            this.signalTwoId = calculation.signalTwoId || '';
            this.outputSignalId = calculation.outputSignalId || '';
        }
    }
}

export class Method {
    id?: string;
    name: string;
    value: string;


    /**
     * Constructor
     *
     * @param calculation
     */
    constructor(name: string, value: string) {
        {
            this.name = name || '';
            this.value = value || '';
        }
    }
}

export class Signal {
    id?: string;
    name: string;
    signalId: string;


    /**
     * Constructor
     *
     * @param calculation
     */
    constructor(name: string, signalId: string) {
        {
            this.name = name || '';
            this.signalId = signalId || '';
        }
    }
}

export interface DashboardModel {
    id: number;
    name: string;
    urlImage?: string;
    slideIndex?: string;
    addSlide?: boolean;
    delayTime?: number;
    elements?: DashboardElement[];
}

export interface ListIdDash {
    id: number;
    delayTime?: number;
}

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

    public static convertListDashboardElement(elements: DashboardElement[]): DashboardElement[] {
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

export interface SchematicModel {
    id: number;
    elements?: SchematicElement[];
}

export class SchematicElement {
    id: number;
    type: string;
    name: string;
    location?: string;
    dataRef?: any;
    element?: ComponentRef<any>;

    constructor(params: any) {
        this.id = params.id ? params.id : null;
        this.type = params.type ? params.type : null;
        this.location = params.location ? params.location : null;
        this.dataRef = params.dataRef ? params.dataRef : null;
        this.element = params.element ? params.element : null;
        this.name = params.name ? params.name : null;
    }

    public static convertListSchematicElement(elements: SchematicElement[]): SchematicElement[] {
        const result: SchematicElement[] = [];

        let tempItem;
        for (const element of elements) {
            tempItem = new SchematicElement({
                id: element.id,
                type: element.type,
                location: element.location,
                dataRef: element.dataRef,
                name: element.name
            });
            result.push(tempItem);
        }
        return result;
    }
}


