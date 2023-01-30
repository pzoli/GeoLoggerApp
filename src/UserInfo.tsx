export default class UserHelpMe {
    private _username: string;
    private _email: string;
    constructor(email: string, username: string) {
        this._username = username;
        this._email = email;
    }

    public get username(): string {
        return this._username;
    }
    public set username(value: string) {
        this._username = value;
    }

    public get email(): string {
        return this._email;
    }
    public set email(value: string) {
        this._email = value;
    }
}