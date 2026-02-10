export class SignupCredentials {
    readonly name: string
    readonly email: string
    readonly password: string
    readonly phone: string
    readonly is_staff: boolean

    constructor(value: { name: string, email: string, password: string, phone: string, is_staff: boolean }) {
        this.name = value.name
        this.email = value.email.toLowerCase()
        this.password = value.password
        this.phone = value.phone
        this.is_staff = value.is_staff
    }

}