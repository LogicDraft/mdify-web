package com.mdify.app

import android.app.Application
import android.content.Context
import android.net.Uri
import androidx.documentfile.provider.DocumentFile
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.mdify.app.data.ConversionEngine
import com.mdify.app.data.HistoryRepository
import com.mdify.app.data.SettingsRepository
import com.mdify.app.data.ThemePreference
import com.mdify.app.model.ConversionHistoryItem
import com.mdify.app.model.ConversionResult
import com.mdify.app.model.MdifyScreen
import com.mdify.app.model.PreviewMode
import com.mdify.app.model.UiState
import com.mdify.app.util.NotificationHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.system.measureTimeMillis

class MdifyViewModel(application: Application) : AndroidViewModel(application) {
    private val appContext: Context = application.applicationContext
    private val historyRepository = HistoryRepository(appContext)
    private val conversionEngine = ConversionEngine(appContext)
    private val notificationHelper = NotificationHelper(appContext)
    private val settingsRepository = SettingsRepository(appContext)

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            historyRepository.history.collect { items ->
                _uiState.update { it.copy(history = items) }
            }
        }
        viewModelScope.launch {
            settingsRepository.settings.collect { settings ->
                _uiState.update { it.copy(appSettings = settings) }
            }
        }
    }

    fun pickDocument(uri: Uri) {
        val fileName = DocumentFile.fromSingleUri(appContext, uri)?.name ?: "document"
        val fileSize = DocumentFile.fromSingleUri(appContext, uri)?.length() ?: 0L
        val fileType = when {
            fileName.endsWith(".pdf", ignoreCase = true) -> "pdf"
            else -> "docx"
        }

        _uiState.update {
            it.copy(
                screen = MdifyScreen.Processing,
                processingFileName = fileName,
                processingStatus = "Extracting document content",
                processingProgress = 0.08f
            )
        }

        viewModelScope.launch {
            try {
                tickProgress(0.18f, "Reading file bytes")
                var result: ConversionResult? = null
                val elapsed = measureTimeMillis {
                    tickProgress(0.38f, "Converting to clean Markdown")
                    result = conversionEngine.convert(uri, fileName, fileSize)
                }

                val converted = result!!.copy(conversionTimeMs = elapsed)
                tickProgress(0.72f, "Structuring markdown sections")
                tickProgress(0.9f, "Preparing preview")
                historyRepository.addToHistory(converted.toHistoryItem())

                _uiState.update {
                    it.copy(
                        screen = MdifyScreen.Preview,
                        currentResult = converted,
                        markdownDraft = converted.markdown,
                        processingProgress = 1f,
                        processingStatus = "Ready",
                        pendingMessage = "Conversion complete"
                    )
                }
                
                if (_uiState.value.appSettings.notificationsEnabled) {
                    notificationHelper.showConversionSuccessNotification(converted.fileName)
                }
            } catch (error: Exception) {
                _uiState.update {
                    it.copy(
                        screen = MdifyScreen.Home,
                        processingProgress = 0f,
                        pendingMessage = error.message ?: "Failed to convert file"
                    )
                }
            }
        }
    }

    private suspend fun tickProgress(progress: Float, status: String) {
        _uiState.update {
            it.copy(
                processingProgress = progress,
                processingStatus = status
            )
        }
    }

    fun openHistoryItem(item: ConversionHistoryItem) {
        _uiState.update {
            it.copy(
                screen = MdifyScreen.Preview,
                currentResult = item.toResult(),
                markdownDraft = item.markdown
            )
        }
    }

    fun goHome() {
        _uiState.update { it.copy(screen = MdifyScreen.Home) }
    }

    fun showPrivacyPolicy() {
        _uiState.update { it.copy(screen = MdifyScreen.PrivacyPolicy) }
    }

    fun updateMarkdown(markdown: String) {
        _uiState.update { state ->
            state.copy(
                markdownDraft = markdown,
                currentResult = state.currentResult?.copy(markdown = markdown)
            )
        }
    }

    fun setPreviewMode(mode: PreviewMode) {
        _uiState.update { it.copy(previewMode = mode) }
    }

    fun requestShare() {
        _uiState.update { it.copy(shareRequestKey = System.currentTimeMillis()) }
    }

    fun onShareHandled() {
        _uiState.update { it.copy(shareRequestKey = 0L) }
    }

    fun exportMarkdownTo(uri: Uri) {
        val markdown = _uiState.value.currentResult?.markdown ?: return
        viewModelScope.launch {
            appContext.contentResolver.openOutputStream(uri)?.bufferedWriter()?.use {
                it.write(markdown)
            }
            toast("Markdown exported")
        }
    }

    fun removeHistoryItem(item: ConversionHistoryItem) {
        viewModelScope.launch {
            historyRepository.remove(item.id)
        }
    }

    fun clearHistory() {
        viewModelScope.launch {
            historyRepository.clear()
            toast("Recent files cleared")
        }
    }

    fun toast(message: String) {
        _uiState.update { it.copy(pendingMessage = message) }
    }

    fun consumeMessage() {
        _uiState.update { it.copy(pendingMessage = null) }
    }

    fun showSettings() {
        _uiState.update { it.copy(screen = MdifyScreen.Settings) }
    }

    fun updateTheme(theme: ThemePreference) {
        viewModelScope.launch {
            settingsRepository.updateTheme(theme)
        }
    }

    fun updateNotificationsEnabled(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.updateNotifications(enabled)
        }
    }

    fun updateGeminiApiKey(key: String) {
        viewModelScope.launch {
            settingsRepository.updateGeminiApiKey(key)
        }
    }

    fun restructureWithAi() {
        var apiKey = _uiState.value.appSettings.geminiApiKey
        if (apiKey.isBlank()) {
            apiKey = BuildConfig.GEMINI_API_KEY
        }
        
        if (apiKey.isBlank()) {
            toast("Please set your Gemini API key in Settings or local.properties")
            return
        }

        val today = java.time.LocalDate.now().toString()
        val usageDate = _uiState.value.appSettings.aiUsageDate
        val usageCount = _uiState.value.appSettings.aiUsageCount

        if (usageDate == today && usageCount >= 3) {
            toast("AI limit reached for today (max 3 times)")
            return
        }

        val currentMarkdown = _uiState.value.markdownDraft
        if (currentMarkdown.isBlank()) return

        _uiState.update { it.copy(isAiProcessing = true) }

        viewModelScope.launch {
            try {
                val generativeModel = com.google.ai.client.generativeai.GenerativeModel(
                    modelName = "gemini-2.5-flash-lite",
                    apiKey = apiKey
                )
                
                val prompt = "Please restructure and clean up the following Markdown content to be well-formatted, professional, and easily readable. Only return the markdown code without extra conversational text:\n\n$currentMarkdown"
                val response = generativeModel.generateContent(prompt)
                val newMarkdown = response.text ?: currentMarkdown

                // Remove markdown code block backticks if present
                val cleanedMarkdown = newMarkdown.removePrefix("```markdown").removePrefix("```").removeSuffix("```").trim()

                updateMarkdown(cleanedMarkdown)
                settingsRepository.recordAiUsage()
                toast("AI Restructure Complete")
            } catch (e: Exception) {
                toast("AI error: ${e.message}")
            } finally {
                _uiState.update { it.copy(isAiProcessing = false) }
            }
        }
    }
}
