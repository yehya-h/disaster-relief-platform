package com.drp.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.drp.services.LocationForegroundService

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            // Check if user has enabled auto-start in your app settings
            val sharedPref = context.getSharedPreferences("AppSettings", Context.MODE_PRIVATE)
            val autoStart = sharedPref.getBoolean("autoStartLocationService", false)
            
            if (autoStart) {
                val serviceIntent = Intent(context, LocationForegroundService::class.java)
                context.startForegroundService(serviceIntent)
            }
        }
    }
}