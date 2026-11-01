package com.mediqueue

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.mediqueue.ui.auth.AuthViewModel
import com.mediqueue.ui.auth.LoginScreen
import com.mediqueue.ui.auth.RegisterScreen
import com.mediqueue.ui.home.HomeScreen
import com.mediqueue.ui.home.HomeViewModel
import com.mediqueue.ui.theme.BackgroundLight

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(color = BackgroundLight) {
                    AppNavigation()
                }
            }
        }
    }
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = viewModel()
    val homeViewModel: HomeViewModel = viewModel()

    NavHost(navController = navController, startDestination = "login") {
        composable("login") {
            LoginScreen(
                viewModel = authViewModel,
                onNavigateToRegister = { navController.navigate("register") },
                onLoginSuccess = { navController.navigate("home") { popUpTo("login") { inclusive = true } } }
            )
        }
        composable("register") {
            RegisterScreen(
                viewModel = authViewModel,
                onNavigateToLogin = { navController.navigate("login") },
                onRegisterSuccess = { navController.navigate("home") { popUpTo("register") { inclusive = true } } }
            )
        }
        composable("home") {
            HomeScreen(
                viewModel = homeViewModel,
                onBookClick = { doctorId ->
                    // Navigation to booking step
                }
            )
        }
    }
}
