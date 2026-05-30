package com.mdify.app.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.mdify.app.model.ConversionHistoryItem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.first
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

private val Context.dataStore by preferencesDataStore(name = "mdify_history")

class HistoryRepository(private val context: Context) {
    private val json = Json { ignoreUnknownKeys = true }
    private val historyKey = stringPreferencesKey("history_items")

    val history: Flow<List<ConversionHistoryItem>> = context.dataStore.data.map { prefs ->
        prefs[historyKey]
            ?.let { stored -> runCatching { json.decodeFromString<List<ConversionHistoryItem>>(stored) }.getOrDefault(emptyList()) }
            .orEmpty()
    }

    suspend fun addToHistory(item: ConversionHistoryItem) {
        context.dataStore.edit { prefs ->
            val current = prefs[historyKey]
                ?.let { stored -> runCatching { json.decodeFromString<List<ConversionHistoryItem>>(stored) }.getOrDefault(emptyList()) }
                .orEmpty()
            prefs[historyKey] = json.encodeToString(listOf(item) + current.filterNot { it.id == item.id }.take(11))
        }
    }

    suspend fun remove(id: String) {
        context.dataStore.edit { prefs ->
            val current = prefs[historyKey]
                ?.let { stored -> runCatching { json.decodeFromString<List<ConversionHistoryItem>>(stored) }.getOrDefault(emptyList()) }
                .orEmpty()
            prefs[historyKey] = json.encodeToString(current.filterNot { it.id == id })
        }
    }

    suspend fun clear() {
        context.dataStore.edit { prefs ->
            prefs.remove(historyKey)
        }
    }

    suspend fun getAllHistoryItems(): List<ConversionHistoryItem> {
        val prefs = context.dataStore.data.first()
        return prefs[historyKey]?.let { stored -> 
            runCatching { json.decodeFromString<List<ConversionHistoryItem>>(stored) }.getOrDefault(emptyList()) 
        } ?: emptyList()
    }

    suspend fun restoreHistoryItems(items: List<ConversionHistoryItem>) {
        context.dataStore.edit { prefs ->
            prefs[historyKey] = json.encodeToString(items)
        }
    }
}
