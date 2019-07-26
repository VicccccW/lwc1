/* eslint-disable no-console */

import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import apexSearchTeam from '@salesforce/apex/LookupController.searchTeam';
import apexSearchContacts from '@salesforce/apex/LookupController.searchContacts';

export default class TeamMembersCreationForm extends LightningElement {
    @api initParentId;
    @api initParentName;
    @api initParentObject;

    @track errors = [];

    handleSearchTeam(event) {

        apexSearchTeam({ searchTerm : event.detail.searchTerm })
            .then(results => {
                //console.log(JSON.stringify(results));
                this.template.querySelector('c-team-selection-lookup').setSearchResults(results);
            })
            .catch(error => {
                this.notifyUser('Lookup Error', 'An error occured while searching with the lookup field.', 'error');
                // eslint-disable-next-line no-console
                console.error('Lookup error', JSON.stringify(error));
                this.errors = [error];
            });
    }

    handleSearchContacts(event) {

        apexSearchContacts({ parentId: this.parentId
                            , searchTerm: event.detail.searchTerm
                            , selectedIds: event.detail.selectedIds})
            .then(results => {
                //console.log(JSON.stringify(results));
                this.template.querySelector('c-contacts-selection-lookup').setSearchResults(results);
            })
            .catch(error => {
                this.notifyUser('Lookup Error', 'An error occured while searching with the lookup field.', 'error');
                // eslint-disable-next-line no-console
                console.error('Lookup error', JSON.stringify(error));
                this.errors = [error];
            });
    }

    handleSelectionChange() {
        this.errors = [];
    }

    notifyUser(title, message, variant) {
        // Notify via toast
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }
}