package com.mediqueue.data.remote

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ProfileDto(
    val id: String,
    @SerialName("full_name") val fullName: String,
    @SerialName("phone_number") val phoneNumber: String,
    val role: String,
    @SerialName("fcm_token") val fcmToken: String? = null
)

@Serializable
data class AppointmentDto(
    val id: String,
    @SerialName("clinic_id") val clinicId: String,
    @SerialName("branch_id") val branchId: String,
    @SerialName("doctor_id") val doctorId: String,
    @SerialName("patient_id") val patientId: String,
    @SerialName("booking_date") val bookingDate: String,
    @SerialName("token_number") val tokenNumber: Int,
    val status: String,
    val source: String,
    @SerialName("payment_status") val paymentStatus: String
)
