import { LightningElement, track, api } from 'lwc';

export default class TeamMembersCreationModal extends LightningElement {
    @track showModal = false;
    @api recordId;

    openModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }


}