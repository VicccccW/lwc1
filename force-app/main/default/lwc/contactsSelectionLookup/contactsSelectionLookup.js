/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';

const MINIMAL_SEARCH_TERM_LENGTH = 2; // Min number of chars required to search
const SEARCH_DELAY = 300; // Wait 300 ms after user stops typing then, peform search

export default class ContactsSelectionLookup extends LightningElement {

    @api selection = [];
    @api errors = [];
    @api scrollAfterNItems;
    @api inputDisabled;

    @track searchTerm = '';
    @track searchResults = [];
    @track hasFocus = false;

    cleanSearchTerm;
    blurTimeout;
    searchThrottlingTimeout;

// EXPOSED FUNCTIONS

    @api
    setSearchResults(results) {
        this.searchResults = results.map(result => {
            if (typeof result.icon === 'undefined') {
                result.icon = 'custom:custom5';
            }

            return result;
        });
    }

    @api
    getSelection() {
        return this.selection;
    }

    @api 
    setInputDisabled(disabled) {
        if(disabled) {
            this.inputDisabled = true;
            this.selection = [];
        } else {
            this.inputDisabled = false;
        }
    }

// INTERNAL FUNCTIONS

    updateSearchTerm(newSearchTerm) {
        // Display the searchTerm in front end
        this.searchTerm = newSearchTerm;

        // Compare clean new search term with current one and abort if identical
        if(newSearchTerm !== '') {
            const newCleanSearchTerm = newSearchTerm.trim().replace(/\*/g, '').toLowerCase();
            if (this.cleanSearchTerm === newCleanSearchTerm) {
                return;
            }

            // Ignore search terms that are too small
            if (this.searchTerm.length !== 0 && newCleanSearchTerm.length < MINIMAL_SEARCH_TERM_LENGTH) {
                this.searchResults = [];
                return;
            }

            // Save clean search term
            this.cleanSearchTerm = newCleanSearchTerm;
        }

        // Apply search throttling (prevents search if user is still typing)
        if (this.searchThrottlingTimeout) {
            clearTimeout(this.searchThrottlingTimeout);
        }

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.searchThrottlingTimeout = setTimeout(() => {
                // Send search event if search term is long enougth

                let searchEvent;

                if (this.searchTerm.length === 0) {
                    searchEvent = new CustomEvent('search', {
                        detail: {
                            searchTerm: this.searchTerm,
                            selectedIds: this.selection.map(element => element.id)
                        }
                    });
                } else if (this.cleanSearchTerm.length >= MINIMAL_SEARCH_TERM_LENGTH) {
                    searchEvent = new CustomEvent('search', {
                        detail: {
                            searchTerm: this.cleanSearchTerm,
                            selectedIds: this.selection.map(element => element.id)
                        }
                    });
                }

                this.dispatchEvent(searchEvent);
                this.searchThrottlingTimeout = null;
            },
            SEARCH_DELAY
        );
    }

    hasResults() {
        return this.searchResults.length > 0;
    }

    hasSelection() {
        return this.selection.length > 0;
    }

// EVENT HANDLING

    // This event is similar to the onchange event. 
    // The difference is that the oninput event occurs immediately after the value of an element has changed, 
    // while onchange occurs when the element loses focus, after the content has been changed. 
    handleInput(event) {
        this.updateSearchTerm(event.target.value);
    }

    handleComboboxClick() {
        // Hide combobox immediatly
        if (this.blurTimeout) {
            window.clearTimeout(this.blurTimeout);
        }
        this.hasFocus = false;
    }

    handleResultClick(event) {
        const recordId = event.currentTarget.dataset.recordid;

        // Save selection
        let selectedItem = this.searchResults.filter(result => result.id === recordId);
        if (selectedItem.length === 0) {
            return;
        }
        selectedItem = selectedItem[0];
        const newSelection = [...this.selection];
        newSelection.push(selectedItem);
        this.selection = newSelection;

        // Reset search
        this.searchTerm = '';
        this.searchResults = [];

        // Notify parent components that selection has changed
        const selectionEventParent = new CustomEvent('selectionchange');

        this.dispatchEvent(selectionEventParent);

        // Notify Root components that Contact lookup component has changed
        const selectionEventRoot = new CustomEvent('GLOBAL_TOGGLE_MODAL_BUTTON', {
            detail: {
                disabledRootButton: false
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(selectionEventRoot); 
    }

    handleFocus() {
        this.hasFocus = true;
        this.updateSearchTerm(this.searchTerm);
    }

    handleBlur() {
        this.searchTerm = '';
        this.cleanSearchTerm = null;

        // Delay hiding combobox so that we can capture selected result
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.blurTimeout = window.setTimeout(() => {
                this.hasFocus = false;
                this.blurTimeout = null;
                this.searchTerm = '';
            },
            300
        );
    }

    handleRemoveSelectedItem(event) {
        const recordId = event.currentTarget.name;
        this.selection = this.selection.filter(item => item.id !== recordId);
        // Notify parent components that selection has changed
        this.dispatchEvent(new CustomEvent('selectionchange'));

        if(this.selection.length === 0) {
            // Notify Root components that Contact lookup component has changed
            const selectionEvent = new CustomEvent('GLOBAL_TOGGLE_MODAL_BUTTON', {
                detail: {
                    disabledRootButton: true
                },
                bubbles: true,
                composed: true
            });

            this.dispatchEvent(selectionEvent); 
        }
    }

// STYLE EXPRESSIONS

    get getContainerClass() {
        let css = 'slds-combobox_container  ';
        if (this.hasFocus && this.hasResults()) {
            css += 'slds-has-input-focus ';
        }
        if (this.errors.length > 0) {
            css += 'has-custom-error';
        } 
        return css;
    }

    get getDropdownClass() {
        let css = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ';
        if (this.hasFocus && this.hasResults()) {
            css += 'slds-is-open';
        } else {
            css += 'slds-combobox-lookup';
        }
        return css;
    }

    get getComboboxClass() {
        let css = 'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right ';
        return css;
    }

    get getSelectIconName() {
        return this.hasSelection() ? this.selection.icon : 'custom:custom5';
    }

    get getSelectIconClass() {
        return 'slds-combobox__input-entity-icon '
            + (this.hasSelection() ? '' : 'slds-hide');
    }

    get getInputClass() {
        let css = 'slds-input slds-combobox__input has-custom-height '
            + (this.errors.length === 0 ? '' : 'has-custom-error ');
        return css;
    }

    get getInputValue() {
        return this.searchTerm;
    }

    get getSearchIconClass() {
        let css = 'slds-input__icon slds-input__icon_right ';
        if(this.inputDisabled) {
            css += 'slds-hide';
        }
        return css;
    }

    get getClearSelectionButtonClass() {
        return 'slds-button slds-button_icon slds-input__icon slds-input__icon_right '
            + (this.hasSelection() ? '' : 'slds-hide');
    }

    get isInputReadonly() {
        return false;
    }

    get isInputDisabled() {
        return this.inputDisabled;
    }

    get isExpanded() {
        return this.hasResults();
    }

    get getListboxClass() {
        return 'slds-listbox slds-listbox_vertical '
            + (this.scrollAfterNItems ? 'slds-dropdown_length-with-icon-' + this.scrollAfterNItems : '');
    }
}