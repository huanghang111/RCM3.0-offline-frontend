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
    dataType: any;

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

