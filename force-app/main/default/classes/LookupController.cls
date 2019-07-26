public with sharing class LookupController {

    private final static Integer MAX_RESULTS = 5;

    @AuraEnabled(Cacheable=true)
    public static List<LookupSearchResult> searchTeam(String searchTerm) {
        // Prepare query paramters
        searchTerm += '*';

        // Execute search query
        List<List<SObject>> searchResults = [FIND :searchTerm IN ALL FIELDS RETURNING
            Team__c (Id, Name, Location__c)
            LIMIT :MAX_RESULTS];

        // Prepare results
        List<LookupSearchResult> results = new List<LookupSearchResult>();

        // Extract Teams & convert them into LookupSearchResult
        String teamIcon = 'custom:custom5';
        Team__c [] teams = ((List<Team__c>) searchResults[0]);
        for (Team__c team : teams) {
            results.add(new LookupSearchResult(team.Id, 'Team', teamIcon, team.Name, 'Team • '+ team.Location__c));
        }
        
        return results;
    }

    @AuraEnabled(Cacheable=true)
    public static List<LookupSearchResult> searchContacts(String parentId, String searchTerm, List<String> selectedIds) {
        // Prepare query paramters
        searchTerm += '*';

        //get existing contacts Id under this team
        List<String> existingTeamMemberIds = getExistingTeamMemberIds(parentId);

        List<String> allIds = new List<String>();
        allIds.addAll(existingTeamMemberIds);
        allIds.addAll(selectedIds);

        // Execute search query
        List<List<SObject>> searchResults = [FIND :searchTerm IN ALL FIELDS RETURNING
            Contact (Id, FirstName, LastName, Email WHERE id NOT IN :allIds)
            LIMIT :MAX_RESULTS];

        // Prepare results
        List<LookupSearchResult> results = new List<LookupSearchResult>();

        // Extract Teams & convert them into LookupSearchResult
        String contactIcon = 'standard:contact';
        Contact [] contacts = ((List<Contact>) searchResults[0]);
        for (Contact contact : contacts) {
            results.add(new LookupSearchResult(contact.Id, 'Contact', contactIcon, contact.FirstName, 'Contact • '+ contact.Email));
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