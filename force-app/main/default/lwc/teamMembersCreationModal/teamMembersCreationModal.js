import { LightningElement, track } from 'lwc';

export default class TeamMembersCreationModal extends LightningElement {
    @track showModal = false;

    openModal() {
        this.showModal = true;
    }
}