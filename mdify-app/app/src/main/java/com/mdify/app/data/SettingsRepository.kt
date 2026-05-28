package com.mdify.app.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

enum class ThemePreference {
    SYSTEM, LIGHT, DARK
}

data class AppSettings(
    val theme: ThemePreference = ThemePreference.SYSTEM,
    val notificationsEnabled: Boolean = true
)

class SettingsRepository(private val context: Context) {
    private val THEME_KEY = stringPreferencesKey("theme_preference")
    private val NOTIFICATIONS_KEY = booleanPreferencesKey("notifications_enabled")

    val settings: Flow<AppSettings> = context.dataStore.data.map { preferences ->
        val themeString = preferences[THEME_KEY] ?: ThemePreference.SYSTEM.name
        val notifications = preferences[NOTIFICATIONS_KEY] ?: true

        AppSettings(
            theme = try { ThemePreference.valueOf(themeString) } catch (e: Exception) { ThemePreference.SYSTEM },
            notificationsEnabled = notifications
        )
    }

    suspend fun updateTheme(theme: ThemePreference) {
        context.dataStore.edit { preferences ->
            preferences[THEME_KEY] = theme.name
        }
    }

    suspend fun updateNotifications(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[NOTIFICATIONS_KEY] = enabled
        }
    }
}
