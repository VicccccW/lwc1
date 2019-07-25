/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';

const MINIMAL_SEARCH_TERM_LENGTH = 2; // Min number of chars required to search
const SEARCH_DELAY = 300; // Wait 300 ms after user stops typing then, peform search

export default class TeamSelectionLookup extends LightningElement {

    @api defaultTeamId;
    @api placeholder = '';
    @api selection = [];
    @api errors = [];
    @api scrollAfterNItems;

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

// INTERNAL FUNCTIONS

    updateSearchTerm(newSearchTerm) {
        // why this line? for what purposes?
        this.searchTerm = newSearchTerm;

        // Compare clean new search term with current one and abort if identical
        const newCleanSearchTerm = newSearchTerm.trim().replace(/\*/g, '').toLowerCase();
        if (this.cleanSearchTerm === newCleanSearchTerm) {
            return;
        }

        // Save clean search term
        this.cleanSearchTerm = newCleanSearchTerm;

        // Ignore search terms that are too small
        if (newCleanSearchTerm.length < MINIMAL_SEARCH_TERM_LENGTH) {
            this.searchResults = [];
            return;
        }

        // Apply search throttling (prevents search if user is still typing)
        if (this.searchThrottlingTimeout) {
            clearTimeout(this.searchThrottlingTimeout);
        }

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.searchThrottlingTimeout = setTimeout(() => {
                // Send search event if search term is long enougth
                if (this.cleanSearchTerm.length >= MINIMAL_SEARCH_TERM_LENGTH) {
                    const searchEvent = new CustomEvent('search', {
                        detail: {
                            searchTerm: this.cleanSearchTerm
                            //selectedIds: this.selection.map(element => element.id)
                        }
                    });

                    this.dispatchEvent(searchEvent);
                }
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
        return this.selection.length > 0;
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

    handleFocus() {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
        this.hasFocus = true;
    }

    handleBlur() {
        // Prevent action if selection is not allowed
        if (!this.isSelectionAllowed()) {
            return;
        }
        // Delay hiding combobox so that we can capture selected result
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.blurTimeout = window.setTimeout(() => {
                this.hasFocus = false;
                this.blurTimeout = null;
            },
            300
        );
    }

// STYLE EXPRESSIONS

    get getContainerClass() {
        let css = 'slds-combobox_container slds-has-inline-listbox ';
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
        return this.hasSelection() ? this.selection[0].icon : 'custom:custom5';
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
        return this.hasSelection() ? this.selection[0].title : this.searchTerm;
    }

    get getSearchIconClass() {
        let css = 'slds-input__icon slds-input__icon_right ';
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
        return 'slds-listbox slds-listbox_vertical slds-dropdown_fluid '
            + (this.scrollAfterNItems ? 'slds-dropdown_length-with-icon-' + this.scrollAfterNItems : '');
    }
}