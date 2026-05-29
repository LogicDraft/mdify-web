package com.mdify.app

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts.CreateDocument
import androidx.activity.result.contract.ActivityResultContracts.OpenDocument
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.FileProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mdify.app.ui.MdifyApp
import com.mdify.app.ui.theme.MDifyTheme
import java.io.File
import android.os.Build
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val viewModel: MdifyViewModel = viewModel()
            val state by viewModel.uiState.collectAsState()
            
            MDifyTheme(appSettings = state.appSettings) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(MaterialTheme.colorScheme.background)
                    ) {
                        MdifyRoot(viewModel = viewModel, state = state)
                    }
                }
            }
        }
    }
}

@Composable
private fun MdifyRoot(viewModel: MdifyViewModel, state: com.mdify.app.model.UiState) {
    val context = LocalContext.current

    val filePicker = rememberLauncherForActivityResult(
        contract = OpenDocument(),
        onResult = { uri ->
            uri?.let { viewModel.pickDocument(it) }
        }
    )

    val exportLauncher = rememberLauncherForActivityResult(
        contract = CreateDocument("text/markdown"),
        onResult = { uri ->
            uri?.let { viewModel.exportMarkdownTo(it) }
        }
    )

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = RequestPermission(),
        onResult = { _ -> }
    )

    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    androidx.activity.compose.BackHandler(enabled = state.screen != com.mdify.app.model.MdifyScreen.Home) {
        viewModel.goHome()
    }

    LaunchedEffect(state.pendingMessage) {
        state.pendingMessage?.let { message ->
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
            viewModel.consumeMessage()
        }
    }

    LaunchedEffect(state.shareRequestKey) {
        val result = state.currentResult ?: return@LaunchedEffect
        val markdown = result.markdown
        if (state.shareRequestKey == 0L) return@LaunchedEffect
        shareMarkdown(context, result.fileName, markdown)
        viewModel.onShareHandled()
    }

    val onUploadClick = remember {
        {
            filePicker.launch(
                arrayOf(
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                )
            )
        }
    }

    val onCopyClick = remember(state.currentResult?.markdown) {
        {
            val markdown = state.currentResult?.markdown
            if (markdown != null) {
                copyMarkdown(context, markdown)
                viewModel.toast("Markdown copied")
            }
        }
    }

    val onExportClick = remember(state.currentResult?.fileName) {
        {
            val fileName = state.currentResult?.fileName
                ?.substringBeforeLast(".")
                ?.plus(".md")
                ?: "mdify-export.md"
            exportLauncher.launch(fileName)
        }
    }

    AnimatedContent(
        targetState = state.screen,
        transitionSpec = { fadeIn(tween(220)) togetherWith fadeOut(tween(180)) },
        label = "mdify-screen"
    ) { _ ->
        MdifyApp(
            state = state,
            onPickFile = onUploadClick,
            onRecentSelected = viewModel::openHistoryItem,
            onBack = viewModel::goHome,
            onMarkdownChange = viewModel::updateMarkdown,
            onCopy = onCopyClick,
            onExport = onExportClick,
            onShare = viewModel::requestShare,
            onTogglePreviewMode = viewModel::setPreviewMode,
            onDeleteHistoryItem = viewModel::removeHistoryItem,
            onClearHistory = viewModel::clearHistory,
            onShowPrivacyPolicy = viewModel::showPrivacyPolicy,
            onSettingsClick = viewModel::showSettings,
            onThemeChange = viewModel::updateTheme,
            onNotificationsChange = viewModel::updateNotificationsEnabled,
            onGeminiApiKeyChange = viewModel::updateGeminiApiKey,
            onAiRestructure = viewModel::restructureWithAi
        )
    }
}

private fun copyMarkdown(context: Context, markdown: String) {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    clipboard.setPrimaryClip(ClipData.newPlainText("MDify Markdown", markdown))
}

private fun shareMarkdown(context: Context, fileName: String, markdown: String) {
    val cacheFile = File(context.cacheDir, "${fileName.substringBeforeLast(".")}.md")
    cacheFile.writeText(markdown)
    val uri: Uri = FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        cacheFile
    )

    val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/markdown"
        putExtra(Intent.EXTRA_STREAM, uri)
        putExtra(Intent.EXTRA_TEXT, markdown.take(600))
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }

    context.startActivity(Intent.createChooser(intent, "Share Markdown"))
}
