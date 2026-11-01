package com.mediqueue.ui.home

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mediqueue.data.remote.AppointmentDto
import com.mediqueue.data.repository.AppointmentRepository
import com.mediqueue.data.repository.DoctorInfo
import kotlinx.coroutines.launch

class HomeViewModel(
    private val repository: AppointmentRepository = AppointmentRepository()
) : ViewModel() {

    var doctors by mutableStateOf<List<DoctorInfo>>(emptyList())
    var appointments by mutableStateOf<List<AppointmentDto>>(emptyList())
    var isLoading by mutableStateOf(false)
    var errorMessage by mutableStateOf<String?>(null)

    fun loadDashboardData() {
        viewModelScope.launch {
            isLoading = true
            errorMessage = null
            
            val docsResult = repository.getDoctors()
            val appsResult = repository.getPatientAppointments()

            isLoading = false

            docsResult.onSuccess { doctors = it }
            appsResult.onSuccess { appointments = it }
            
            if (docsResult.isFailure || appsResult.isFailure) {
                errorMessage = "Failed to update dashboard data."
            }
        }
    }
}
