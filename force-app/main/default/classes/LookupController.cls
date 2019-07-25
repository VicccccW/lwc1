public with sharing class LookupController {

    private final static Integer MAX_RESULTS = 5;

    @AuraEnabled(Cacheable=true)
    public static List<LookupSearchResult> search(String searchTerm) {
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
}