public with sharing class TeamMembersController {
    
    //https://developer.salesforce.com/forums/?id=9062I000000IE4kQAG
    //@AuraEnabled(Cacheable=true)
    @AuraEnabled
    public static void saveTeamMembers(String teamId, List<String> contactIds) {
        
        try{
            List<Team_Member__c> newTeamMembers = new List<Team_Member__c>();

            for(String conId : contactIds) {
                Team_Member__c newTeamMember = new Team_Member__c(
                    Team__c = teamId,
                    Contact__c = conId
                );
                newTeamMembers.add(newTeamMember);
            }

            List<Database.SaveResult> saveResults = Database.insert(newTeamMembers, false);
        } catch(Exception e) {
            System.debug(e);
        }
    }
}
