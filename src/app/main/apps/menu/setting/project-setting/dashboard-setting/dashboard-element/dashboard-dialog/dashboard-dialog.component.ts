import {Component, Inject, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatOption, MatSnackBar} from '@angular/material';
import {
    BAR_CHART,
    CATALOG_ITEM,
    DOCUMENT_LINK,
    LINE_CHART_HISTORICAL,
    LINE_CHART_INTENSIVE,
    LINE_CHART_REALTIME,
    PICTURE,
    SCHEMATIC,
    SIGNAL_POINT,
    SIGNAL_POINT_TYPEB,
    TEXT
} from '../../../../../../../../../@rcm/_helpers/constant/dashboard-element-constant';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {SignalService} from 'app/main/apps/services/signal.service';
import {SettingService} from 'app/main/apps/services/setting.service';

@Component({
    selector: 'app-dashboard-dialog',
    templateUrl: './dashboard-dialog.component.html',
    styleUrls: ['./dashboard-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DashboardDialogComponent implements OnInit {

    @ViewChild('textDialog') textDialog: TemplateRef<any>;
    @ViewChild('signalPointDialog') signalPointDialog: TemplateRef<any>;
    @ViewChild('lineHistoryDialog') lineHistoryDialog: TemplateRef<any>;
    @ViewChild('lineIntensiveDialog') lineIntensiveDialog: TemplateRef<any>;
    @ViewChild('lineRealtimeDialog') lineRealtimeDialog: TemplateRef<any>;
    @ViewChild('barDialog') barDialog: TemplateRef<any>;
    @ViewChild('pieDialog') pieDialog: TemplateRef<any>;
    @ViewChild('docLinkDialog') docLinkDialog: TemplateRef<any>;
    @ViewChild('catalogItemDialog') catalogItemDialog: TemplateRef<any>;
    @ViewChild('pictureDialog') pictureDialog: TemplateRef<any>;
    @ViewChild('schematicDialog') schematicDialog: TemplateRef<any>;
    @ViewChild('allSelected') private allSelected: MatOption;

    currentTemplate: TemplateRef<any>;
    currentDataRef: any = {};
    dashboardForm: FormGroup;
    signalList: Array<any> = [];
    pictureUpload: File = null;
    pictureSrc: any = null;
    isShowedImageName: Boolean = false;
    currentSignalSelectionList: Array<any> = [];
    cataList: Array<any> = [];

    constructor(public dashboardDialog: MatDialogRef<DashboardDialogComponent>,
                private _matSnackBar: MatSnackBar,
                @Inject(MAT_DIALOG_DATA) public _data: any,
                private signalService: SignalService,
                private settingService: SettingService) {
        this.currentDataRef = _data.dataRef;
        dashboardDialog.disableClose = true;
    }

    get form() {
        return this.dashboardForm.controls;
    }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        this.initDialog();
    }

    initDialog() {
        switch (this._data.componentType) {
            case TEXT.componentType:
                this.initText();
                break;
            case SIGNAL_POINT.componentType:
            case SIGNAL_POINT_TYPEB.componentType:
                this.initSignalPoint();
                break;
            case LINE_CHART_HISTORICAL.componentType:
                this.initLineHistoryChart();
                break;
            case LINE_CHART_INTENSIVE.componentType:
                this.initLineIntensiveChart();
                break;
            case LINE_CHART_REALTIME.componentType:
                this.initLineRealtimeChart();
                break;
            case BAR_CHART.componentType:
                this.initBarChart();
                break;
            case DOCUMENT_LINK.componentType:
                this.initDocumentLink();
                break;
            case CATALOG_ITEM.componentType:
                this.initCatalogItem();
                break;
            case PICTURE.componentType:
                this.initPicture();
                break;
            case SCHEMATIC.componentType:
                this.initSchematic();
                break;
        }
    }

    initText() {
        this.currentTemplate = this.textDialog;
        this.dashboardForm = new FormGroup({
            'text': new FormControl('', [Validators.required]),
        });
    }

    initSignalPoint() {
        this.currentTemplate = this.signalPointDialog;
        this.dashboardForm = new FormGroup({
            'signalName': new FormControl('', [Validators.required]),
        });
        this.signalService.getSignalPointsDashboardEdit().subscribe(res => {
            if (res.code == 200 && res.data.signalPoints.length > 0) {
                this.signalList = res.data.signalPoints;
            }
        }, error => console.log(error));
    }

    initDocumentLink() {
        this.currentTemplate = this.docLinkDialog;
        this.dashboardForm = new FormGroup({
            'title': new FormControl('', [Validators.required]),
            'link': new FormControl('', [Validators.required]),
        });
    }

    initCatalogItem() {
        this.currentTemplate = this.catalogItemDialog;
        this.dashboardForm = new FormGroup({
            'cataName': new FormControl('', [Validators.required]),
        });
        this.settingService.getDashboardCatalogData().subscribe(
            res => {
                if (res.code == 200 && res.data.catalog.length > 0) {
                    this.cataList = res.data.catalog;
                }
            }
        );
    }

    initPicture() {
        this.currentTemplate = this.pictureDialog;
        this.dashboardForm = new FormGroup({
            'imgSrc': new FormControl('', [Validators.required])
        });
    }

    initLineHistoryChart() {
        this.dashboardForm = new FormGroup({
            'name': new FormControl('', [Validators.required]),
        });
        this.currentTemplate = this.lineHistoryDialog;
        this.signalService.getSignalPointsDashboardEdit().subscribe(res => {
            if (res.code == 200 && res.data.signalPoints.length > 0) {
                this.signalList = res.data.signalPoints;
            }
        }, error => console.log(error));
    }

    initLineIntensiveChart() {
        this.dashboardForm = new FormGroup({
            'name': new FormControl('', [Validators.required]),
        });

        this.currentTemplate = this.lineIntensiveDialog;
        this.signalService.getIntensiveSignals().subscribe(res => {
            if (res.code == 200 && res.data.listIntensiveData.length > 0) {
                this.signalList = res.data.listIntensiveData.map(e => Object({name: e.name, signalId: e.signalId}));
            }
        });
    }

    initLineRealtimeChart() {
        this.dashboardForm = new FormGroup({
            'name': new FormControl('', [Validators.required]),
        });
        this.currentTemplate = this.lineRealtimeDialog;
        this.signalService.getSignalPointsDashboardEdit().subscribe(res => {
            if (res.code == 200 && res.data.signalPoints.length > 0) {
                this.signalList = res.data.signalPoints;
            }
        }, error => console.log(error));
    }

    initBarChart() {
        this.dashboardForm = new FormGroup({
            'name': new FormControl('', [Validators.required]),
        });
        this.currentTemplate = this.barDialog;
        this.signalService.getSignalPointsDashboardEdit().subscribe(res => {
            if (res.code == 200 && res.data.signalPoints.length > 0) {
                this.signalList = res.data.signalPoints;
            }
        }, error => console.log(error));
    }

    initSchematic() {
        this.currentTemplate = this.schematicDialog;
        this.dashboardForm = new FormGroup({
            'imgSrc': new FormControl('', [Validators.required]),
            'schemeName': new FormControl(''),
            'spName': new FormControl(''),
            'cataName': new FormControl(''),
            'danger': new FormControl('')
        });

        this.signalService.getSignalPoints().subscribe(res => {
            if (res.code == 200 && res.data.listSigData.length > 0) {
                this.signalList = res.data.listSigData.sort((a, b) => (a.danger < b.danger) ? 1 : ((b.danger > a.danger) ? -1 : 0));
            }
        });

        this.settingService.getDashboardCatalogData().subscribe(
            res => {
                if (res.code == 200 && res.data.catalog.length > 0) {
                    this.cataList = res.data.catalog;
                }
            }
        );
    }

    onPictureSelect(event) {
        const typeAccept = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
        if (event.target.files.length > 0) {
            const imageImport: File = event.target.files[0];
            if (typeAccept.indexOf(imageImport.type) !== -1) {
                this.pictureUpload = imageImport;

                //read picture content and show it
                let fileReader = new FileReader();
                fileReader.readAsDataURL(event.target.files[0]);
                fileReader.onload = (e) => {
                    this.pictureSrc = fileReader.result;
                    // this.isShowedImageName = true;
                    this.form.imgSrc.setValue(this.pictureSrc);
                };
            } else {
                this._matSnackBar.open(`Please choose only image`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            }
        }
    }

    onSave() {

        if (this.currentTemplate == this.schematicDialog) {//save danger level
            if (this.form.spName.value instanceof Array) {
                let dangerArr = [];
                this.form.spName.value.forEach(sigName => {
                    dangerArr.push(this.signalList.filter(e => e.signal.name == sigName).map(e => e.danger)[0]);
                });
                this.form.danger.setValue(dangerArr);
            } else {
                this.form.danger.setValue(this.signalList.filter(e => e.signal.name == this.form.spName).map(e => e.danger)[0]);
            }
        }

        this.dashboardDialog.close(this.dashboardForm.value);
    }

    togglePerSelection() {
        if (this.allSelected.selected) {
            this.allSelected.deselect();
            return false;
        }
        if (this.currentTemplate !== this.schematicDialog) {
            if (this.signalList.length == this.form.name.value.length) {
                this.allSelected.select();
            }
        } else {
            if (this.signalList.length == this.form.spName.value.length) {
                this.allSelected.select();
            }
        }

    }

    toggleAllSelection() {
        if (this.currentTemplate !== this.schematicDialog) {
            if (this.allSelected.selected) {
                this.form.name.setValue([...this.signalList.map(e => e.name), 0]);
            } else {
                this.form.name.setValue([]);
            }

        } else {
            if (this.allSelected.selected) {
                this.form.spName.setValue([...this.signalList.map(e => e.name), 0]);
            } else {
                this.form.spName.setValue([]);
            }
        }
    }

    toggleAllSelectionSchematic() {
        if (this.currentTemplate !== this.schematicDialog) {
            if (this.allSelected.selected) {
                this.form.name.setValue([...this.signalList.map(e => e.signal.name), 0]);
            } else {
                this.form.name.setValue([]);
            }

        } else {
            if (this.allSelected.selected) {
                this.form.spName.setValue([...this.signalList.map(e => e.signal.name), 0]);
            } else {
                this.form.spName.setValue([]);
            }
        }
    }

    signalSelectChange() {
        if (this.form.name.value.length < 5) {
            this.currentSignalSelectionList = this.form.name.value;
        } else {
            this.form.name.setValue(this.currentSignalSelectionList);
        }
    }
}
