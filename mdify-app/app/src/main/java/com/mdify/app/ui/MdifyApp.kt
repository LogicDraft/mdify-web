package com.mdify.app.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
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

// Defines the navigation depth for each screen so we can choose the correct
// slide direction: forward → slide left, back → slide right.
private fun MdifyScreen.depth(): Int = when (this) {
    MdifyScreen.Home         -> 0
    MdifyScreen.Processing   -> 1
    MdifyScreen.Preview      -> 1
    MdifyScreen.Settings     -> 1
    MdifyScreen.LookAndFeel  -> 2
    MdifyScreen.About        -> 2
    MdifyScreen.PrivacyPolicy -> 3
}

private const val DURATION = 380

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
    onAiRestructure: () -> Unit,
    onAppResetClick: () -> Unit,
    onLookAndFeelClick: () -> Unit,
    onAboutClick: () -> Unit,
    onDynamicColorsChange: (Boolean) -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        AnimatedContent(
            targetState = state.screen,
            transitionSpec = {
                val targetDepth  = targetState.depth()
                val initialDepth = initialState.depth()

                if (targetDepth == initialDepth) {
                    // Same depth — crossfade only (e.g. Processing → Preview)
                    fadeIn(tween(DURATION, easing = FastOutSlowInEasing)) togetherWith
                        fadeOut(tween(DURATION, easing = FastOutSlowInEasing))
                } else if (targetDepth > initialDepth) {
                    // Navigating forward → slide in from right, old exits left
                    (slideInHorizontally(
                        tween(DURATION, easing = FastOutSlowInEasing)
                    ) { it / 4 } + fadeIn(tween(DURATION))) togetherWith
                        (slideOutHorizontally(
                            tween(DURATION, easing = FastOutSlowInEasing)
                        ) { -it / 4 } + fadeOut(tween(DURATION / 2)))
                } else {
                    // Navigating back → slide in from left, old exits right
                    (slideInHorizontally(
                        tween(DURATION, easing = FastOutSlowInEasing)
                    ) { -it / 4 } + fadeIn(tween(DURATION))) togetherWith
                        (slideOutHorizontally(
                            tween(DURATION, easing = FastOutSlowInEasing)
                        ) { it / 4 } + fadeOut(tween(DURATION / 2)))
                }
            },
            label = "screen_transition"
        ) { screen ->
            when (screen) {
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
                    onNotificationsChange = onNotificationsChange,
                    onAppResetClick = onAppResetClick,
                    onLookAndFeelClick = onLookAndFeelClick,
                    onAboutClick = onAboutClick
                )

                MdifyScreen.LookAndFeel -> com.mdify.app.ui.screens.LookAndFeelScreen(
                    settings = state.appSettings,
                    onBack = onBack,
                    onThemeChange = onThemeChange,
                    onDynamicColorsChange = onDynamicColorsChange
                )

                MdifyScreen.About -> com.mdify.app.ui.screens.AboutScreen(
                    settings = state.appSettings,
                    onBack = onBack,
                    onPrivacyPolicyClick = onShowPrivacyPolicy
                )
            }
        }
    }
}
