export interface GoogleInterface {
    getGA(): Promise<any>
    getDynatrace(): Promise<any>
    getUsersInfo(): any
}
