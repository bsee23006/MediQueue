package com.mediqueue.data.remote

import io.github.jan.tennert.supabase.SupabaseClient
import io.github.jan.tennert.supabase.createSupabaseClient
import io.github.jan.tennert.supabase.gotrue.Auth
import io.github.jan.tennert.supabase.postgrest.Postgrest
import io.github.jan.tennert.supabase.realtime.Realtime

object SupabaseProvider {

    // Replace these values with your actual keys from web-dashboard/.env.local
    private const val SUPABASE_URL = "https://bazqgyjudbyggraqtxmn.supabase.co"
    private const val SUPABASE_ANON_KEY = "YOUR_ACTUAL_ANON_KEY_HERE"

    val client: SupabaseClient by lazy {
        createSupabaseClient(
            supabaseUrl = SUPABASE_URL,
            supabaseKey = SUPABASE_ANON_KEY
        ) {
            install(Auth)
            install(Postgrest)
            install(Realtime)
        }
    }
}
