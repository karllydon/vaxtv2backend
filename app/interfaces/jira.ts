export interface JiraInterface {
    getJira(status: string, developer: string, current_sprint: boolean): any
    getJiraJQL(jql: string): any
    getCurrentSprintDetails(): any
    getDeveloperOpenTickets(): any 
    getDtnOpentickets(): any
    getBurndownData(): any 
    getRoadMap(): any
}
