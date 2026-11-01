plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.23"
}

android {
    namespace = "com.mediqueue"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.mediqueue"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-


# 1. Return to the root MediQueue1 directory
cd ..

# 2. Ensure the repository and notifications directories exist
New-Item -ItemType Directory -Path "android-app\app\src\main\java\com\mediqueue\data\repository", "android-app\app\src\main\java\com\mediqueue\notifications" -Force

# 3. Create PaymentRepository.kt
@"
package com.mediqueue.data.repository

import com.mediqueue.data.remote.SupabaseProvider
import io.github.jan.tennert.supabase.postgrest.postgrest
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class PaymentMethod {
    @SerialName("JAZZCASH") JAZZCASH,
    @SerialName("EASYPAISA") EASYPAISA,
    @SerialName("CARD") CARD,
    @SerialName("CASH") CASH
}

@Serializable
enum class PaymentStatus {
    @SerialName("PENDING") PENDING,
    @SerialName("PAID") PAID,
    @SerialName("FAILED") FAILED
}

@Serializable
data class PaymentTransaction(
    val id: String? = null,
    @SerialName("appointment_id") val appointmentId: String,
    val amount: Double,
    val method: PaymentMethod,
    val status: PaymentStatus,
    @SerialName("transaction_ref") val transactionRef: String
)

class PaymentRepository {

    private val client = SupabaseProvider.client

    suspend fun processSandboxPayment(
        appointmentId: String,
        amount: Double,
        method: PaymentMethod,
        accountNumber: String
    ): Result<PaymentTransaction> {
        return try {
            kotlinx.coroutines.delay(1500)

            val txRef = "TXN-" + System.currentTimeMillis().toString().takeLast(8)

            val transaction = PaymentTransaction(
                appointmentId = appointmentId,
                amount = amount,
                method = method,
                status = PaymentStatus.PAID,
                transactionRef = txRef
            )

            client.postgrest["payments"].insert(transaction)

            client.postgrest["appointments"]
                .update(mapOf("status" to "CHECKED_IN")) {
                    filter {
                        eq("id", appointmentId)
                    }
                }

            Result.success(transaction)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
