package com.drp.services

import android.app.*
import android.content.Context
import android.content.Intent
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.*
import android.provider.Settings

class LocationForegroundService : Service() {
    
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationRequest: LocationRequest
    private lateinit var locationCallback: LocationCallback
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "LocationServiceChannel"
        private const val LOCATION_UPDATE_INTERVAL = 60 * 1000L // 1 minute

        // API Configuration - Update these with your backend details
        private const val API_BASE_URL = "https://disaster-relief-platform-6q95.onrender.com"
        private const val API_ENDPOINT = "/api/live-locations/update"
        private const val API_TIMEOUT = 30000 // 30 seconds
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        setupLocationRequest()
        setupLocationCallback()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, createNotification())
        startLocationUpdates()
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Location Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Running location tracking in background"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Location Tracking Active")
            .setContentText("Tracking your location every 5 minutes")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun setupLocationRequest() {
        locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, LOCATION_UPDATE_INTERVAL)
            .setWaitForAccurateLocation(false)
            .setMinUpdateIntervalMillis(LOCATION_UPDATE_INTERVAL)
            .setMaxUpdateDelayMillis(LOCATION_UPDATE_INTERVAL * 2)
            .build()
    }

    private fun setupLocationCallback() {
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                locationResult.lastLocation?.let { location ->
                    handleLocationUpdate(location)
                }
            }
        }
    }

    private fun startLocationUpdates() {
        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
            Log.d("LocationService", "Location updates started")
        } catch (securityException: SecurityException) {
            Log.e("LocationService", "Location permission not granted", securityException)
        }
    }

    private fun handleLocationUpdate(location: Location) {
        val locationData = JSONObject().apply {
            put("latitude", location.latitude)
            put("longitude", location.longitude)
            put("accuracy", location.accuracy)
            put("timestamp", System.currentTimeMillis())
        }

        Log.d("LocationService", "Location update: $locationData")
        
        // Save locally first (as backup)
        saveLocationLocally(locationData.toString())
        
        // Send to backend API
        sendLocationToAPI(location)
    }

    private fun sendLocationToAPI(location: Location) {
        serviceScope.launch {
            try {
                // Get userId from SharedPreferences (you need to set this when user logs in)
                // val userId = getUserId()

                // if (userId.isNullOrEmpty()) {
                //     Log.w("LocationService", "No userId found, skipping API call")
                //     return@launch
                // }

                // Get authToken from SharedPreferences (you need to set this when user logs in)
                val authToken = getAuthToken()

                if (authToken.isNullOrEmpty()) {
                    Log.w("LocationService", "No authToken found, skipping API call")
                    return@launch
                }

                val success = postLocationToAPI(
                    // userId = userId,
                    latitude = location.latitude,
                    longitude = location.longitude,
                    accuracy = location.accuracy,
                    timestamp = System.currentTimeMillis()
                )

                if (success) {
                    Log.d("LocationService", "Location sent to API successfully")
                    updateNotification("Location synced successfully")
                } else {
                    Log.e("LocationService", "Failed to send location to API")
                    updateNotification("Failed to sync location")
                }

            } catch (e: Exception) {
                Log.e("LocationService", "Error sending location to API", e)
                updateNotification("Error syncing location")
            }
        }
    }

    private suspend fun postLocationToAPI(
        // userId: String,
        latitude: Double,
        longitude: Double,
        accuracy: Float,
        timestamp: Long
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            val url = URL("$API_BASE_URL$API_ENDPOINT")
            val connection = url.openConnection() as HttpURLConnection
            
            connection.apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                // Add authorization header if needed
                setRequestProperty("Authorization", "Bearer ${getAuthToken()}")
                doOutput = true
                connectTimeout = API_TIMEOUT
                readTimeout = API_TIMEOUT
            }

            // Create JSON payload
            val jsonPayload = JSONObject().apply {
                // put("userId", userId)
                put("latitude", latitude)
                put("longitude", longitude)
                put("accuracy", accuracy)
                put("timestamp", timestamp)
                put("deviceId", getCustomDeviceId()) // Optional: add device identifier
            }
            Log.d("LocationService", "Auth token: Bearer ${getAuthToken()}")
            // Send request
            connection.outputStream.use { outputStream ->
                OutputStreamWriter(outputStream).use { writer ->
                    writer.write(jsonPayload.toString())
                    writer.flush()
                }
            }

            val responseCode = connection.responseCode
            Log.d("LocationService", "API Response Code: $responseCode")

            if (responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_CREATED) {
                val response = connection.inputStream.bufferedReader().use { it.readText() }
                Log.d("LocationService", "API Response: $response")
                return@withContext true
            } else {
                val errorResponse = connection.errorStream?.bufferedReader()?.use { it.readText() }
                Log.e("LocationService", "API Error Response: $errorResponse")
                return@withContext false
            }

        } catch (e: Exception) {
            Log.e("LocationService", "Network error sending location", e)
            return@withContext false
        }
    }

//    private fun getUserId(): String? {
//        val sharedPref = getSharedPreferences("UserData", Context.MODE_PRIVATE)
//        return sharedPref.getString("userId", null)
//    }

//    private fun getCustomDeviceId(): String {
//        val sharedPref = getSharedPreferences("DeviceData", Context.MODE_PRIVATE)
//        var deviceId = sharedPref.getString("deviceId", null)
        
//        if (deviceId == null) {
//            // Generate a unique device ID
//            deviceId = java.util.UUID.randomUUID().toString()
//            sharedPref.edit().putString("deviceId", deviceId).apply()
//        }
        
//        return deviceId
//    }

    private fun getCustomDeviceId(): String {
    // Option 1: Use Android ID (same across installs, but can change on factory reset)
    return Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
    
    // Option 2: Use a combination approach
//    val androidId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
//    return "device_${androidId}"
}

    private fun getAuthToken(): String? {
        val sharedPref = getSharedPreferences("UserData", Context.MODE_PRIVATE)
        return sharedPref.getString("authToken", null)
    }

    private fun updateNotification(message: String) {
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Location Tracking Active")
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun saveLocationLocally(locationJson: String) {
        val sharedPref = getSharedPreferences("LocationData", Context.MODE_PRIVATE)
        with(sharedPref.edit()) {
            putString("lastLocation", locationJson)
            putLong("lastUpdateTime", System.currentTimeMillis())
            apply()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        fusedLocationClient.removeLocationUpdates(locationCallback)
        serviceScope.cancel() // Cancel all coroutines
        Log.d("LocationService", "Location service destroyed")
    }
}