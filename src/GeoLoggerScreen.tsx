import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, check, RESULTS } from 'react-native-permissions';

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
    useEffect(() => {
        checkPermission().then(() => {
            Geolocation.watchPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                    console.log(`Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);
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

        });
    })
    return (
        <View style={{ width: '100%', height: '100%', alignContent: 'center', justifyContent: 'center' }}>
            <Text style={{ textAlign: 'center' }}>Longitude: {longitude}</Text>
            <Text style={{ textAlign: 'center' }}>Latitude: {latitude}</Text>
        </View>
    );
}

