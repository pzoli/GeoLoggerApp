# GeoLoggerApp
Learning project for ReactNative GeoLocation service.

## Install
You must add google service account by adding android/app/src/main/AndroidManifest.xml

```
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.geologgerapp">
...
    <meta-data
      android:name="com.google.android.geo.API_KEY"
      android:value="API_KEY_VALUE" />
  </application>
</manifest>
```

And you must add android/app/google-services.json accessing your google services.