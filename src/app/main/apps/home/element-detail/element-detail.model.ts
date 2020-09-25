import {IDocument, IProject} from '../../menu/setting/setting.model';

export interface IElementDetail extends IProject, IDocument {

}

export class ElementDetail implements IElementDetail {
    constructor(
        // Only project model has
        public projectId?: string,
        public name?: string,
        public address?: string,
        public time?: any,
        // Only document model has
        public id?: string,
        public title?: string,
        public document?: any,
        // Both project and document have
        public image?: any,
    ) {
    }
}


  
