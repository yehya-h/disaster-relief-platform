package com.drp.modules

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class UserDataModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UserDataModule"
    }

//    @ReactMethod
//    fun setUserId(userId: String, promise: Promise) {
//        try {
//            val sharedPref = reactApplicationContext.getSharedPreferences("UserData", Context.MODE_PRIVATE)
//            with(sharedPref.edit()) {
//                putString("userId", userId)
//                apply()
//            }
//            promise.resolve(true)
//        } catch (e: Exception) {
//            promise.reject("ERROR", e.message)
//        }
//    }

    @ReactMethod
    fun setAuthToken(token: String, promise: Promise) {
        try {
            val sharedPref = reactApplicationContext.getSharedPreferences("UserData", Context.MODE_PRIVATE)
            with(sharedPref.edit()) {
                putString("authToken", token)
                apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearUserData(promise: Promise) {
        try {
            val sharedPref = reactApplicationContext.getSharedPreferences("UserData", Context.MODE_PRIVATE)
            with(sharedPref.edit()) {
                clear()
                apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}