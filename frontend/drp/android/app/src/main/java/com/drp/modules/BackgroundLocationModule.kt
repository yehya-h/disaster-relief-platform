package com.drp.modules

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.drp.services.LocationForegroundService

class BackgroundLocationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BackgroundLocationModule"
    }

    @ReactMethod
    fun startLocationService(promise: Promise) {
        try {
            val context = reactApplicationContext
            val serviceIntent = Intent(context, LocationForegroundService::class.java)
            context.startForegroundService(serviceIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopLocationService(promise: Promise) {
        try {
            val context = reactApplicationContext
            val serviceIntent = Intent(context, LocationForegroundService::class.java)
            context.stopService(serviceIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
