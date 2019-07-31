/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import apexSearchTeam from '@salesforce/apex/LookupController.searchTeam';
import apexSearchContacts from '@salesforce/apex/LookupController.searchContacts';
import apexSaveTeamMembers from '@salesforce/apex/TeamMembersController.saveTeamMembers';

export default class TeamMembersCreationForm extends LightningElement {
    @api teamId;
    @api teamName;
    @api teamObject;

    @track errors = [];
    
    disableContactInput = false;
    contactIds = [];

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
            if(event.detail.disableContactInput != null) {
                this.template.querySelector('c-contacts-selection-lookup').setInputDisabled(event.detail.disableContactInput);
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

    @api
    handleSaveTeamMembers() {
        //this.template.querySelector('c-contacts-selection-lookup').handleSaveTeamMembers();
        const selectedContacts = this.template.querySelector('c-contacts-selection-lookup').getSelection();
        this.contactIds = selectedContacts.map(element => element.id);
        
        return apexSaveTeamMembers({ teamId: this.teamId
                            , contactIds: this.contactIds})
            .then(() => {
                //console.log(JSON.stringify(results));
                
                //dispatch success message 
                this.notifyUser('Save Success', 'New team members created successfully.', 'success');
            })
            .catch(error => {
                this.notifyUser('Lookup Error', 'An error occured while saving team members.', 'error');
                this.errors = [error];
            });
    }
}