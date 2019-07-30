public with sharing class LookupController {

    private final static Integer MAX_RESULTS = 5;

    @AuraEnabled(Cacheable=true)
    public static List<LookupSearchResult> searchTeam(String searchTerm) {
        
        String teamIcon = 'custom:custom5';

        // Prepare results
        List<LookupSearchResult> results = new List<LookupSearchResult>();
        List<Team__c> teams;

        if(String.isBlank(searchTerm)) {
            teams = [SELECT Id
                                , Name
                                , Location__c
                        FROM Team__c 
                        ORDER BY LastModifiedDate 
                        DESC 
                        LIMIT 5];
        } else {

            // Prepare query paramters
            searchTerm += '*';

            // Execute search query
            List<List<SObject>> searchResults = [FIND :searchTerm IN ALL FIELDS RETURNING
            Team__c (Id, Name, Location__c)
            LIMIT :MAX_RESULTS];

            // Extract Teams & convert them into LookupSearchResult
            teams = ((List<Team__c>) searchResults[0]);
        }

        for (Team__c team : teams) {
            results.add(new LookupSearchResult(team.Id, 'Team', teamIcon, team.Name, 'Team • '+ team.Location__c));
        }
        
        return results;
    }

    @AuraEnabled(Cacheable=true)
    public static List<LookupSearchResult> searchContacts(String parentId, String searchTerm, List<String> selectedIds) {

        String contactIcon = 'standard:contact';

        //get existing contacts Id under this team
        List<String> existingTeamMemberIds = getExistingTeamMemberIds(parentId);
        System.debug(parentId);
        List<String> allIds = new List<String>();
        allIds.addAll(existingTeamMemberIds);
        allIds.addAll(selectedIds);

        // Prepare results
        List<LookupSearchResult> results = new List<LookupSearchResult>();
        List<Contact> contacts;

        if(String.isBlank(searchTerm)) {
            contacts = [SELECT Id
                                , FirstName
                                , LastName
                                , Email 
                        FROM Contact 
                        WHERE Id NOT IN :allIds 
                        ORDER BY LastModifiedDate 
                        DESC 
                        LIMIT 5];
        } else {

            // Prepare query paramters
            searchTerm += '*';

            // Execute search query
            List<List<SObject>> searchResults = [FIND :searchTerm IN ALL FIELDS RETURNING
            Contact (Id, FirstName, LastName, Email WHERE id NOT IN :allIds)
            LIMIT :MAX_RESULTS];

            // Extract Teams & convert them into LookupSearchResult
            contacts = ((List<Contact>) searchResults[0]);
        }

        for (Contact contact : contacts) {
            results.add(new LookupSearchResult(contact.Id, 'Contact', contactIcon, contact.FirstName + ' ' + contact.LastName, contact.Email));
        }

        return results;
    }

    private static List<String> getExistingTeamMemberIds(String parentId) {
        List<String> existingTeamMemberIds = new List<String>();

        if(parentId != null) {
            List<Team_Member__c> existingTeamMembers = [SELECT Contact__c FROM Team_Member__c WHERE Team__c = :parentId];

            for(Team_Member__c member : existingTeamMembers) {
                existingTeamMemberIds.add(member.Contact__c);
            }
        }

        return existingTeamMemberIds;
    }
}