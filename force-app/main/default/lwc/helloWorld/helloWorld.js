import { LightningElement, track } from 'lwc';
//import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

export default class HelloWorld extends LightningElement {
    @track greeting = 'World';
    changeHandler(event) {
        this.greeting = event.target.value;
    }
}