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
import com.mdify.app.ui.screens.ProcessingScreen

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
    onClearHistory: () -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        when (state.screen) {
            MdifyScreen.Home -> HomeScreen(
                history = state.history,
                onUploadClick = onPickFile,
                onRecentSelected = onRecentSelected,
                onDeleteHistoryItem = onDeleteHistoryItem,
                onClearHistory = onClearHistory
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
                    onExport = onExport
                )
            }
        }
    }
}
