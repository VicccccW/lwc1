/* eslint-disable no-console */
import { LightningElement, track, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = [
    'Team__c.Name'
];

export default class TeamMembersCreationModal extends LightningElement {
    @api recordId;
    @track showModal = false;

    constructor() {
        super();

        // this is an initialzed object / instance of the class, which in this case is TeamMembersCreationModal class
        // bind() create a new function
        // while if pass in this.handleToggleButton(), it's undefined
        // https://www.w3schools.com/jsref/met_document_addeventlistener.asp
        // https://stackoverflow.com/questions/2236747/use-of-the-javascript-bind-method
        this.addEventListener('GLOBAL_TOGGLE_MODAL_BUTTON', this.handleToggleButton.bind(this));
    }

    // does not work
    // connectedCallback() {
    //     registerListener('GLOBAL_TOGGLE_MODAL_BUTTON', this.handleToggleButton, this);
    // }

    // disconnectedCallback() {
    //     // unsubscribe from event
    //     unregisterAllListeners(this);
    // }

    handleToggleButton(event) {
        //disable buttons 
        if(event.detail.disabledRootButton) {
            //disable button
            this.template.querySelectorAll('button').forEach(element => {
                if(element.name !== "Close"){
                    element.setAttribute("disabled", null);
                }
            });
        } else {
            // enable buttons
            this.template.querySelectorAll('button').forEach(element => {
                if(element.name !== "Close"){
                    element.removeAttribute("disabled");
                }
            });
        }
    }

    openModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS})
    team;

    get initParentName() {
        return this.team.data.fields.Name.value;
    }

    get initParentObject() {
        return {id: this.recordId, 
                sObjectType: 'Team__c', 
                icon: 'custom:custom5', 
                title: this.team.data.fields.Name.value};
    }

    handleCancel() {
        this.closeModal();
    }

    handleSave() {
        this.template.querySelector('c-team-members-creation-form')
        .handleSaveTeamMembers()
        .then(() => this.closeModal());
    }
}

// when both field entered, enable save and close 
// when save and close enable, call apex to handle the dml
// enable cancel to send an event, reinit all 