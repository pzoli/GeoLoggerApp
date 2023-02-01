import UserInfo from './UserInfo';
import { firebase } from '@react-native-firebase/database';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export default class FirebaseHelper {

    private loginName: string = '';
    private loginEmail: string = '';
    private loginPassword: string = '';
    private key: string = '';

    private database = firebase.app()
        .database('https://geologger-b9659-default-rtdb.europe-west1.firebasedatabase.app');

    constructor() {
        this.loginEmail = 'orangepi.infokristaly@gmail.com';
        this.loginName = 'Papp Zoltán';
        this.loginPassword = 'test1234';

    }

    public async recordLocatoinOnFirebaseDB(latitude: number, longitude: number) {
        console.log(`Record key=[${this.key}]`);
        const reference = this.database.ref('/geolocations/users/' + this.key);
        reference.update({
            latitude: latitude,
            longitude: longitude
        }).then(() => { console.log("Location recorded.") });
    }

    public sigiIn() {
        return auth().signInWithEmailAndPassword(this.loginEmail, this.loginPassword)
    }

    public createUser() {
        return auth().createUserWithEmailAndPassword(this.loginEmail, this.loginPassword)
    }

    public async reqireKey() {
        let foundKey: string | null = await this.getLoggedInUsernameKey();
        if (foundKey === undefined || foundKey === null || foundKey === '') {
            this.registerUser(new UserInfo(this.loginEmail, this.loginName));
        } else {
            this.key = foundKey;
        }
    }

    public async registerUser(userInfo: UserInfo) {
        const userRegisterReference = this.database.ref('/userRegister/').push();
        await userRegisterReference.set({
            //userkey: userRegiterReference.key,
            uid: auth().currentUser?.uid,
            username: userInfo.username,
            email: userInfo.email,
        });
        this.key = userRegisterReference.key ? userRegisterReference.key : '';
    }

    public async getLoggedInUsernameKey(): Promise<string> {
        let result: string = "";
        let ref = this.database.ref('/userRegister');
        await ref.once('value')
            .then(async snapshot => {
                const val = await snapshot.val()
                for (const key in val) {
                    let userInfo = val[key];
                    if (userInfo.email == auth().currentUser?.email) {
                        result = key;
                    }
                }
            });

        return await result;
    }

}