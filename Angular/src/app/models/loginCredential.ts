export class LoginCredentials {
    readonly email: string
    readonly password: string

    constructor(value: { email: string, password: string }) {
        this.email = value.email.toLowerCase()
        this.password = value.password
    }

}