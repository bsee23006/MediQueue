package com.mediqueue.data.repository

import com.mediqueue.data.remote.AppointmentDto
import com.mediqueue.data.remote.SupabaseProvider
import io.github.jan.tennert.supabase.gotrue.auth
import io.github.jan.tennert.supabase.postgrest.postgrest
import io.github.jan.tennert.supabase.postgrest.query.Columns
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class DoctorInfo(
    val id: String,
    @SerialName("specialization") val specialization: String,
    @SerialName("consultation_fee") val consultationFee: Double,
    @SerialName("avg_consultation_mins") val avgConsultationMins: Int
)

@Serializable
data class TokenResponse(
    @SerialName("appointment_id") val appointmentId: String,
    @SerialName("allocated_token") val allocatedToken: Int
)

class AppointmentRepository {

    private val client = SupabaseProvider.client

    suspend fun getDoctors(): Result<List<DoctorInfo>> {
        return try {
            val list = client.postgrest["doctors"]
                .select()
                .decodeList<DoctorInfo>()
            Result.success(list)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun bookAppointment(
        clinicId: String,
        branchId: String,
        doctorId: String,
        bookingDate: String
    ): Result<TokenResponse> {
        return try {
            val patientId = client.auth.currentUserOrNull()?.id
                ?: return Result.failure(Exception("Patient not authenticated"))

            val response = client.postgrest.rpc(
                function = "allocate_next_token",
                parameters = mapOf(
                    "p_clinic_id" to clinicId,
                    "p_branch_id" to branchId,
                    "p_doctor_id" to doctorId,
                    "p_patient_id" to patientId,
                    "p_booking_date" to bookingDate,
                    "p_source" to "ONLINE"
                )
            ).decodeSingle<TokenResponse>()

            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPatientAppointments(): Result<List<AppointmentDto>> {
        return try {
            val list = client.postgrest["appointments"]
                .select()
                .decodeList<AppointmentDto>()
            Result.success(list)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
