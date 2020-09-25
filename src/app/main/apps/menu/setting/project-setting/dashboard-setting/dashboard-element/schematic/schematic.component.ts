import {
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {DashboardDialogComponent} from '../dashboard-dialog/dashboard-dialog.component';
import {SCHEMATIC} from '../../../../../../../../../@rcm/_helpers/constant/dashboard-element-constant';
import {SchematicElement, SchematicModel} from '../../../../setting.model';
import {SchemeSPComponent} from './scheme-SP/scheme-sp.component';
import {SchemeCataComponent} from './scheme-cata/scheme-cata.component';

@Component({
    selector: 'app-schematic',
    templateUrl: './schematic.component.html',
    styleUrls: ['./schematic.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SchematicComponent implements OnInit {
    @Input() dataRef: any;
    @Input() mode: string;
    @Output() removeElement = new EventEmitter();
    @Output() changeData = new EventEmitter();
    @Output() dashFinish = new EventEmitter();

    dialogRef: MatDialogRef<DashboardDialogComponent>;
    imgSrc: string = '';
    schemeName: string = 'Scheme 1';
    signalPointNames: Array<any> = [];
    cataNames: Array<any> = [];
    schematicElements: SchematicElement[] = [];
    currentSchematic: SchematicModel;

    @ViewChild('schemeContainer', {read: ViewContainerRef}) schemeContainer: ViewContainerRef;

    /*using getter and setter to determine when will the realtime data comes */
    _realtimeData: any;
    get realtimeData(): any {
        return this._realtimeData;
    }

    @Input('realtimeData')
    set realtimeData(realtimeData: any) {
        this._realtimeData = realtimeData;
        let elementArr: Array<any> = this.schematicElements.filter(item => item.name === this._realtimeData.name);
        if (elementArr.length > 0) {
            elementArr.forEach(component => {
                if (component.element) {
                    component.element.instance.realtimeData = this._realtimeData;
                }
            });
        }
    }

    /**************************************************/


    constructor(private _matDialog: MatDialog,
                private componentFactoryResolver: ComponentFactoryResolver,
    ) {
    }

    ngOnInit() {
        if (this.dataRef && this.dataRef.imgSrc) {
            this.imgSrc = this.dataRef.imgSrc;
            this.schemeName = this.dataRef.schemeName ? this.dataRef.schemeName : this.schemeName;

            if (this.dataRef.signalPointNames) {
                for (let i = 0; i < this.dataRef.signalPointNames.length; i++) {
                    this.signalPointNames.push({
                        name: this.dataRef.signalPointNames[i],
                        clicked: false,
                        danger: this.dataRef.danger[i]
                    });
                }
            }

            if (this.dataRef.cataNames) {
                this.dataRef.cataNames.forEach(element => {
                    this.cataNames.push(
                        {name: element, clicked: false}
                    );
                });
            }

            this.changeData.emit({imgSrc: this.imgSrc, schemeName: this.schemeName});

            let schematic = this.dataRef.schematicDataRef;

            schematic.elements.forEach(element => {
                this.addWidgetIntoSchematic(element.type, element.name, element);
            });

            this.schematicElements.forEach(element => {
                if (element.location) {
                    this.restoreElementLocation(element.id, element.location);
                }
            });

            this.saveSchematic();
        } else {
            this.dialogRef = this._matDialog.open(DashboardDialogComponent, {
                data: {
                    dataRef: this.dataRef,
                    componentType: SCHEMATIC.componentType
                }
            });
            this.dialogRef.afterClosed().subscribe(result => {
                if (result.imgSrc) {
                    this.imgSrc = result.imgSrc;
                    this.schemeName = result.schemeName ? result.schemeName : this.schemeName;

                    if (result.spName instanceof Array) {
                        for (let i = 0; i < result.spName.length; i++) {
                            if (result.spName[i] !== 0) {
                                this.signalPointNames.push({
                                    name: result.spName[i],
                                    clicked: false,
                                    danger: result.danger[i]
                                });
                            }
                        }
                    } else {
                        if (result.spName) {
                            this.signalPointNames.push({
                                name: result.spName,
                                clicked: false,
                                danger: result.danger
                            });
                        }
                    }

                    if (result.cataName instanceof Array) {
                        result.cataName.forEach(element => {
                            this.cataNames.push(
                                {name: element, clicked: false}
                            );
                        });
                    } else {
                        if (result.catalogNames) {
                            this.cataNames.push({name: result.cataName, clicked: false});
                        }
                    }

                    this.saveSchematic();

                } else {
                    this.removeDashboardElement();
                }
            });
        }
        this.dashFinish.emit(SCHEMATIC.componentType);
    }

    // --- Drag & drop action----------
    /*
        https://stackoverflow.com/questions/26213011/: 
        getData() and setData() attribute must be called exactly "text", 
        since u can use any parameter in other browsers (which actualy makes lot of sense - IE rocks again), 
        those other answers here are useless. 
    */
    ondropAction(event) {
        event.preventDefault();
        const str: string = event.dataTransfer.getData('text');
        let elementType: string = '';

        //because IE only allows one string to be passed as 'text'
        if (str.indexOf('schemeSP') >= 0) {
            elementType = 'schemeSP';
        } else {
            elementType = 'schemeCata';
        }
        let elementName: string = str.substring(elementType.length, str.length);

        this.addWidgetIntoSchematic(elementType, elementName);
    }

    allowDrop(event) {
        event.preventDefault();
    }

    dragDashboardElement(event, type: string, name: string) {
        //because IE only allows one string to be passed as 'text' => join type + name into one string
        let str: string = type + name;
        event.dataTransfer.setData('text', str);
    }

    addWidgetIntoSchematic(elementType: string, elementName: string, schematicElement?: SchematicElement) {
        let factory: ComponentFactory<any>;
        switch (elementType) {
            case 'schemeSP':
                factory = this.componentFactoryResolver.resolveComponentFactory(SchemeSPComponent);
                break;
            case 'schemeCata':
                factory = this.componentFactoryResolver.resolveComponentFactory(SchemeCataComponent);
                break;
        }
        const element = this.schemeContainer.createComponent(factory);

        this.handleSchematicElement(element, elementType, elementName, schematicElement);
    }

    handleSchematicElement(element: ComponentRef<any>, type: string, elementName: string, schematicElement?: SchematicElement) {

        const id = (this.mode === 'edit' || this.mode === 'view') && schematicElement ? schematicElement.id : this.generateId();

        // set output for dashboard element
        element.instance.removeElement.subscribe(res => {
            if (res) {
                element.destroy();
                this.removeFromElementList(id);
            }
        });
        element.instance.blinkingOutput.subscribe(res => {
            if (res) {
                if (res.type == 'sp') {
                    let sp = this.signalPointNames.find(e => e.name == res.name);
                    sp.clicked = res.active;
                } else {
                    let cata = this.cataNames.find(e => e.name == res.name);
                    cata.clicked = res.active;
                }
            }
        });

        const newElement = new SchematicElement({
            id: id,
            type: type,
            element: element,
            name: elementName
        });

        if ((this.mode === 'edit' || this.mode === 'view') && schematicElement) {
            // set input for dashboard element
            element.instance.mode = this.mode;
            newElement.location = schematicElement.location;
            newElement.id = schematicElement.id;
        }

        element.instance.name = elementName;

        this.schematicElements.push(newElement);
    }

    // --------------------------------

    removeDashboardElement() {
        this.removeElement.emit(true);
    }

    removeFromElementList(elementId) {
        const index = this.schematicElements.findIndex(element => element.id === elementId);
        this.schematicElements.splice(index, 1);
    }

    generateId() {
        return new Date().getTime();
    }

    restoreElementLocation(id: number, location: string) {
        const schematicElements = this.schematicElements.find(item => item.id === id);

        const element: ComponentRef<any> = schematicElements.element;
        const nativeElement = element.location.nativeElement;
        const childNodes = nativeElement.childNodes;

        let dragDropNode;
        if (childNodes && childNodes.length > 0) {
            for (const childNode of childNodes) {
                if (childNode.className.indexOf('cdk-drag') !== -1) {
                    dragDropNode = childNode;
                    break;
                }
            }
        }

        if (dragDropNode) {
            dragDropNode.style.transform = location;
        }
    }

    saveSchematic() {
        this.collectDataFromSchematicElement();
        const dataElements = SchematicElement.convertListSchematicElement(this.schematicElements);

        let schematic;
        if (!this.currentSchematic) {
            schematic = {
                id: this.generateId(),
                elements: dataElements,
            };
        } else {
            schematic = {
                id: this.currentSchematic.id,
                elements: dataElements
            };
        }
        this.currentSchematic = schematic;

        this.changeData.emit({
            imgSrc: this.imgSrc,
            schemeName: this.schemeName,
            schematicDataRef: schematic,
            signalPointNames: this.signalPointNames.map(e => e.name),
            danger: this.signalPointNames.map(e => e.danger),
            cataNames: this.cataNames.map(e => e.name),
        });

    }

    collectDataFromSchematicElement() {
        for (const schematicElement of this.schematicElements) {
            const element: ComponentRef<any> = schematicElement.element;
            const nativeElement = element.location.nativeElement;
            const childNodes = nativeElement.childNodes;

            let dragDropNode;
            if (childNodes && childNodes.length > 0) {
                for (const childNode of childNodes) {
                    if (childNode.className.indexOf('cdk-drag') !== -1) {
                        dragDropNode = childNode;
                        break;
                    }
                }
            }

            if (dragDropNode) {
                const location = this.getLocationOfNode(dragDropNode);
                schematicElement.location = location;
            }
        }
    }

    getLocationOfNode(node) {
        const styleOfElement = node.getAttribute('style');
        const indexOfCssTransform = styleOfElement.indexOf('transform');
        let cssTransform = '';
        if (indexOfCssTransform > -1) {
            cssTransform = styleOfElement.substring(indexOfCssTransform);
            cssTransform = cssTransform.substring(cssTransform.indexOf(':') + 1, cssTransform.indexOf(';')).trim();
        }
        return cssTransform;
    }

    onPointClick(name: string, type: string) {
        let elementArr: Array<any> = this.schematicElements.filter(item => item.name === name);
        if (elementArr.length > 0) {
            elementArr.forEach(component => {
                if (component.element) {
                    component.element.instance.blinkingInput = !component.element.instance.blinkingInput;
                }
            });
            if (type === 'sp') {
                let sp = this.signalPointNames.find(e => e.name == name);
                sp.clicked = !sp.clicked;
            } else {
                let cata = this.cataNames.find(e => e.name == name);
                cata.clicked = !cata.clicked;
            }
        }
    }

    // onCatalogClick(name) {
    //     // this.cataNames.filter(e => e.name == name)[0].clicked = !this.cataNames.filter(e => e.name == name)[0].clicked;
    //     let elementArr: Array<any> = this.schematicElements.filter(item => item.name === name);
    //     if (elementArr.length > 0) {
    //         elementArr.forEach(component => {
    //             if (component.element) {
    //                 component.element.instance.hidden = !component.element.instance.hidden;
    //             }
    //         })
    //     }
    // }

    getColor(dangerRank: number): string {
        switch (dangerRank) {
            case 1:
                return 'rgb(223, 0, 36)';
            case 2:
                return 'rgb(245, 121, 0)';
            case 3:
                return '#fff';
            case 4:
                return 'rgb(245, 121, 0)';
            case 5:
                return 'rgb(223, 0, 36)';
            default:
                return 'rgb(140, 140, 140)';
        }
    }
}
