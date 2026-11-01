package com.mediqueue.data.repository

import com.mediqueue.data.remote.ProfileDto
import com.mediqueue.data.remote.SupabaseProvider
import io.github.jan.tennert.supabase.gotrue.auth
import io.github.jan.tennert.supabase.gotrue.providers.builtin.Email
import io.github.jan.tennert.supabase.postgrest.postgrest

class AuthRepository {

    private val client = SupabaseProvider.client

    suspend fun signUpPatient(email: String, password: String, fullName: String, phone: String): Result<Boolean> {
        return try {
            client.auth.signUpWith(Email) {
                this.email = email
                this.password = password
            }
            val userId = client.auth.currentUserOrNull()?.id ?: return Result.failure(Exception("User ID missing"))

            val newProfile = ProfileDto(
                id = userId,
                fullName = fullName,
                phoneNumber = phone,
                role = "patient"
            )

            client.postgrest["profiles"].insert(newProfile)
            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun login(email: String, password: String): Result<Boolean> {
        return try {
            client.auth.signInWith(Email) {
                this.email = email
                this.password = password
            }
            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun isUserLoggedIn(): Boolean {
        return client.auth.currentUserOrNull() != null
    }

    suspend fun logout() {
        client.auth.signOut()
    }
}
