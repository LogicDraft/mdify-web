package com.mdify.app.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.mdify.app.model.MdifyScreen
import com.mdify.app.model.PreviewMode
import com.mdify.app.model.UiState
import com.mdify.app.ui.screens.HomeScreen
import com.mdify.app.ui.screens.PreviewScreen
import com.mdify.app.ui.screens.PrivacyPolicyScreen
import com.mdify.app.ui.screens.ProcessingScreen
import com.mdify.app.ui.screens.SettingsScreen
import com.mdify.app.data.ThemePreference

@Composable
fun MdifyApp(
    state: UiState,
    onPickFile: () -> Unit,
    onRecentSelected: (com.mdify.app.model.ConversionHistoryItem) -> Unit,
    onBack: () -> Unit,
    onMarkdownChange: (String) -> Unit,
    onCopy: () -> Unit,
    onExport: () -> Unit,
    onShare: () -> Unit,
    onTogglePreviewMode: (PreviewMode) -> Unit,
    onDeleteHistoryItem: (com.mdify.app.model.ConversionHistoryItem) -> Unit,
    onClearHistory: () -> Unit,
    onShowPrivacyPolicy: () -> Unit,
    onSettingsClick: () -> Unit,
    onThemeChange: (ThemePreference) -> Unit,
    onNotificationsChange: (Boolean) -> Unit,
    onGeminiApiKeyChange: (String) -> Unit,
    onAiRestructure: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        when (state.screen) {
            MdifyScreen.Home -> HomeScreen(
                history = state.history,
                onUploadClick = onPickFile,
                onRecentSelected = onRecentSelected,
                onDeleteHistoryItem = onDeleteHistoryItem,
                onClearHistory = onClearHistory,
                onSettingsClick = onSettingsClick
            )

            MdifyScreen.Processing -> ProcessingScreen(
                fileName = state.processingFileName,
                status = state.processingStatus,
                progress = state.processingProgress
            )

            MdifyScreen.Preview -> state.currentResult?.let { result ->
                PreviewScreen(
                    result = result.copy(markdown = state.markdownDraft),
                    previewMode = state.previewMode,
                    onBack = onBack,
                    onMarkdownChange = onMarkdownChange,
                    onModeChange = onTogglePreviewMode,
                    onCopy = onCopy,
                    onShare = onShare,
                    onExport = onExport,
                    isAiProcessing = state.isAiProcessing,
                    onAiRestructure = onAiRestructure
                )
            }
            
            MdifyScreen.PrivacyPolicy -> PrivacyPolicyScreen(onBack = onBack)
            
            MdifyScreen.Settings -> SettingsScreen(
                settings = state.appSettings,
                onBack = onBack,
                onThemeChange = onThemeChange,
                onNotificationsChange = onNotificationsChange,
                onGeminiApiKeyChange = onGeminiApiKeyChange,
                onPrivacyPolicyClick = onShowPrivacyPolicy
            )
        }
    }
}
