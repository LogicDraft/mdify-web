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
import kotlinx.coroutines.flow.first

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

enum class ThemePreference {
    SYSTEM, LIGHT, DARK
}

data class AppSettings(
    val theme: ThemePreference = ThemePreference.SYSTEM,
    val notificationsEnabled: Boolean = true,
    val dynamicColorsEnabled: Boolean = true,
    val geminiApiKey: String = "",
    val aiUsageDate: String = "",
    val aiUsageCount: Int = 0
)

class SettingsRepository(private val context: Context) {
    private val THEME_KEY = stringPreferencesKey("theme_preference")
    private val NOTIFICATIONS_KEY = booleanPreferencesKey("notifications_enabled")
    private val DYNAMIC_COLORS_KEY = booleanPreferencesKey("dynamic_colors_enabled")
    private val GEMINI_API_KEY = stringPreferencesKey("gemini_api_key")
    private val AI_USAGE_DATE_KEY = stringPreferencesKey("ai_usage_date")
    private val AI_USAGE_COUNT_KEY = androidx.datastore.preferences.core.intPreferencesKey("ai_usage_count")

    val settings: Flow<AppSettings> = context.dataStore.data.map { preferences ->
        val themeString = preferences[THEME_KEY] ?: ThemePreference.SYSTEM.name
        val notifications = preferences[NOTIFICATIONS_KEY] ?: true
        val dynamicColors = preferences[DYNAMIC_COLORS_KEY] ?: true
        val apiKey = preferences[GEMINI_API_KEY] ?: ""
        val usageDate = preferences[AI_USAGE_DATE_KEY] ?: ""
        val usageCount = preferences[AI_USAGE_COUNT_KEY] ?: 0

        AppSettings(
            theme = try { ThemePreference.valueOf(themeString) } catch (e: Exception) { ThemePreference.SYSTEM },
            notificationsEnabled = notifications,
            dynamicColorsEnabled = dynamicColors,
            geminiApiKey = apiKey,
            aiUsageDate = usageDate,
            aiUsageCount = usageCount
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

    suspend fun updateDynamicColors(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[DYNAMIC_COLORS_KEY] = enabled
        }
    }

    suspend fun updateGeminiApiKey(key: String) {
        context.dataStore.edit { preferences ->
            preferences[GEMINI_API_KEY] = key
        }
    }

    suspend fun recordAiUsage() {
        val today = java.time.LocalDate.now().toString()
        context.dataStore.edit { preferences ->
            val currentDate = preferences[AI_USAGE_DATE_KEY] ?: ""
            if (currentDate != today) {
                preferences[AI_USAGE_DATE_KEY] = today
                preferences[AI_USAGE_COUNT_KEY] = 1
            } else {
                val currentCount = preferences[AI_USAGE_COUNT_KEY] ?: 0
                preferences[AI_USAGE_COUNT_KEY] = currentCount + 1
            }
        }
    }

    suspend fun getSettingsData(): com.mdify.app.model.AppSettingsData {
        val preferences = context.dataStore.data.first()
        return com.mdify.app.model.AppSettingsData(
            theme = preferences[THEME_KEY] ?: ThemePreference.SYSTEM.name,
            notificationsEnabled = preferences[NOTIFICATIONS_KEY] ?: true,
            dynamicColorsEnabled = preferences[DYNAMIC_COLORS_KEY] ?: true,
            geminiApiKey = preferences[GEMINI_API_KEY] ?: "",
            aiUsageDate = preferences[AI_USAGE_DATE_KEY] ?: "",
            aiUsageCount = preferences[AI_USAGE_COUNT_KEY] ?: 0
        )
    }

    suspend fun restoreSettingsData(data: com.mdify.app.model.AppSettingsData) {
        context.dataStore.edit { preferences ->
            preferences[THEME_KEY] = data.theme
            preferences[NOTIFICATIONS_KEY] = data.notificationsEnabled
            preferences[DYNAMIC_COLORS_KEY] = data.dynamicColorsEnabled
            preferences[GEMINI_API_KEY] = data.geminiApiKey
            preferences[AI_USAGE_DATE_KEY] = data.aiUsageDate
            preferences[AI_USAGE_COUNT_KEY] = data.aiUsageCount
        }
    }

    suspend fun clear() {
        context.dataStore.edit { preferences ->
            preferences.clear()
        }
    }
}
