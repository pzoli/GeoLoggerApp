import { firebase } from '@react-native-firebase/database';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, check, RESULTS } from 'react-native-permissions';
import UserInfo from './UserInfo';

const database = firebase.app()
    .database('https://geologger-b9659-default-rtdb.europe-west1.firebasedatabase.app');

function checkPermission() {
    return new Promise((resolve) => {
        request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(() =>
            check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((res) => {
                switch (res) {
                    case RESULTS.GRANTED:
                        resolve(true);
                        return;
                    case RESULTS.UNAVAILABLE:
                        resolve(false);
                        break;
                    default:
                        resolve(false);
                        return;

                }
            })
        )
    })
}

export default function GeoLoggerScreen() {
    let [latitude, setLatitude] = useState(0);
    let [longitude, setLongitude] = useState(0);
    let key: string = '';

    const reqireKey = async () => {
        let foundKey: string | null = await getLoggedInUsernameKey();
        if (foundKey === undefined || foundKey === null || foundKey === '') {
            registerUser(new UserInfo(loginName, 'Papp Zoltán'));
        } else {
            key = foundKey;
        }
    }

    const registerUser = async (userInfo: UserInfo) => {
        const userRegiterReference = database.ref('/userRegister/').push();
        await userRegiterReference.set({
            id: userRegiterReference.key,
            username: userInfo.username,
            email: userInfo.email,
        });
        key = userRegiterReference.key ? userRegiterReference.key : '';
    }

    const startLocationWatch = async () => {
        Geolocation.watchPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                console.log(`Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);
                if (key !== null) {
                    recordLocatoinOnFirebaseDB(key, position.coords.latitude, position.coords.longitude);
                } else {
                    console.log('Key is null!');
                }
            },
            (error) => {
                console.log(error.code, error.message);
            },
            {
                enableHighAccuracy: false,
                interval: 1000,
                distanceFilter: 0.1
            }
        );

    }

    const loginName: string = 'orangepi.infokristaly@gmail.com';
    const loginPassword: string = 'test1234';

    useEffect(() => {
        checkPermission().then(() => {
            auth()
                .createUserWithEmailAndPassword(loginName, loginPassword)
                .then(() => {
                    console.log("Registering done ");
                    sigiIn(loginName, loginPassword);
                }).catch((err) => {
                    console.log("Error at registering: " + err);
                    sigiIn(loginName, loginPassword);
                }).catch((err) => {
                    console.log("Error at login: " + err);
                })
        });
    }, []);

    function sigiIn(loginName: string, loginPassword: string) {
        auth().signInWithEmailAndPassword(loginName, loginPassword)
            .then(() => {
                reqireKey().then(() =>
                    startLocationWatch()
                );
            }).catch((err) => {
                console.log("Error at login: " + err);
            })
    }

    return (
        <View style={{ width: '100%', height: '100%', alignContent: 'center', justifyContent: 'center' }}>
            <Text style={{ textAlign: 'center' }}>Longitude: {longitude}</Text>
            <Text style={{ textAlign: 'center' }}>Latitude: {latitude}</Text>
        </View>
    );
}

async function recordLocatoinOnFirebaseDB(keyValue: string, latitude: number, longitude: number) {
    console.log(`Record key=[${keyValue}]`);
    const reference = database.ref('/geolocations/users/' + keyValue);
    reference.update({
        latitude: latitude,
        longitude: longitude
    }).then(() => { console.log("Location recorded.") });
}

async function getLoggedInUsernameKey(): Promise<string> {
    let result: string = "";
    let ref = database.ref('/userRegister');
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

