/* eslint-disable no-console */
import { LightningElement, track, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = [
    'Team__c.Name'
];

export default class TeamMembersCreationModal extends LightningElement {
    @track showModal = false;
    @api recordId;

    openModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS})
    team;

    get name() {
        return this.team.data.fields.Name.value;
    }
}