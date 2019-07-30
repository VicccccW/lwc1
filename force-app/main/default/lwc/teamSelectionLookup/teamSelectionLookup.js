/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';

const MINIMAL_SEARCH_TERM_LENGTH = 2; // Min number of chars required to search
const SEARCH_DELAY = 300; // Wait 300 ms after user stops typing then, peform search

export default class TeamSelectionLookup extends LightningElement {

    @api selection = null;
    @api errors = [];
    @api scrollAfterNItems;
    @api initParentId;
    @api initParentName;

    @track searchTerm = '';
    @track searchResults = [];
    @track hasFocus = false;

    cleanSearchTerm = null;
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

// INTERNAL FUNCTIONS

    updateSearchTerm(newSearchTerm) {

        //display the entered value in front end
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
                            searchTerm: this.searchTerm
                        }
                    });
                } else if (this.cleanSearchTerm.length >= MINIMAL_SEARCH_TERM_LENGTH) {
                    searchEvent = new CustomEvent('search', {
                        detail: {
                            searchTerm: this.cleanSearchTerm
                        }
                    });
                }

                this.dispatchEvent(searchEvent);
                this.searchThrottlingTimeout = null;
            },
            SEARCH_DELAY
        );
    }

    isSelectionAllowed() {
        return !this.hasSelection();
    }

    hasResults() {
        return this.searchResults.length > 0;
    }

    hasSelection() {
        return this.selection != null;
    }

// EVENT HANDLING

    // This event is similar to the onchange event. 
    // The difference is that the oninput event occurs immediately after the value of an element has changed, 
    // while onchange occurs when the element loses focus, after the content has been changed. 
    handleInput(event) {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
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

        this.selection = selectedItem[0];

        // Reset search
        this.searchTerm = '';
        this.searchResults = [];

        // Notify parent components that selection has changed
        const selectionEvent = new CustomEvent('selectionchange', {
            detail: {
                disableContactInput: false,
                teamId: recordId
            }
        });

        this.dispatchEvent(selectionEvent);
    }

    handleFocus() {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
        this.hasFocus = true;
        this.updateSearchTerm(this.searchTerm);
    }

    handleBlur() {

        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }

        this.searchTerm = '';
        this.cleanSearchTerm = null;

        // Delay hiding combobox so that we can capture selected result
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.blurTimeout = window.setTimeout(() => {
                this.hasFocus = false;
                this.blurTimeout = null;
            },
            300
        );
    }

    handleClearSelection() {
        this.selection = null;

        // Notify parent components that selection has changed
        const selectionEvent = new CustomEvent('selectionchange', {
            detail: {
                disableContactInput: true,
                clearContactSelect: true
            }
        });

        this.dispatchEvent(selectionEvent);
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
        let css = 'slds-combobox__form-element slds-input-has-icon ';
        css += (this.hasSelection() ? 'slds-input-has-icon_left-right' : 'slds-input-has-icon_right');
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
        let css = 'slds-input slds-combobox__input has-custom-height slds-combobox__input-value '
            + (this.errors.length === 0 ? '' : 'has-custom-error ');
        if (this.hasSelection()) {
            css += 'has-custom-border';
        }
        return css;
    }

    get getInputValue() {
        return this.hasSelection() ? this.selection.title : this.searchTerm;
    }

    get getSearchIconClass() {
        let css = 'slds-input__icon slds-input__icon_right ';
        if(this.hasSelection()) {
            css += 'slds-hide';
        }
        return css;
    }

    get getClearSelectionButtonClass() {
        return 'slds-button slds-button_icon slds-input__icon slds-input__icon_right '
            + (this.hasSelection() ? '' : 'slds-hide');
    }

    get isInputReadonly() {
        return this.hasSelection();
    }

    get isExpanded() {
        return this.hasResults();
    }

    get getListboxClass() {
        return 'slds-listbox slds-listbox_vertical '
            + (this.scrollAfterNItems ? 'slds-dropdown_length-with-icon-' + this.scrollAfterNItems : '');
    }
}