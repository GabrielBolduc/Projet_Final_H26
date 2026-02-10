export class UserCredentials {
    readonly email: string
    readonly password: string

    constructor(value: { username: string, password: string }) {
        this.email = value.username.toLowerCase()
        this.password = value.password
    }

}