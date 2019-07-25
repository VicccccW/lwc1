/* eslint-disable no-console */

import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import apexSearch from '@salesforce/apex/LookupController.search';

export default class TeamMembersCreationForm extends LightningElement {
    @api defaultTeamId;
    @api defaultTeamName;

    handleSearchTeam(event) {

        apexSearch({ searchTerm : event.detail.searchTerm })
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

    notifyUser(title, message, variant) {
        // Notify via toast
        const toastEvent = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(toastEvent);
    }
}