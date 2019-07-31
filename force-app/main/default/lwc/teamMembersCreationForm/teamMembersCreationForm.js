/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import apexSearchTeam from '@salesforce/apex/LookupController.searchTeam';
import apexSearchContacts from '@salesforce/apex/LookupController.searchContacts';

export default class TeamMembersCreationForm extends LightningElement {
    @api teamId;
    @api teamName;
    @api teamObject;

    @track errors = [];
    
    // reset this will clear the child Contact Lookup component selection property
    contacts = [];
    disableContactInput = false;
    
    handleSearchTeam(event) {

        apexSearchTeam({ searchTerm : event.detail.searchTerm })
            .then(results => {
                //console.log(JSON.stringify(results));
                this.template.querySelector('c-team-selection-lookup').setSearchResults(results);
            })
            .catch(error => {
                this.notifyUser('Lookup Error', 'An error occured while searching with the lookup field.', 'error');
                this.errors = [error];
            });
    }

    handleSearchContacts(event) {

        apexSearchContacts({ parentId: this.teamId
                            , searchTerm: event.detail.searchTerm
                            , selectedIds: event.detail.selectedIds})
            .then(results => {
                //console.log(JSON.stringify(results));
                this.template.querySelector('c-contacts-selection-lookup').setSearchResults(results);
            })
            .catch(error => {
                this.notifyUser('Lookup Error', 'An error occured while searching with the lookup field.', 'error');
                this.errors = [error];
            });
    }

    handleSelectionChange(event) {
        this.errors = [];

        if(event.detail) {
            
            //if Team lookup component changed
            this.disableContactInput = event.detail.disableContactInput;

            //if Team lookup component cleared
            if(event.detail.clearContactSelect) {
                this.contacts = [];
            }

            //if Team lookup component clicked
            if(event.detail.teamId) {
                this.teamId = event.detail.teamId;
            }
        }
    }

    notifyUser(title, message, variant) {
        // Notify via toast
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }
}