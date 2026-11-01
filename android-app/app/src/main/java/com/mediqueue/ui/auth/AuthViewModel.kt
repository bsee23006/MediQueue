package com.mediqueue.ui.auth

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mediqueue.data.repository.AuthRepository
import kotlinx.coroutines.launch

class AuthViewModel(
    private val repository: AuthRepository = AuthRepository()
) : ViewModel() {

    var email by mutableStateOf("")
    var password by mutableStateOf("")
    var fullName by mutableStateOf("")
    var phoneNumber by mutableStateOf("")

    var isLoading by mutableStateOf(false)
    var errorMessage by mutableStateOf<String?>(null)
    var isSuccess by mutableStateOf(false)

    fun login() {
        if (email.isBlank() || password.isBlank()) {
            errorMessage = "Please enter both email and password."
            return
        }
        viewModelScope.launch {
            isLoading = true
            errorMessage = null
            val result = repository.login(email, password)
            isLoading = false
            result.onSuccess {
                isSuccess = true
            }.onFailure { error ->
                errorMessage = error.localizedMessage ?: "Login failed. Please check your credentials."
            }
        }
    }

    fun register() {
        if (fullName.isBlank() || phoneNumber.isBlank() || email.isBlank() || password.isBlank()) {
            errorMessage = "Please fill in all fields."
            return
        }
        viewModelScope.launch {
            isLoading = true
            errorMessage = null
            val result = repository.signUpPatient(
                email = email,
                password = password,
                fullName = fullName,
                phone = phoneNumber
            )
            isLoading = false
            result.onSuccess {
                isSuccess = true
            }.onFailure { error ->
                errorMessage = error.localizedMessage ?: "Registration failed."
            }
        }
    }
}
