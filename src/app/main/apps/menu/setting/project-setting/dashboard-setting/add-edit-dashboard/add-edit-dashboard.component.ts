import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { TextComponent } from '../dashboard-element/text/text.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MatSidenav, MatSnackBar } from '@angular/material';

import { LineHistoricalComponent } from '../dashboard-element/charts/historical/line-historical.component';
import { SettingService } from 'app/main/apps/services/setting.service';
import { LineIntensiveComponent } from '../dashboard-element/charts/intensive/line-intensive.component';
import { LineRealtimeComponent } from '../dashboard-element/charts/realtime/line-realtime.component';
import { BarComponent } from '../dashboard-element/charts/bar/bar.component';
import { PieComponent } from '../dashboard-element/charts/pie/pie.component';
import { DashboardElement } from '../dashboard-element.model';
import { DashboardModel } from '../../../setting.model';
import { DocumentLinkComponent } from '../dashboard-element/document-link/document-link.component';
import { CatalogItemComponent } from '../dashboard-element/catalog-item/catalog-item.component';
import { PictureComponent } from '../dashboard-element/picture/picture.component';
import { SchematicComponent } from '../dashboard-element/schematic/schematic.component';
import html2canvas from 'html2canvas';
import { DashboardSPComponent } from '../dashboard-element/dashboard-SP/dashboard-SP.component';
import { DashboardSpTypebComponent } from '../dashboard-element/dashboard-SP-typeB/dashboard-sp-typeb.component';
import { ErrorService } from 'app/main/apps/services/error.service';
import {
    BAR_CHART,
    CATALOG_ITEM,
    DOCUMENT_LINK,
    ERROR_PIE_CHART,
    LINE_CHART_HISTORICAL,
    LINE_CHART_INTENSIVE,
    LINE_CHART_REALTIME,
    PICTURE,
    SCHEMATIC,
    SIGNAL_POINT,
    SIGNAL_POINT_TYPEB,
    TEXT
} from '@rcm/_helpers/constant/dashboard-element-constant';
import { SocketApiService } from 'app/main/apps/services/socket-api.service';

@Component({
    selector: 'app-add-edit-dashboard',
    templateUrl: './add-edit-dashboard.component.html',
    styleUrls: ['./add-edit-dashboard.component.scss']
})
export class AddEditDashboardComponent implements OnInit, OnDestroy {
    @Input() dashboardID: number;

    @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
    @ViewChild('sidenav') sidenav: MatSidenav;
    @ViewChild('normalTemplate') normalTemplate: TemplateRef<any>;
    @ViewChild('template1') template1: TemplateRef<any>;
    @ViewChild('template2') template2: TemplateRef<any>;
    @ViewChild('template3') template3: TemplateRef<any>;
    @ViewChild('chartOptionsOne') chartOptionsOneTemplate: TemplateRef<any>;
    @ViewChild('chartOptionsTwo') chartOptionsTwoTemplate: TemplateRef<any>;
    //we need to declare 3 outputs since we dont know which will be the last loaded
    @Output() onFinishedLoading = new EventEmitter();
    @Output() onFinishedNewIssue = new EventEmitter();
    @Output() onFinished30Issue = new EventEmitter();

    elements = [SIGNAL_POINT, SIGNAL_POINT_TYPEB, SCHEMATIC, LINE_CHART_REALTIME, LINE_CHART_HISTORICAL,
        LINE_CHART_INTENSIVE, BAR_CHART, ERROR_PIE_CHART, TEXT, PICTURE, CATALOG_ITEM, DOCUMENT_LINK];

    currentTemplate: TemplateRef<any>;
    optionDialogRef: MatDialogRef<any>;
    templateId: string = '';
    dashboardForm: FormGroup;
    dashboardElements: DashboardElement[] = [];
    currentDashboard: DashboardModel;
    mode: string;
    dashboardName: string;
    useTemplate: boolean = false;
    isExpand = false;
    currentChart: string = '';

    chart1Selected: boolean = false;
    chart2Selected: boolean = false;

    newIssueCounter: number = 0;
    daysIssueCounter: number = 0;
    errorList: Array<any> = [];

    finishedElements: Array<string> = [];

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private activatedRoute: ActivatedRoute,
        private settingService: SettingService,
        private errorService: ErrorService,
        private router: Router,
        private _matSnackBar: MatSnackBar,
        private _matDialog: MatDialog,
        private socketApi: SocketApiService,
    ) {
    }

    ngOnInit() {
        this.initForm();
        this.mode = this.activatedRoute.snapshot.data['mode'];
        if (this.mode === undefined) {
            this.mode = 'view';
        }

        this.useTemplate = this.activatedRoute.snapshot.data['useTemplate'];
        if (this.useTemplate) {
            this.templateId = this.activatedRoute.snapshot.paramMap.get('id');
            switch (this.templateId) {
                case 'no1':
                    this.currentTemplate = this.template1;
                    break;
                case 'no2':
                    this.currentTemplate = this.template2;
                    break;
                case 'no3':
                    this.currentTemplate = this.template3;
                    break;
            }
        } else {
            this.currentTemplate = this.normalTemplate;
            this.activatedRoute.params.subscribe(params => {
                if (params && params.id && this.mode !== 'add') {
                    this.initDashboard(params.id);
                }
            });
        }
    }

    //when this component receives a diffrent ID from slide-dashboard, this triggers
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.dashboardID) {
            if (this.mode === undefined) {
                this.mode = 'view';
            }
            if (this.dashboardID && this.mode === 'view') {
                this.initDashboard(this.dashboardID);
            }
        }

    }

    ngOnDestroy() {
        this.disconnectSocket();
    }

    initForm() {
        this.dashboardForm = new FormGroup({
            dashboardName: new FormControl('', [Validators.required])
        });
    }

    initDashboard(dashboardID: number) {
        this.settingService.getDashboardDataById(dashboardID).subscribe(
            res => {
                if (res.code == 200) {
                    this.currentDashboard = res.data.dashboard as DashboardModel;
                }
            },
            error => console.log(error),
            () => {
                if (this.currentDashboard) {
                    this.dashboardForm.get('dashboardName').setValue(this.currentDashboard.name);
                    this.dashboardName = this.currentDashboard.name;
                    if (this.currentDashboard.elements && this.currentDashboard.elements.length > 0) {
                        //start adding components to dashboard
                        this.currentDashboard.elements.forEach(element => {
                            this.addWidgetIntoDashboard(element.type, element);
                        });
                        //then restore its location
                        this.dashboardElements.forEach(element => {
                            if (element.location) {
                                this.restoreElementLocation(element.id, element.location);
                            }
                        });
                        // this part checks if the components need to connect to realtime socket
                        let newIssueComponent: any;
                        let daysComponent: any;
                        newIssueComponent = this.dashboardElements.find(e => e.type === 'text' && (e.dataRef as string).includes('New:'));
                        daysComponent = this.dashboardElements.find(e => e.type === 'text' && (e.dataRef as string).includes('Issues in 30 days: '));
                        if (newIssueComponent || daysComponent) {
                            this.updateSummaryCount(newIssueComponent, daysComponent);
                        } else if ( //check if all element is static component? if true do nothing, if there is one realtime component => connect socket
                            !this.dashboardElements.every(
                                e => e.type == this.elements[4].componentType || e.type == this.elements[8].componentType ||
                                    e.type == this.elements[9].componentType || e.type == this.elements[10].componentType ||
                                    e.type == this.elements[11].componentType)
                        ) {
                            if (!this.socketApi.isConnected()) {
                                this.connectSocket();
                            }
                            this.onFinishedNewIssue.emit(true);
                            this.onFinished30Issue.emit(true);
                        }
                        //// end checking////
                    } else {
                        //if dashboard has no component
                        this.onFinishedLoading.emit(true);
                        this.onFinishedNewIssue.emit(true);
                        this.onFinished30Issue.emit(true);
                    }
                }
            });
    }

    restoreElementLocation(id: number, location: string) {
        const dashboardElement = this.dashboardElements.find(item => item.id === id);
        const element: ComponentRef<any> = dashboardElement.element;
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

    // --- Drag & drop action----------
    /*
        https://stackoverflow.com/questions/26213011/: 
        getData() and setData() attribute must be called exactly "text", 
        since u can use any parameter in other browsers (which actually makes lot of sense - IE did it again), 
        those other answers here are useless. 
    */
    ondropAction(event) {
        event.preventDefault();
        const elementType = event.dataTransfer.getData('text');

        //in case of the drop action comes from schematic
        if (elementType.indexOf('schemeSP') < 0 && elementType.indexOf('schemeCata') < 0) {
            this.addWidgetIntoDashboard(elementType);
        }
    }

    allowDrop(event) {
        event.preventDefault();
    }

    dragDashboardElement(event, type: string) {
        event.dataTransfer.setData('text', type);
    }

    // --------------------------------


    addWidgetIntoDashboard(elementType: string, dashboardElement?: DashboardElement) {
        let factory: ComponentFactory<any>;
        switch (elementType) {
            case TEXT.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(TextComponent);
                break;
            case SIGNAL_POINT.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(DashboardSPComponent);
                break;
            case SIGNAL_POINT_TYPEB.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(DashboardSpTypebComponent);
                break;
            case LINE_CHART_HISTORICAL.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(LineHistoricalComponent);
                break;
            case LINE_CHART_INTENSIVE.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(LineIntensiveComponent);
                break;
            case LINE_CHART_REALTIME.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(LineRealtimeComponent);
                break;
            case BAR_CHART.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(BarComponent);
                break;
            case ERROR_PIE_CHART.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(PieComponent);
                break;
            case DOCUMENT_LINK.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(DocumentLinkComponent);
                break;
            case CATALOG_ITEM.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(CatalogItemComponent);
                break;
            case PICTURE.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(PictureComponent);
                break;
            case SCHEMATIC.componentType:
                factory = this.componentFactoryResolver.resolveComponentFactory(SchematicComponent);
                break;
        }

        const element = this.container.createComponent(factory);
        this.handleDashboardElement(element, elementType, dashboardElement);
    }

    handleDashboardElement(element: ComponentRef<any>, type: string, dashboardElement?: DashboardElement) {

        const id = (this.mode === 'edit' || this.mode === 'view') && dashboardElement ? dashboardElement.id : this.generateId();

        // set output for dashboard element
        element.instance.removeElement.subscribe(result => {
            if (result) {
                element.destroy();
                this.removeFromElementList(id);
            }
        });
        element.instance.changeData.subscribe(data => {
            this.updateElementData(id, data);
        });

        element.instance.dashFinish.subscribe(data => {
            if (data) {
                this.finishedElements.push(data);
                if (this.finishedElements.length === this.dashboardElements.length) {
                    this.onFinishedLoading.emit(true);
                }
            }
            ;
        });

        const newElement = new DashboardElement({
            id: id,
            type: type,
            element: element
        });

        if ((this.mode !== 'add') && dashboardElement) {
            // set input for dashboard element
            element.instance.dataRef = dashboardElement.dataRef ? JSON.parse(dashboardElement.dataRef) : null;
            element.instance.mode = this.mode;
            newElement.dataRef = dashboardElement.dataRef;
            newElement.location = dashboardElement.location;
            newElement.id = dashboardElement.id;
        }
        this.dashboardElements.push(newElement);
    }

    ngAfterViewInit() { //THIS IS FOR TEMPLATE-BASED DASHBOARD 
        if (this.templateId === 'no1') {
            this.addPresetText('{"textContent":"<h2>PRODUCT</h2>"}', 'translate3d(5px, 675px, 0px)');
            this.addPresetText('{"textContent":"<h2>ISSUE SUMMARY</h2>"}', 'translate3d(1060px, 675px, 0px)');

            //add 'new-item' textComponent
            this.errorService.totalLatestError().subscribe(
                response => {
                    if (response.code == 200) {
                        this.newIssueCounter = response.data.totalElements;
                        this.addPresetText(`{"textContent":"New: ${this.newIssueCounter} items"}`, 'translate3d(1060px, 710px, 0px)');
                    }
                }, error => console.log(error)
            );

            //add 'issue-summary' textComponent
            this.settingService.getDashboardTemplateInfo(30).subscribe(
                res => {
                    if (res.code === 200) {
                        this.daysIssueCounter = res.data.totalElements;
                        this.addPresetText(`{"textContent":"Issues in 30 days: ${this.daysIssueCounter} items"}`, 'translate3d(1060px, 725px, 0px)');
                    }
                }, error => console.log(error)
            );

            //add pie chart
            this.addAndRestoreElementLocation(this.elements[7].componentType, 'translate3d(1065px, 175px, 0px)');
        } else if (this.templateId === 'no2') {
            this.addPresetText('{"textContent":"<h2>ISSUE SUMMARY</h2>"}', 'translate3d(1060px, 675px, 0px)');
            //add new items
            this.errorService.totalLatestError().subscribe(
                response => {
                    if (response.code == 200) {
                        this.addPresetText(`{"textContent":"New: ${response.data.totalElements} items"}`, 'translate3d(1060px, 710px, 0px)');
                    }
                }, error => console.log(error)
            );

            //add issue summary text
            this.settingService.getDashboardTemplateInfo(30).subscribe(
                res => {
                    if (res.code === 200) {
                        this.addPresetText(`{"textContent":"Issues in 30 days: ${res.data.totalElements} items"}`, 'translate3d(1060px, 725px, 0px)');
                    }
                }, error => console.log(error)
            );
            //add pie chart
            this.addAndRestoreElementLocation(this.elements[7].componentType, 'translate3d(1065px, 175px, 0px)');
        }
    }

    //update the preset textComponents
    updateSummaryCount(newIssueComponent: any, daysComponent: any) {
        if (newIssueComponent) {
            newIssueComponent.element.instance.realtimeData = `Loading...`;
            this.errorService.totalLatestError().subscribe(
                res => {
                    if (res.code == 200) {
                        this.errorList = res.data.errors;
                        this.newIssueCounter = res.data.totalElements;
                        newIssueComponent.element.instance.realtimeData = `New: ${this.newIssueCounter} items`;
                    }
                }, error => console.log(error),
                () => {
                    if (!this.socketApi.isConnected()) {
                        this.connectSocket();
                    }
                    this.onFinishedNewIssue.emit(true);
                }
            );
        } else {
            this.onFinishedNewIssue.emit(true);
        }

        if (daysComponent) {
            daysComponent.element.instance.realtimeData = `Loading...`;
            this.settingService.getDashboardTemplateInfo(30).subscribe(
                res => {
                    if (res.code === 200) {
                        this.daysIssueCounter = res.data.totalElements;
                        daysComponent.element.instance.realtimeData = `Issues in 30 days: ${this.daysIssueCounter} items`;
                    }
                }, error => console.log(error),
                () => {
                    if (!this.socketApi.isConnected()) {
                        this.connectSocket();
                    }
                    this.onFinished30Issue.emit(true);
                }
            );
        } else {
            this.onFinished30Issue.emit(true);
        }
    }


    removeFromElementList(elementId) {
        const index = this.dashboardElements.findIndex(element => element.id === elementId);
        this.dashboardElements.splice(index, 1);
    }

    updateElementData(elementId, dataRef) {
        const index = this.dashboardElements.findIndex(element => element.id === elementId);
        if (index !== -1) {
            this.dashboardElements[index].dataRef = JSON.stringify(dataRef);
        }
    }

    generateId() {
        return new Date().getTime();
    }

    saveDashboard(image) {
        //fire click event of scheme's save button
        let el: HTMLElement = document.getElementById('schemeSaveBtn') as HTMLElement;
        if (el) {
            el.click();
        }
        //// end 

        this.collectDataFromDashboardElement();
        const dataElements = DashboardElement.convertListDashboardElement(this.dashboardElements);

        let dashboard = {
            id: this.currentDashboard ? this.currentDashboard.id : this.generateId(),
            name: this.dashboardForm.get('dashboardName').value,
            elements: dataElements,
            image: image
        };

        this.currentDashboard = dashboard;

        if (this.mode === 'edit') {
            this.settingService.editDashboard(dashboard).subscribe(
                res => {
                },
                error => {
                    console.log(error);
                    this._matSnackBar.open(`There was an error. Please check console log.`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                },
                () =>
                    this._matSnackBar.open(`Edit dashboard successfully.`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    })
            );
        } else {
            this.settingService.addDashboardData(dashboard).subscribe(
                result => {
                },
                error => {
                    this._matSnackBar.open(`There was an error. Please check console log.`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                },
                () => {
                    this._matSnackBar.open(`Added new dashboard with name '${dashboard.name}'.`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                    this.router.navigate([`apps/setting/project-setting/dashboard`]);
                }
            );
        }
    }

    collectDataFromDashboardElement() {
        for (const dashboardElement of this.dashboardElements) {
            const element: ComponentRef<any> = dashboardElement.element;
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
                dashboardElement.location = location;

            }
        }
    }

    getLocationOfNode(node) {
        const styleOfElement = node.getAttribute('style');
        let indexOfCssTransform = -1;
        if (styleOfElement) {
            indexOfCssTransform = styleOfElement.indexOf('transform');
        }

        let cssTransform = '';
        if (indexOfCssTransform > -1) {
            cssTransform = styleOfElement.substring(indexOfCssTransform);
            cssTransform = cssTransform.substring(cssTransform.indexOf(':') + 1, cssTransform.indexOf(';')).trim();
        }
        return cssTransform;
    }

    toggleSideNav() {
        this.sidenav.toggle();
        this.isExpand = !this.isExpand;
    }

    takeScreenshot() {
        const self = this;
        const element: HTMLElement = <HTMLElement>document.querySelector('#drop-container');
        //get list element that have class .action
        const listElement = window.document.querySelectorAll('.action, .wrapper-box');

        this.hideButton(listElement);
        html2canvas(element, { width: 1530, height: 850 }).then(function (canvas) {
            const data = canvas.toDataURL();
            self.saveDashboard(data);
        });
        this.showButtonRemove(listElement);
    }

    hideButton(listE) {
        for (let i = 0; i < listE.length; i++) { //IE11 doesnt support foreach of HTMLElement
            listE[i].hidden = true;
        }
    }

    showButtonRemove(listE) {
        for (let i = 0; i < listE.length; i++) { //IE11 doesnt support foreach of HTMLElement
            listE[i].hidden = false;
        }
    }

    onSave() {
        if (this.dashboardForm.valid) {
            this.takeScreenshot();
        } else {
            this._matSnackBar.open(`Dashboard name is required`, 'OK', {
                verticalPosition: 'bottom',
                duration: 5000
            });
        }
    }

    onBack() {
        this.router.navigate([`apps/setting/project-setting/dashboard`]);
    }

    /////////FOR TEMPLATE-BASED DASHBOARD 
    addAndRestoreElementLocation(elementType: string, location: string) {

        this.addWidgetIntoDashboard(elementType);

        //get the id of the element we just add
        let id = this.dashboardElements[this.dashboardElements.length - 1].id;
        this.restoreElementLocation(id, location);
    }

    onChartSelect(location: string, chartIndex: number) {
        this.currentChart = '';
        if (chartIndex !== 3) {
            this.optionDialogRef = this._matDialog.open(this.chartOptionsOneTemplate);
        } else {
            this.optionDialogRef = this._matDialog.open(this.chartOptionsTwoTemplate);
        }

        this.optionDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.addAndRestoreElementLocation(result, location);
                switch (chartIndex) {
                    case 1:
                        this.chart1Selected = true;
                        break;
                    case 2:
                        this.chart2Selected = true;
                        break;
                }
            }
        });
    }

    existElement(elementType: string): boolean {
        return this.dashboardElements.some(e => e.type === elementType);
    }

    countLength(elementType): number {
        return this.dashboardElements.filter(e => e.type === elementType).length;
    }

    addPresetText(text: string, location: string) {
        let factory: ComponentFactory<any>;
        factory = this.componentFactoryResolver.resolveComponentFactory(TextComponent);

        const component = this.container.createComponent(factory);
        const id = this.generateId();
        component.instance.removeElement.subscribe(result => {
            if (result) {
                component.destroy();
                this.removeFromElementList(id);
            }
        });

        const newElement = new DashboardElement({
            id: id,
            type: TEXT.componentType,
            element: component
        });

        // set input for dashboard element
        component.instance.dataRef = JSON.parse(text);
        component.instance.mode = this.mode;
        newElement.dataRef = text;
        newElement.location = location;
        newElement.id = id;

        this.dashboardElements.push(newElement);
        this.restoreElementLocation(id, location);
    }

    /////////////END TEMPLATE-BASED DASHBOARD/////////////////

    connectSocket() {
        this.socketApi._connect('/topic/signalData', true);

        this.socketApi.receive().subscribe(
            res => {
                if (res.name) {
                    let updatedElements: Array<any> = [];
                    if (res.ack != undefined) { //errorData
                        let signalError = this.errorList.find(e => e.signalName === res.name
                            && e.signalError[1].threshold.id === res.threshold.id); // compare its name and its latest threshold.id => get the signalError
                        if (signalError) { //if the sigError exists in the list
                            //do nothing
                        } else {// new sigError => counter++
                            let newIssueComponent: any;
                            let daysComponent: any;

                            newIssueComponent = this.dashboardElements.find(e => e.type === 'text' && (e.dataRef as string).includes('New:'));
                            daysComponent = this.dashboardElements.find(e => e.type === 'text' && (e.dataRef as string).includes('Issues in 30 days: '));

                            if (newIssueComponent) {
                                this.newIssueCounter++;
                                newIssueComponent.element.instance.realtimeData = `New: ${this.newIssueCounter} items`;
                            }
                            if (daysComponent) {
                                this.daysIssueCounter++;
                                daysComponent.element.instance.realtimeData = `Issues in 30 days: ${this.daysIssueCounter} items`;
                            }

                            let newError: any = {
                                "signalName": res.name,
                                "signalError": [
                                    { "name": res.name },
                                    {
                                        "name": res.name,
                                        "threshold": {
                                            "id": res.threshold.id
                                        }
                                    }
                                ]
                            };

                            this.errorList.push(newError);
                        }
                    } else {//signalData

                        //filter dashboardElements that have the updated signal
                        updatedElements = this.dashboardElements.filter(e => {
                            let dREF = JSON.parse(e.dataRef);
                            if (dREF) {
                                if (typeof dREF.signalName === 'string') { //if signalName is a string
                                    return dREF.signalName === res.name;    //return true if found
                                } else if (dREF.signalName instanceof Array) { //if signalName is string[]
                                    return dREF.signalName.indexOf(dREF.signalName.find(name => name === res.name)) >= 0; //return true if found (has index) while looping through the string[]
                                } else if (dREF.signalPointNames) { //if it's schematic signal points
                                    return dREF.signalPointNames.indexOf(dREF.signalPointNames.find(name => name === res.name)) >= 0; //return true if found (has index) while looping through
                                }
                            }
                        });
                    }

                    //add pieCharts to array, since it always receives both kind of datas
                    updatedElements = updatedElements.concat(this.dashboardElements.filter(e =>
                        e.type === ERROR_PIE_CHART.componentType
                    ));

                    //send the realtime data to all components that needs realtime
                    updatedElements.forEach(e => {
                        e.element.instance.realtimeData = res;
                    });
                }
            }
        );
    }

    disconnectSocket() {
        if (this.socketApi.isConnected()) {
            this.socketApi._disconnect();
        }
    }

    //PLEASE DONT DELETE THIS COMMENT, IT'S FOR TESTING
    // testClick() {
    //     let res: any = {
    //         "id": null,
    //         "name": "Main Pump Filter",
    //         "values": 868.9600219726562,
    //         "timestamp": "2019-12-25T09:13:34.190Z"
    //     }

    //     if (res.name) {
    //         let updatedElements: Array<any> = [];
    //         if (res.ack != undefined) { //errorData

    //             let index: number = this.signalList.indexOf(this.signalList.find(e => e.name === res.name));
    //             if (index >= 0) { //errorData exists in project
    //                 this.daysIssueCounter++;
    //                 this.newIssueCounter++;
    //             }
    //         } else {//signalData

    //             //filter dashboardElements that have the updated signal
    //             updatedElements = this.dashboardElements.filter(e => {
    //                 let dREF = JSON.parse(e.dataRef);
    //                 if (dREF) {
    //                     if (typeof dREF.signalName === "string") { //if signalName is a string
    //                         return dREF.signalName === res.name;    //return true if found
    //                     } else if (dREF.signalName instanceof Array) { //if signalName is string[]
    //                         return dREF.signalName.indexOf(dREF.signalName.find(name => name === res.name)) >= 0; //return true if found (has index) while looping through the string[]
    //                     } else if (dREF.signalPointNames) { //if it's schematic signal points
    //                         return dREF.signalPointNames.indexOf(dREF.signalPointNames.find(name => name === res.name)) >= 0; //return true if found (has index) while looping through
    //                     }
    //                 }
    //             });
    //         }

    //         //pie charts receive both kind of datas
    //         updatedElements = updatedElements.concat(this.dashboardElements.filter(e =>
    //             e.type === ERROR_PIE_CHART.componentType
    //         ));

    //         //send the realtime data to all components that has the signal
    //         updatedElements.forEach(e => {
    //             e.element.instance.realtimeData = res;
    //         });
    //     }
    // }
}
